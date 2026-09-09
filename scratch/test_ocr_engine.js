import createWorker from 'tesseract.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function testOCR() {
  console.log('Testing Sharp Image Preprocessing & Tesseract OCR...');
  const imagePath = 'C:/Users/HANSIKA/.gemini/antigravity/scratch/mitra-metrology/public/package_back_label.png';
  if (!fs.existsSync(imagePath)) {
    console.error('Image file not found:', imagePath);
    return;
  }

  const rawBuffer = fs.readFileSync(imagePath);
  console.log('Loaded raw image buffer:', rawBuffer.length, 'bytes');

  // Preprocess with Sharp
  const preprocessedBuffer = await sharp(rawBuffer)
    .resize({ width: 1600, fit: 'inside', withoutEnlargement: false })
    .grayscale()
    .normalize()
    .sharpen()
    .toBuffer();

  console.log('Preprocessed image buffer:', preprocessedBuffer.length, 'bytes');

  const worker = await createWorker.createWorker('eng');
  const ret = await worker.recognize(preprocessedBuffer);
  
  console.log('--- OCR RECOGNITION COMPLETE ---');
  console.log('Text Output:\n', ret.data.text);
  console.log('Confidence:', ret.data.confidence);
  console.log('Line count:', ret.data.lines ? ret.data.lines.length : 0);
  
  if (ret.data.lines && ret.data.lines.length > 0) {
    console.log('First 3 lines with bbox:');
    ret.data.lines.slice(0, 3).forEach((line, idx) => {
      console.log(`Line ${idx+1}: "${line.text.trim()}" (conf: ${line.confidence}) bbox:`, line.bbox);
    });
  }

  await worker.terminate();
}

testOCR().catch(err => console.error('Test OCR Error:', err));
