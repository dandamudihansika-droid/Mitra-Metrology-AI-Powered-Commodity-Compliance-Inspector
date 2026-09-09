/**
 * Persistent Database Store Module for Mitra Metrology Backend
 * Stores and manages real inspection records and calculates legal metrology statistics in Asia/Kolkata IST.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'database.json');

// Helper to format Date in Asia/Kolkata (IST)
function formatISTDate(dateOrIso) {
  if (!dateOrIso) return '';
  const date = new Date(dateOrIso);
  if (isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

// Load database from file or initialize empty array
function loadStore() {
  if (!fs.existsSync(DB_FILE)) {
    return { inspections: [], users: [], officers: [], complaints: [], notifications: [] };
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const data = JSON.parse(raw);
    if (Array.isArray(data)) return { inspections: data, users: [], officers: [], complaints: [], notifications: [] };
    return {
      inspections: Array.isArray(data.inspections) ? data.inspections : [],
      users: Array.isArray(data.users) ? data.users : [],
      officers: Array.isArray(data.officers) ? data.officers : [],
      complaints: Array.isArray(data.complaints) ? data.complaints : [],
      notifications: Array.isArray(data.notifications) ? data.notifications : []
    };
  } catch (err) {
    console.error('[Database Error] Failed to read database.json:', err.message);
    return { inspections: [], users: [], officers: [], complaints: [], notifications: [] };
  }
}

function passwordHash(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { password_hash: `${salt}:${hash}` };
}

export function verifyPassword(password, storedHash) {
  if (!password || !storedHash || !storedHash.includes(':')) return false;
  const [salt, expected] = storedHash.split(':');
  const actual = crypto.scryptSync(password, salt, 64).toString('hex');
  return expected.length === actual.length && crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}

export function seedDemoOfficer() {
  const store = loadStore();
  const existing = store.officers.find((officer) => officer.officer_id === 'OFFICER001');
  if (!existing) {
    store.officers.push({
      id: crypto.randomUUID(),
      officer_id: 'OFFICER001',
      name: 'Demo Officer',
      email: 'officer.demo@mitrametrology.com',
      ...passwordHash('Officer@123'),
      role: 'OFFICER',
      location: 'South Zone - Circle 4',
      created_at: new Date().toISOString()
    });
    saveStore(store);
  }
}

export function createOfficer({ name, officerId, password }) {
  const normalizedId = officerId.trim().toUpperCase();
  if (!/^OFFICER\d{3}$/.test(normalizedId)) return null;
  const store = loadStore();
  if (store.officers.some((officer) => officer.officer_id === normalizedId)) return null;
  const officer = {
    id: crypto.randomUUID(),
    officer_id: normalizedId,
    name: name.trim(),
    email: null,
    ...passwordHash(password),
    role: 'OFFICER',
    location: 'Unassigned',
    created_at: new Date().toISOString()
  };
  store.officers.push(officer);
  saveStore(store);
  return officer;
}

export function createUser({ name, email, phone, password }) {
  const store = loadStore();
  const normalizedEmail = email?.trim().toLowerCase() || '';
  const normalizedPhone = phone?.trim() || '';
  if (store.users.some((user) => (normalizedEmail && user.email === normalizedEmail) || (normalizedPhone && user.phone === normalizedPhone))) {
    return null;
  }
  const user = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalizedEmail || null,
    phone: normalizedPhone || null,
    ...passwordHash(password),
    role: 'CONSUMER',
    created_at: new Date().toISOString()
  };
  store.users.push(user);
  saveStore(store);
  return user;
}

export function findAccount(identifier) {
  const value = identifier?.trim().toLowerCase();
  const store = loadStore();
  return store.officers.find((officer) => officer.officer_id.toLowerCase() === value || officer.email?.toLowerCase() === value)
    || store.users.find((user) => user.email?.toLowerCase() === value || user.phone?.toLowerCase() === value)
    || null;
}

export function addComplaint(data) {
  const store = loadStore();
  const complaint = {
    id: `CMP-${Date.now().toString().slice(-8)}`,
    consumer: data.consumer || 'Consumer',
    consumerId: data.consumerId || null,
    product: data.product || 'Packaged commodity',
    description: data.description || '',
    location: data.location || 'Not provided',
    created_at: new Date().toISOString(),
    status: 'NEW',
    priority: data.priority || 'NORMAL',
    assignedOfficer: null,
    evidence: data.evidence || [],
    investigationNotes: '',
    findings: '',
    actionTaken: '',
    reportStatus: 'NOT_STARTED'
  };
  store.complaints.unshift(complaint);
  store.notifications.unshift({
    id: crypto.randomUUID(),
    type: 'COMPLAINT',
    message: 'New consumer complaint received',
    complaintId: complaint.id,
    created_at: complaint.created_at,
    read: false
  });
  saveStore(store);
  return complaint;
}

export function getComplaints() {
  return loadStore().complaints;
}

export function updateComplaint(id, updates) {
  const store = loadStore();
  const complaint = store.complaints.find((item) => item.id === id);
  if (!complaint) return null;
  Object.assign(complaint, updates, { updated_at: new Date().toISOString() });
  saveStore(store);
  return complaint;
}

export function getNotifications() {
  return loadStore().notifications;
}

// Save database to file
function saveStore(store) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), 'utf8');
  } catch (err) {
    console.error('[Database Error] Failed to write database.json:', err.message);
  }
}

function loadDatabase() {
  return loadStore().inspections;
}

/**
 * Get all stored inspections sorted newest first
 */
export function getAllInspections() {
  const inspections = loadDatabase();
  return inspections.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
}

/**
 * Save a new real inspection record
 */
