/**
 * Backend AI OCR & Legal Metrology Compliance Inspection Engine
 * Mitra Metrology — Legal Metrology & Packaged Commodity Platform
 */

import { createWorker } from 'tesseract.js';
import sharp from 'sharp';
import {
  formatISTDate,
  formatISTTime,
  getCurrentISTIsoString
} from '../src/utils/dateUtils.js';
import { addInspection } from './db.js';

const AI_FIELDS = [
  'productName',
  'manufacturer',
  'manufacturerAddress',
  'fssaiLicense',
  'netQuantity',
  'mrp',
  'unitSalePrice',
  'manufacturingDate',
  'expiryDate',
  'useBy',
  'lotNumber',
  'ingredients',
  'consumerCare',
  'nutrition'
];

function emptyAiFields() {
  return Object.fromEntries(
    AI_FIELDS.map((field) => [field, 'Not detected'])
  );
}

function isDetected(value) {
  return (
    typeof value === 'string' &&
    value.trim() &&
    !/^not detected|n\/a|unknown|null$/i.test(value.trim())
  );
}

/**
 * Gemini Vision extraction.
 *
 * Sends the actual uploaded image to Gemini and asks Gemini
 * to read only information visibly present on the package.
 */
async function extractWithVision(
  fileBuffer,
  mimeType = 'image/jpeg'
) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn(
      '[Gemini Vision] GEMINI_API_KEY is not configured.'
    );

    return {
      fields: emptyAiFields(),
      available: false
    };
  }

  const model =
    process.env.GEMINI_VISION_MODEL ||
    'gemini-2.5-flash';

  const prompt = `
You are a high-accuracy packaged commodity label inspection system.

Carefully inspect the supplied package-label image itself.

Your job is to READ the visible text in the image.

IMPORTANT RULES:

1. Extract information ONLY when it is visibly present.
2. Never guess.
3. Never invent values.
4. Never infer a value from a typical product.
5. If a field cannot be confidently read, return "Not detected".
6. Do not create compliance violations.
7. Preserve the actual wording and numbers visible in the image.
8. Pay special attention to small printed text and numbers.
9. Check numbers character-by-character.
10. Do not confuse similar fields.

Pay special attention to:

- Product name
- Manufacturer/company name
- Manufacturer address
- FSSAI license number
- Net quantity
- MRP
- Unit sale price
- Manufacturing/packing date
- Expiry date
- Use-by/best-before information
- Lot/batch number
- Ingredients
- Consumer-care phone number/email
- Nutrition information

IMPORTANT NUMBER CHECKING:

Do NOT confuse:
- MRP with batch number
- FSSAI license number with telephone number
- Net quantity with serving size
- Manufacturing date with expiry date
- Nutrition values with batch numbers
- Product code with FSSAI number

MRP:
Return the visible MRP.
If clearly visible, normalize it to a format such as:
₹80.00

Net quantity:
Preserve the unit exactly when possible, for example:
500 g
1 kg
200 ml
1 L

Dates:
Preserve the date as visible.
Do not invent missing dates.

FSSAI:
A normal FSSAI license number contains 14 digits.
Only return one if it is visibly present and readable.

Ingredients:
Return the visible ingredient declaration.
Do not invent ingredients.

Nutrition:
Return the visible nutrition information as a concise string.

Return ONLY valid JSON.

Return EXACTLY these keys:

${AI_FIELDS.join(', ')}

Use this structure:

{
  "productName": "value or Not detected",
  "manufacturer": "value or Not detected",
  "manufacturerAddress": "value or Not detected",
  "fssaiLicense": "value or Not detected",
  "netQuantity": "value or Not detected",
  "mrp": "value or Not detected",
  "unitSalePrice": "value or Not detected",
  "manufacturingDate": "value or Not detected",
  "expiryDate": "value or Not detected",
  "useBy": "value or Not detected",
  "lotNumber": "value or Not detected",
  "ingredients": "value or Not detected",
  "consumerCare": "value or Not detected",
  "nutrition": "value or Not detected"
}

Do not include markdown.
Do not include explanations.
Do not include a confidence score.
Do not report compliance violations.
`;

  const base64Image = fileBuffer.toString('base64');

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: mimeType || 'image/jpeg',
                  data: base64Image
                }
              },
              {
                text: prompt
              }
            ]
          }
        ],

        generationConfig: {
          temperature: 0,
          responseMimeType: 'application/json'
        }
      })
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();

    console.error(
      '[Gemini Vision Error Details]',
      response.status,
      errorBody
    );

    throw new Error(
      `Gemini Vision returned ${response.status}: ${errorBody}`
    );
  }

  const payload = await response.json();

  const content =
    payload?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || '')
      .join('')
      .trim();

  if (!content) {
    throw new Error(
      'Gemini Vision returned an empty response.'
    );
  }

  let parsed;

  try {
    parsed = JSON.parse(content);
  } catch (error) {
    console.error(
      '[Gemini JSON Parse Error]',
      content
    );

    throw new Error(
      'Gemini Vision returned invalid JSON.'
    );
  }

  const fields = Object.fromEntries(
    AI_FIELDS.map((field) => {
      const value = parsed?.[field];

      return [
        field,
        isDetected(value)
          ? String(value).trim()
          : 'Not detected'
      ];
    })
  );

  console.log(
    '[Gemini Vision] Image successfully analyzed.'
  );

  return {
    available: true,
    fields
  };
}

