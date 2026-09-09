import { createWorker } from 'tesseract.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function testOCR() {
  console.log('Testing Sharp Image Preprocessing & Tesseract OCR...');
  const imagePath = 'C:/Users/HANSIKA/.gemini/antigravity-ide/brain/62a5f391-f1d7-473c-acaa-09d5f23d598f/media__1788958152566.jpg';
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

  const worker = await createWorker('eng');
  const ret = await worker.recognize(preprocessedBuffer);
  
  console.log('--- OCR RECOGNITION COMPLETE ---');
  console.log('Text Output:\n', ret.data.text);
  console.log('Confidence:', ret.data.confidence);
  console.log('Line count:', ret.data.lines ? ret.data.lines.length : 0);
  
  if (ret.data.lines && ret.data.lines.length > 0) {
    console.log('\n--- EXTRACTED LINES WITH BBOX ---');
    ret.data.lines.forEach((line, idx) => {
      if (line.text.trim().length > 0) {
        console.log(`Line ${idx+1} [Conf: ${line.confidence}%]: "${line.text.trim()}" bbox:`, line.bbox);
      }
    });
  }

  await worker.terminate();
}

testOCR().catch(err => console.error('Test OCR Error:', err));