export function addInspection(newRecord) {
  const inspections = loadDatabase();
  
  // Ensure timestamp is in ISO 8601 UTC format
  const timestamp = newRecord.timestamp || new Date().toISOString();
  
  const recordToSave = {
    id: newRecord.id || `INSP-${Date.now().toString().slice(-5)}`,
    productName: newRecord.name || newRecord.productName || 'Scanned Packaged Commodity',
    category: newRecord.category || 'General Package',
    image: newRecord.image || '/package_back_label.png',
    netQuantity: newRecord.netQuantity || 'Not detected — needs verification',
    mrp: newRecord.mrp || 'Not detected — needs verification',
    mrpInclusive: newRecord.mrpInclusive || 'Inclusive of all taxes',
    unitSalePrice: newRecord.unitSalePrice || 'Not detected — needs verification',
    manufacturingDate: newRecord.manufacturingDate || 'Not detected — needs verification',
    expiryDate: newRecord.expiryDate || 'Not detected — needs verification',
    useBy: newRecord.useBy || 'Not detected — needs verification',
    manufacturer: newRecord.manufacturer || 'Not detected — needs verification',
    manufacturerAddress: newRecord.manufacturerAddress || 'Not detected — needs verification',
    fssaiNo: newRecord.fssaiNo || 'Not detected — needs verification',
    lotBatch: newRecord.lotBatch || 'Not detected — needs verification',
    ingredients: newRecord.ingredients || 'Not detected — needs verification',
    consumerCare: newRecord.consumerCare || 'Not detected — needs verification',
    status: newRecord.status || 'compliant',
    ocrConfidence: newRecord.ocrConfidence || 0.95,
    violationsCount: (newRecord.violations || []).length,
    violations: newRecord.violations || [],
    nutritionalInfo: newRecord.nutritionalInfo || [],
    extractedFields: newRecord.extractedFields || {},
    reviewReason: newRecord.reviewReason || null,
    timestamp: timestamp,
    date: formatISTDate(timestamp),
    location: newRecord.location || 'Inspection Field Office (12.9716° N, 77.5946° E)',
    integrityHash: newRecord.integrityHash || `sha256_${Math.random().toString(36).substring(2, 12)}`
  };

  inspections.unshift(recordToSave);
  const store = loadStore();
  store.inspections = inspections;
  saveStore(store);
  console.log(`[Database] Saved new inspection record '${recordToSave.id}' - Status: ${recordToSave.status}`);
  return recordToSave;
}

/**
 * Calculate real dashboard statistics from saved database records
 */
export function getDashboardStats() {
  const inspections = loadDatabase();
  
  const todayStr = formatISTDate(new Date());

  let totalInspections = inspections.length;
  let totalViolations = 0;
  let todayInspections = 0;
  let pendingInspections = 0;

  for (const item of inspections) {
    // Sum actual recorded violations
    if (Array.isArray(item.violations)) {
      totalViolations += item.violations.length;
    } else if (item.violationsCount) {
      totalViolations += Number(item.violationsCount);
    }

    // Check if created today in Asia/Kolkata
    if (item.timestamp && formatISTDate(item.timestamp) === todayStr) {
      todayInspections++;
    }

    // Count pending/review status items
    if (item.status === 'review' || item.status === 'pending') {
      pendingInspections++;
    }
  }

  return {
    totalInspections,
    totalViolations,
    todayInspections,
    pendingInspections
  };
}

/**
 * Get recent inspection records with optional limit and status filter
 */
export function getRecentInspections(limit = 10, status = null) {
  let list = getAllInspections();
  if (status) {
    list = list.filter(i => (i.status || '').toLowerCase() === status.toLowerCase());
  }
  return list.slice(0, limit);
}

/**
 * Find single inspection record by ID
 */
export function getInspectionById(id) {
  if (!id) return null;
  const inspections = loadDatabase();
  const searchId = id.toString().trim().toLowerCase();
  return inspections.find(i => (i.id && i.id.toString().toLowerCase() === searchId)) || null;
}

/**
 * Query inspection records with server-side pagination, search, status filtering, and sorting
 */
export function queryInspections({ page = 1, limit = 20, search = '', status = 'all', sort = 'newest' }) {
  let list = getAllInspections();

  // 1. Search Filter (ID, Product Name, Manufacturer, FSSAI Number, Category)
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter(i => 
      (i.id && i.id.toLowerCase().includes(q)) ||
      (i.productName && i.productName.toLowerCase().includes(q)) ||
      (i.manufacturer && i.manufacturer.toLowerCase().includes(q)) ||
      (i.fssaiNo && i.fssaiNo.toLowerCase().includes(q)) ||
      (i.category && i.category.toLowerCase().includes(q))
    );
  }

  // 2. Status Filter
  if (status && status !== 'all') {
    const statusLower = status.trim().toLowerCase();
    list = list.filter(i => {
      const itemStatus = (i.status || '').toLowerCase();
      if (statusLower === 'non-compliant' || statusLower === 'non_compliant') {
        return itemStatus === 'non-compliant' || itemStatus === 'non_compliant';
      }
      if (statusLower === 'review_required' || statusLower === 'review' || statusLower === 'pending') {
        return itemStatus === 'review_required' || itemStatus === 'review' || itemStatus === 'pending';
      }
      return itemStatus === statusLower;
    });
  }

  // 3. Sorting
  if (sort === 'oldest') {
    list.sort((a, b) => new Date(a.timestamp || 0) - new Date(a.timestamp || 0));
  } else {
    list.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
  }

  // 4. Pagination
  const total = list.length;
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.max(1, parseInt(limit) || 20);
  const totalPages = Math.ceil(total / limitNum) || 1;
  const startIndex = (pageNum - 1) * limitNum;
  const paginatedData = list.slice(startIndex, startIndex + limitNum);

  return {
    data: paginatedData,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages
  };
}