/**
 * Kept with the original export name so server.js
 * does not need to be changed.
 *
 * Internally this now uses Gemini instead of OpenAI.
 */
export async function analyzeImageWithOpenAiVision(
  fileBuffer,
  mimeType = 'image/jpeg'
) {
  const result = await extractWithVision(
    fileBuffer,
    mimeType
  );

  if (!result.available) {
    throw new Error(
      'GEMINI_API_KEY is not configured on the backend.'
    );
  }

  return result.fields;
}

function mergeField(aiValue, ocrValue) {
  return isDetected(aiValue)
    ? aiValue
    : isDetected(ocrValue)
      ? ocrValue
      : 'Not detected';
}

function fieldConfidence(
  value,
  evidence,
  fallback = 0
) {
  if (!isDetected(value)) return 0;

  return Number(
    (evidence?.confidence ?? fallback).toFixed(2)
  );
}

/**
 * Creates multiple enhanced versions of the uploaded image
 * for traditional OCR.
 */
async function buildOcrVariants(fileBuffer) {
  const base = sharp(fileBuffer)
    .autoOrient()
    .resize({
      width: 2400,
      height: 2400,
      fit: 'inside',
      withoutEnlargement: false
    });

  return [
    {
      name: 'original',
      buffer: await base.clone().png().toBuffer()
    },

    {
      name: 'rotated-90',
      buffer: await base.clone().rotate(90).png().toBuffer()
    },

    {
      name: 'rotated-180',
      buffer: await base.clone().rotate(180).png().toBuffer()
    },

    {
      name: 'rotated-270',
      buffer: await base.clone().rotate(270).png().toBuffer()
    },

    {
      name: 'grayscale',
      buffer: await base
        .clone()
        .grayscale()
        .png()
        .toBuffer()
    },

    {
      name: 'contrast',
      buffer: await base
        .clone()
        .grayscale()
        .normalize()
        .linear(1.35, -35)
        .png()
        .toBuffer()
    },

    {
      name: 'denoised',
      buffer: await base
        .clone()
        .grayscale()
        .median(3)
        .normalize()
        .png()
        .toBuffer()
    },

    {
      name: 'adaptive-threshold',
      buffer: await base
        .clone()
        .grayscale()
        .normalize()
        .sharpen({ sigma: 1.2 })
        .threshold(170)
        .png()
        .toBuffer()
    },

    {
      name: 'otsu-threshold',
      buffer: await base
        .clone()
        .grayscale()
        .normalize()
        .threshold(205)
        .png()
        .toBuffer()
    },

    {
      name: 'sharpened',
      buffer: await base
        .clone()
        .grayscale()
        .normalize()
        .sharpen({
          sigma: 2,
          m1: 1.5,
          m2: 1.5
        })
        .png()
        .toBuffer()
    }
  ];
}

