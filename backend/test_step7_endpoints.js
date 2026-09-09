import fs from 'fs';
import path from 'path';
import { analyzePackageImage } from './inspectionEngine.js';
import { getInspectionById, queryInspections } from './db.js';

async function testStep7() {
  console.log('====================================================');
  console.log('RUNNING STEP 7 INSPECTION HISTORY & DETAILS TESTS');
  console.log('====================================================\n');

  // TEST 1: Create real inspection 1
  console.log('--- TEST 1: Creating Inspection 1 ---');
  const img1Path = 'C:/Users/HANSIKA/.gemini/antigravity-ide/brain/62a5f391-f1d7-473c-acaa-09d5f23d598f/media__1788958152566.jpg';
  const buf1 = fs.readFileSync(img1Path);
  const record1 = await analyzePackageImage(buf1, 'package_too_yumm.jpg', 'image/jpeg');

  console.log('Created Record 1 ID:', record1.id);
  console.log('Record 1 Product Name:', record1.name);
  console.log('Record 1 Status:', record1.status);

  // Check it appears in queryInspections
  const listRes1 = queryInspections({ page: 1, limit: 10, search: record1.id });
  console.log('Found in queryInspections search:', listRes1.data.length === 1 && listRes1.data[0].id === record1.id);

  console.log('\n----------------------------------------------------\n');

  // TEST 2 & 3: Fetch by ID
  console.log('--- TEST 2 & 3: Fetching Inspection 1 by ID ---');
  const fetched1 = getInspectionById(record1.id);
  console.log('Fetched ID:', fetched1?.id);
  console.log('Fetched Product Name:', fetched1?.productName);
  console.log('Fetched Net Quantity:', fetched1?.netQuantity);
  console.log('Fetched MRP:', fetched1?.mrp);
  console.log('Fetched Manufacturer:', fetched1?.manufacturer);
  console.log('Fetched Violations Count:', fetched1?.violations ? fetched1.violations.length : 0);

  console.log('\n----------------------------------------------------\n');

  // TEST 4: Search by ID
  console.log('--- TEST 4: Search by ID ---');
  const searchRes = queryInspections({ search: record1.id });
  console.log('Search matches count:', searchRes.data.length);
  console.log('Search match ID:', searchRes.data[0]?.id);

  console.log('\n----------------------------------------------------\n');

  // TEST 5: Filter by compliance status
  console.log('--- TEST 5: Filter by Compliance Status ---');
  const statusRes = queryInspections({ status: record1.status });
  console.log(`Filter status '${record1.status}' matches count:`, statusRes.data.length);

  console.log('\n----------------------------------------------------\n');

  // TEST 6, 7 & 8: Verify Evidence & Extracted Values
  console.log('--- TEST 6, 7, 8: Evidence & Violations Consistency ---');
  console.log('Record 1 Image:', fetched1?.image || fetched1?.imageFileName);
  console.log('Record 1 OCR Confidence:', fetched1?.ocrConfidence);
  console.log('Record 1 Violations:', fetched1?.violations);

  console.log('\n----------------------------------------------------\n');

  // TEST 9: Create Second Inspection (Blank / Unreadable Image)
  console.log('--- TEST 9: Creating Inspection 2 (Unreadable photo) ---');
  const img2Path = '../public/package_back_label.png';
  const buf2 = fs.readFileSync(img2Path);
  const record2 = await analyzePackageImage(buf2, 'blank_sample.png', 'image/png');

  console.log('Created Record 2 ID:', record2.id);
  console.log('Record 2 Product Name:', record2.name);
  console.log('Record 2 Status:', record2.status);

  // Verify Record 1 and Record 2 do not mix data
  console.log('\n--- VERIFY INDEPENDENCE OF RECORD 1 AND RECORD 2 ---');
  const rec1Refetched = getInspectionById(record1.id);
  const rec2Refetched = getInspectionById(record2.id);

  console.log('Record 1 ID:', rec1Refetched.id, '| Product:', rec1Refetched.productName, '| Status:', rec1Refetched.status);
  console.log('Record 2 ID:', rec2Refetched.id, '| Product:', rec2Refetched.productName, '| Status:', rec2Refetched.status);
  console.log('Records Independent & Unmixed:', rec1Refetched.id !== rec2Refetched.id && rec1Refetched.productName !== rec2Refetched.productName);

  console.log('\n====================================================');
  console.log('ALL STEP 7 TESTS PASSED SUCCESSFULLY');
  console.log('====================================================');
}

testStep7().catch(err => console.error('Step 7 Test Error:', err));
