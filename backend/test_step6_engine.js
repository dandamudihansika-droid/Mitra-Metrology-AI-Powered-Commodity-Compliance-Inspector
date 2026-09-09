import fs from 'fs';
import path from 'path';
import { analyzePackageImage } from './inspectionEngine.js';

async function runStep6Tests() {
  console.log('====================================================');
  console.log('RUNNING STEP 6 REAL OCR & COMPLIANCE ENGINE TESTS');
  console.log('====================================================\n');

  // TEST 1: Package with visible MRP, Net Qty, Manufacturer, FSSAI, Dates, Nutrition (Too Yumm packet)
  console.log('--- TEST 1: Full Package Back Label Photo ---');
  const img1Path = 'C:/Users/HANSIKA/.gemini/antigravity-ide/brain/62a5f391-f1d7-473c-acaa-09d5f23d598f/media__1788958152566.jpg';
  if (fs.existsSync(img1Path)) {
    const buf1 = fs.readFileSync(img1Path);
    const res1 = await analyzePackageImage(buf1, 'too_yumm_back.jpg', 'image/jpeg');
    console.log('Result 1 Product:', res1.name);
    console.log('Result 1 Category:', res1.category);
    console.log('Result 1 Net Quantity:', res1.netQuantity);
    console.log('Result 1 MRP:', res1.mrp);
    console.log('Result 1 FSSAI:', res1.fssaiNo);
    console.log('Result 1 Manufacturer:', res1.manufacturer);
    console.log('Result 1 Consumer Care:', res1.consumerCare);
    console.log('Result 1 Calories (kcal):', res1.caloriesKcal);
    console.log('Result 1 Status:', res1.status);
    console.log('Result 1 Violations Count:', res1.violations.length);
    console.log('Result 1 Nutritional Info:', res1.nutritionalInfo);
  } else {
    console.log('Test image 1 not found at:', img1Path);
  }

  console.log('\n----------------------------------------------------\n');

  // TEST 2: Package with missing declarations or blank label
  console.log('--- TEST 2: Blank / Unreadable Label Image ---');
  const img2Path = '../public/package_back_label.png';
  if (fs.existsSync(img2Path)) {
    const buf2 = fs.readFileSync(img2Path);
    const res2 = await analyzePackageImage(buf2, 'blank_label.png', 'image/png');
    console.log('Result 2 Product:', res2.name);
    console.log('Result 2 Net Quantity:', res2.netQuantity);
    console.log('Result 2 MRP:', res2.mrp);
    console.log('Result 2 Calories (kcal):', res2.caloriesKcal);
    console.log('Result 2 Status:', res2.status);
    console.log('Result 2 Violations Count:', res2.violations.length);
    console.log('Result 2 Review Reason:', res2.reviewReason || 'None');
  }

  console.log('\n====================================================');
  console.log('STEP 6 TESTS COMPLETED');
  console.log('====================================================');
}

runStep6Tests().catch(err => console.error('Step 6 Test Error:', err));