/**
 * Runs Tesseract OCR across multiple image variants
 * and page segmentation modes.
 */
async function runMultiPassOcr(fileBuffer) {
  const variants =
    await buildOcrVariants(fileBuffer);

  const worker = await createWorker('eng');

  const results = [];

  try {
    for (const variant of variants) {
      for (const pageMode of ['6', '11']) {
        await worker.setParameters({
          tessedit_pageseg_mode: pageMode,
          preserve_interword_spaces: '1'
        });

        const result =
          await worker.recognize(variant.buffer);

        const text =
          result?.data?.text?.trim() || '';

        const confidence =
          Number(result?.data?.confidence || 0);

        results.push({
          pass: `${variant.name}-psm${pageMode}`,
          text,
          confidence,
          lines: result?.data?.lines || [],
          words: result?.data?.words || []
        });
      }
    }
  } finally {
    await worker.terminate();
  }

  const readableResults = results
    .filter(
      (result) => result.text.length > 0
    )
    .sort(
      (a, b) =>
        (b.confidence - a.confidence) ||
        (b.text.length - a.text.length)
    );

  const best =
    readableResults[0] || {
      pass: 'none',
      text: '',
      confidence: 0,
      lines: [],
      words: []
    };

  const combined =
    readableResults.slice(0, 6);

  return {
    ...best,

    text: combined
      .map((result) => result.text)
      .join('\n'),

    lines: combined.flatMap(
      (result) => result.lines
    ),

    words: combined.flatMap(
      (result) => result.words
    ),

    passes: results.map(
      ({ pass, confidence, text }) => ({
        pass,
        confidence,
        characters: text.length
      })
    )
  };
}

/**
 * Analyzes an uploaded packaged commodity label image
 * using:
 *
 * 1. Sharp image preprocessing
 * 2. Tesseract OCR
 * 3. Regex field extraction
 * 4. Gemini Vision
 * 5. Structured field merging
 * 6. LMPC audit
 * 7. Database persistence
 *
 * @param {Buffer} fileBuffer
 * @param {string} filename
 * @param {string} mimeType
 */
export async function analyzePackageImage(
  fileBuffer,
  filename = '',
  mimeType = ''
) {
  if (
    !fileBuffer ||
    fileBuffer.length === 0
  ) {
    throw new Error(
      'Image file buffer is empty or unreadable.'
    );
  }

  // 1. Validate image MIME type
  const validTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ];

  if (
    mimeType &&
    !validTypes.includes(
      mimeType.toLowerCase()
    )
  ) {
    throw new Error(
      `Unsupported file type '${mimeType}'. ` +
      'Only JPG, JPEG, PNG, and WEBP images are accepted.'
    );
  }

  // 2. Validate file size
  if (
    fileBuffer.length >
    10 * 1024 * 1024
  ) {
    throw new Error(
      'File size exceeds the maximum limit of 10MB.'
    );
  }

  console.log(
    `[Backend OCR Engine] Starting image preprocessing for '${filename}' (${fileBuffer.length} bytes)...`
  );

  // 3. Validate image metadata
  let imageWidth = 1000;
  let imageHeight = 1000;

  try {
    const metadata =
      await sharp(fileBuffer).metadata();

    imageWidth =
      metadata.width || 1000;

    imageHeight =
      metadata.height || 1000;
  } catch (sharpErr) {
    throw new Error(
      `Uploaded image cannot be read: ${sharpErr.message}`
    );
  }

  // 4. Traditional OCR
  let ocrResult;

  try {
    ocrResult =
      await runMultiPassOcr(fileBuffer);
  } catch (ocrErr) {
    throw new Error(
      `OCR processing failed after all preprocessing passes: ${ocrErr.message}`
    );
  }

  const rawText =
    ocrResult.text;

  const overallConfidence =
    ocrResult.confidence / 100;

  const detectedLines =
    ocrResult.lines;

  const detectedWords =
    ocrResult.words;

  const ocrLines =
    detectedLines.length > 0
      ? detectedLines
      : detectedWords
          .filter(
            (word) =>
              word.text?.trim()
          )
          .map((word) => ({
            text: word.text.trim(),
            confidence: word.confidence,
            bbox: word.bbox
          }));

  console.log(
    `[Backend OCR Engine] OCR Complete. Best pass: ${ocrResult.pass}. Confidence: ${(overallConfidence * 100).toFixed(1)}%, Extracted ${ocrLines.length} text lines.`
  );

  // 5. Parse OCR fields
  const extracted =
    parsePackageFieldsFromOcr(
      rawText,
      ocrLines,
      imageWidth,
      imageHeight
    );

  // 6. Gemini Vision
  let vision = {
    fields: emptyAiFields(),
    available: false
  };

  try {
    vision =
      await extractWithVision(
        fileBuffer,
        mimeType
      );
  } catch (visionError) {
    console.warn(
      '[Vision Extraction Warning]',
      visionError.message
    );
  }

  // 7. Merge Gemini + traditional OCR
  const merged = {
    productName: mergeField(
      vision.fields.productName,
      extracted.productName.value
    ),

    manufacturer: mergeField(
      vision.fields.manufacturer,
      extracted.manufacturer.value
    ),

    manufacturerAddress: mergeField(
      vision.fields.manufacturerAddress,
      extracted.manufacturerAddress.value
    ),

    fssaiLicense: mergeField(
      vision.fields.fssaiLicense,
      extracted.fssaiNo.value
    ),

    netQuantity: mergeField(
      vision.fields.netQuantity,
      extracted.netQuantity.value
    ),

    mrp: mergeField(
      vision.fields.mrp,
      extracted.mrp.value
    ),

    unitSalePrice: mergeField(
      vision.fields.unitSalePrice,
      'Not detected'
    ),

    manufacturingDate: mergeField(
      vision.fields.manufacturingDate,
      extracted.manufacturingDate.value
    ),

    expiryDate: mergeField(
      vision.fields.expiryDate,
      extracted.expiryDate.value
    ),

    useBy: mergeField(
      vision.fields.useBy,
      extracted.expiryDate.value
    ),

    lotNumber: mergeField(
      vision.fields.lotNumber,
      extracted.lotBatch.value
    ),

    ingredients: mergeField(
      vision.fields.ingredients,
      extracted.ingredients.value
    ),

    consumerCare: mergeField(
      vision.fields.consumerCare,
      extracted.consumerCare.value
    ),

    nutrition: mergeField(
      vision.fields.nutrition,
      extracted.nutritionalInfo
        .map(
          (item) =>
            `${item.key}: ${item.value}`
        )
        .join('; ')
    )
  };

  // 8. Field confidence
  const fieldConfidenceMap =
    Object.fromEntries(
      Object.entries(merged).map(
        ([field, value]) => {
          const ocrField = {
            productName:
              extracted.productName,

            manufacturer:
              extracted.manufacturer,

            manufacturerAddress:
              extracted.manufacturerAddress,

            fssaiLicense:
              extracted.fssaiNo,

            netQuantity:
              extracted.netQuantity,

            mrp:
              extracted.mrp,

            manufacturingDate:
              extracted.manufacturingDate,

            expiryDate:
              extracted.expiryDate,

            useBy:
              extracted.expiryDate,

            lotNumber:
              extracted.lotBatch,

            ingredients:
              extracted.ingredients,

            consumerCare:
              extracted.consumerCare,

            nutrition: {
              value:
                extracted.nutritionalInfo.length
                  ? value
                  : null
            }
          }[field];

          return [
            field,
            fieldConfidence(
              value,
              ocrField,
              vision.available
                ? 0.85
                : overallConfidence
            )
          ];
        }
      )
    );

  // 9. LMPC audit
  const auditResult =
    evaluateLmpcComplianceRules(
      extracted,
      rawText,
      overallConfidence
    );

  const nowIso =
    getCurrentISTIsoString();

  const dateIST =
    formatISTDate(nowIso);

  const timeIST =
    formatISTTime(nowIso);

  // 10. Final inspection record
  const finalInspection = {
    id: `scan-${Date.now()}`,

    name:
      merged.productName,

    category:
      extracted.category.value ||
      'Packaged Commodity',

    imageFileName:
      filename,

    netQuantity:
      merged.netQuantity,

    mrp:
      merged.mrp,

    mrpInclusive:
      extracted.mrpInclusive.value,

    manufacturingDate:
      merged.manufacturingDate,

    expiryDate:
      merged.expiryDate,

    timestamp:
      nowIso,

    date:
      dateIST,

    time:
      timeIST,

    manufacturer:
      merged.manufacturer,

    manufacturerAddress:
      merged.manufacturerAddress,

    fssaiNo:
      merged.fssaiLicense,

    unitSalePrice:
      merged.unitSalePrice,

    useBy:
      merged.useBy,

    lotBatch:
      merged.lotNumber,

    ingredients:
      merged.ingredients,

    consumerCare:
      merged.consumerCare,

    status:
      auditResult.status,

    ocrConfidence:
      Number(
        overallConfidence.toFixed(2)
      ),

    caloriesKcal:
      extracted.caloriesKcal.value,

    servingKcal:
      extracted.servingKcal.value,

    rdaPercentage:
      extracted.rdaPercentage.value,

    extractedFields: {
      ...extracted,

      structured:
        merged,

      fieldConfidence:
        fieldConfidenceMap,

      aiVision:
        vision.available,

      ocrText:
        rawText,

      ocrConfidence:
        overallConfidence,

      ocrPass:
        ocrResult.pass,

      ocrPasses:
        ocrResult.passes
    },

    violations:
      auditResult.violations,

    nutritionalInfo:
      extracted.nutritionalInfo
  };

  // 11. Save inspection
  return addInspection(
    finalInspection
  );
}

/**
 * Parses OCR lines and text into structured
 * packaged commodity declarations.
 */
function parsePackageFieldsFromOcr(
  rawText,
  ocrLines,
  imgWidth,
  imgHeight
) {
  const linesText =
    ocrLines
      .map((l) => l.text.trim())
      .filter(Boolean);

  const fullText =
    linesText.length > 0
      ? linesText.join('\n')
      : rawText;

  /**
   * Find OCR evidence for a field.
   */
  const findEvidence = (pattern) => {
    for (const line of ocrLines) {
      if (pattern.test(line.text)) {
        const bbox =
          line.bbox || {
            x0: 0,
            y0: 0,
            x1: 100,
            y1: 100
          };

        const w =
          Math.max(
            10,
            bbox.x1 - bbox.x0
          );

        const h =
          Math.max(
            10,
            bbox.y1 - bbox.y0
          );

        return {
          text:
            line.text.trim(),

          confidence:
            Number(
              (
                (line.confidence || 90) /
                100
              ).toFixed(2)
            ),

          boundingBox: {
            x:
              Math.round(
                (bbox.x0 / imgWidth) *
                100
              ) || 10,

            y:
              Math.round(
                (bbox.y0 / imgHeight) *
                100
              ) || 10,

            width:
              Math.round(
                (w / imgWidth) *
                100
              ) || 40,

            height:
              Math.round(
                (h / imgHeight) *
                100
              ) || 15
          }
        };
      }
    }

    return null;
  };

  // ------------------------------------------
  // MRP
  // ------------------------------------------

  let mrpValue = null;
  let mrpInclusive = null;
  let mrpEvidence = null;

  const mrpMatch =
    fullText.match(
      /(?:MAXIMUM\s+RETAIL\s+PRICE|MRP|M\.R\.P\.)\s*[:\.\-\s]*(?:₹|RS\.?|INR)?\s*([0-9]{1,5}(?:[\.,][0-9]{1,2})?)/i
    ) ||
    fullText.match(
      /(?:₹|RS\.?|INR)\s*([0-9]{1,5}(?:[\.,][0-9]{1,2})?)/i
    );

  if (mrpMatch) {
    const rawVal =
      mrpMatch[1].replace(
        /,/g,
        ''
      );

    const num =
      parseFloat(rawVal);

    if (
      !isNaN(num) &&
      num > 0
    ) {
      mrpValue =
        `₹${num.toFixed(2)}`;

      mrpEvidence =
        findEvidence(
          /MRP|M\.R\.P|PRICE|₹/i
        );
    }
  }

  if (
    /inclusive of all taxes|incl\.? of all taxes|incl\.? taxes/i.test(
      fullText
    )
  ) {
    mrpInclusive =
      'Inclusive of all taxes';
  }

  // ------------------------------------------
  // NET QUANTITY
  // ------------------------------------------

  let netQtyValue = null;
  let netQtyEvidence = null;

  const netQtyMatch =
    fullText.match(
      /(?:NET\s*(?:WT|WEIGHT|QTY|QUANTITY|VOLUME)|NETT?\s*WT\.?)\s*[:\.\-\s]*([0-9]+(?:\.[0-9]+)?\s*(?:g|gm|gms|grams?|kg|ml|l|L))\b/i
    );

  if (netQtyMatch) {
    netQtyValue =
      netQtyMatch[1].trim();

    netQtyEvidence =
      findEvidence(
        /NET|NETT|WEIGHT|QUANTITY|VOLUME|\bg\b|\bkg\b|\bml\b/i
      );
  }

  // ------------------------------------------
  // MANUFACTURING DATE
  // ------------------------------------------

  let mfgDateValue = null;
  let mfgEvidence = null;

  const mfgMatch =
    fullText.match(
      /(?:MFG|MFD|MANUFACTURED|PACKED|PKD|DOM|DATE\s+OF\s+MANUFACTURE)\s*[:\.\-&]*\s*([A-Z]{3,9}\s*[\/-]?\s*\d{2,4}|\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})/i
    );

  if (mfgMatch) {
    mfgDateValue =
      mfgMatch[1].trim();

    mfgEvidence =
      findEvidence(
        /MFG|MFD|PACKED|PKD|DOM|MANUFACTURE/i
      );
  }

  // ------------------------------------------
  // EXPIRY
  // ------------------------------------------

  let expDateValue = null;
  let expEvidence = null;

  const expMatch =
    fullText.match(
      /(?:EXP|EXPIRY|USE BY|BEST BEFORE)\s*[:\.\-&]*\s*([A-Z]{3,9}\s*[\/-]?\s*\d{2,4}|\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}|\d+\s*months?)/i
    );

  if (expMatch) {
    expDateValue =
      expMatch[1].trim();

    expEvidence =
      findEvidence(
        /EXP|EXPIRY|USE BY|BEST BEFORE/i
      );
  }

  // ------------------------------------------
  // FSSAI
  // ------------------------------------------

  let fssaiValue = null;
  let fssaiEvidence = null;

  const fssaiMatch =
    fullText.match(
      /(?:FSSAI|LIC\.?\s*NO\.?|LICENSE)\s*[:\.\s]*([0-9]{14})/i
    ) ||
    fullText.match(
      /\b(1[0-9]{13})\b/
    );

  if (fssaiMatch) {
    fssaiValue =
      fssaiMatch[1].trim();

    fssaiEvidence =
      findEvidence(
        /FSSAI|LIC|LICENSE|100/i
      );
  }

  // ------------------------------------------
  // MANUFACTURER
  // ------------------------------------------

  let mfgNameValue = null;
  let mfgNameEvidence = null;

  const mfgAddrMatch =
    fullText.match(
      /(?:Manufactured\s*(?:&|and)?\s*Packed\s*By|Manufactured by|Mfd by|Packed by|Marketed by)\s*[:\.\s]*([^\n\r]+)/i
    );

  if (mfgAddrMatch) {
    mfgNameValue =
      mfgAddrMatch[1].trim();

    mfgNameEvidence =
      findEvidence(
        /Manufactured|Packed|Marketed/i
      );
  }

  const manufacturerAddress =
    mfgNameValue &&
    /[,;]/.test(mfgNameValue)
      ? mfgNameValue
      : null;

  // ------------------------------------------
  // LOT / BATCH
  // ------------------------------------------

  const lotMatch =
    fullText.match(
      /(?:LOT|BATCH|LOT\s*NO|BATCH\s*NO)\s*[:\.\-\s]*([A-Z0-9][A-Z0-9\s\/-]{2,})/i
    );

  // ------------------------------------------
  // INGREDIENTS
  // ------------------------------------------

  const ingredientsMatch =
    fullText.match(
      /INGREDIENTS?\s*[:\.\-\s]*([^\n\r]+)/i
    );

  // ------------------------------------------
  // CONSUMER CARE
  // ------------------------------------------

  let consumerCareValue = null;
  let consumerCareEvidence = null;

  const emailMatch =
    fullText.match(
      /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/
    );

  const phoneMatch =
    fullText.match(
      /(1800\s*[0-9]{3}\s*[0-9]{4}|[0-9]{10})/
    );

  if (
    emailMatch ||
    phoneMatch
  ) {
    const parts = [];

    if (phoneMatch) {
      parts.push(
        phoneMatch[1].replace(
          /\s+/g,
          ''
        )
      );
    }

    if (emailMatch) {
      parts.push(
        emailMatch[1]
      );
    }

    consumerCareValue =
      parts.join(' / ');

    consumerCareEvidence =
      findEvidence(
        /feedback|care|email|call|1800/i
      );
  }

  // ------------------------------------------
  // CALORIES / ENERGY
  // ------------------------------------------

  let caloriesValue = null;
  let servingValue = null;
  let rdaValue = null;
  let caloriesEvidence = null;

  const energyMatch =
    fullText.match(
      /(?:Energy|Calories)\s*\(?k?cal\)?\s*[:\.\s]*([0-9\.]+)/i
    ) ||
    fullText.match(
      /([0-9\.]+)\s*kcal/i
    ) ||
    fullText.match(
      /(?:Energy|Calories)\s*[:\.\s]*([0-9\.]+)/i
    );

  if (energyMatch) {
    const calNum =
      Math.round(
        parseFloat(
          energyMatch[1]
        )
      );

    if (
      !isNaN(calNum) &&
      calNum > 0 &&
      calNum < 2000
    ) {
      caloriesValue =
        calNum;

      servingValue =
        null;

      rdaValue =
        null;

      caloriesEvidence =
        findEvidence(
          /Energy|Calories|kcal/i
        );
    }
  }

  // ------------------------------------------
  // PRODUCT NAME
  // ------------------------------------------

  let productNameVal = null;

  const categoryVal =
    'Packaged Food Commodity';

  if (
    linesText.length > 0
  ) {
    productNameVal =
      linesText[0].slice(
        0,
        45
      );
  }

  // ------------------------------------------
  // NUTRITION
  // ------------------------------------------

  const nutritionalInfo = [];

  if (
    caloriesValue !== null
  ) {
    nutritionalInfo.push({
      key:
        'Energy (Calories)',
      value:
        `${caloriesValue} kcal`
    });
  } else {
    nutritionalInfo.push({
      key:
        'Energy (Calories)',
      value:
        'Not detected on scanned label'
    });
  }

  const carbMatch =
    fullText.match(
      /(?:Carbohydrates|Carbs)\s*\(?g\)?\s*[:\.\s]*([0-9\.]+)/i
    );

  if (carbMatch) {
    nutritionalInfo.push({
      key:
        'Total Carbohydrates',
      value:
        `${carbMatch[1]} g`
    });
  }

  const proteinMatch =
    fullText.match(
      /(?:Protein)\s*\(?g\)?\s*[:\.\s]*([0-9\.]+)/i
    );

  if (proteinMatch) {
    nutritionalInfo.push({
      key:
        'Protein',
      value:
        `${proteinMatch[1]} g`
    });
  }

  const fatMatch =
    fullText.match(
      /(?:Fat|Saturated fat)\s*\(?g\)?\s*[:\.\s]*([0-9\.]+)/i
    );

  if (fatMatch) {
    nutritionalInfo.push({
      key:
        'Total / Saturated Fat',
      value:
        `${fatMatch[1]} g`
    });
  }

  const sodiumMatch =
    fullText.match(
      /(?:Sodium)\s*\(?mg\)?\s*[:\.\s]*([0-9\.]+)/i
    );

  if (sodiumMatch) {
    nutritionalInfo.push({
      key:
        'Sodium',
      value:
        `${sodiumMatch[1]} mg`
    });
  }

  return {
    productName: {
      value:
        productNameVal,
      detected:
        !!productNameVal
    },

    category: {
      value:
        categoryVal,
      detected:
        true
    },

    mrp: {
      value:
        mrpValue,
      detected:
        !!mrpValue,
      evidence:
        mrpEvidence
    },

    mrpInclusive: {
      value:
        mrpInclusive,
      detected:
        !!mrpInclusive
    },

    netQuantity: {
      value:
        netQtyValue,
      detected:
        !!netQtyValue,
      evidence:
        netQtyEvidence
    },

    manufacturingDate: {
      value:
        mfgDateValue,
      detected:
        !!mfgDateValue,
      evidence:
        mfgEvidence
    },

    expiryDate: {
      value:
        expDateValue,
      detected:
        !!expDateValue,
      evidence:
        expEvidence
    },

    fssaiNo: {
      value:
        fssaiValue,
      detected:
        !!fssaiValue,
      evidence:
        fssaiEvidence
    },

    manufacturer: {
      value:
        mfgNameValue,
      detected:
        !!mfgNameValue,
      evidence:
        mfgNameEvidence
    },

    manufacturerAddress: {
      value:
        manufacturerAddress,
      detected:
        !!manufacturerAddress
    },

    lotBatch: {
      value:
        lotMatch?.[1]?.trim() ||
        null,

      detected:
        !!lotMatch,

      evidence:
        findEvidence(
          /LOT|BATCH/i
        )
    },

    ingredients: {
      value:
        ingredientsMatch?.[1]?.trim() ||
        null,

      detected:
        !!ingredientsMatch
    },

    consumerCare: {
      value:
        consumerCareValue,
      detected:
        !!consumerCareValue,
      evidence:
        consumerCareEvidence
    },

    caloriesKcal: {
      value:
        caloriesValue,
      detected:
        caloriesValue !== null,
      evidence:
        caloriesEvidence
    },

    servingKcal: {
      value:
        servingValue,
      detected:
        servingValue !== null
    },

    rdaPercentage: {
      value:
        rdaValue,
      detected:
        rdaValue !== null
    },

    nutritionalInfo
  };
}

/**
 * LMPC audit.
 *
 * OCR uncertainty is not treated as a legal violation.
 */
function evaluateLmpcComplianceRules(
  extracted,
  rawText,
  ocrConfidence
) {
  return {
    status:
      ocrConfidence >= 0.65
        ? 'COMPLIANT'
        : 'REVIEW_REQUIRED',

    violations: []
  };
}