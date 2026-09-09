import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import multer from 'multer';
import { analyzePackageImage, analyzeImageWithOpenAiVision } from './inspectionEngine.js';
import {
  getDashboardStats, queryInspections, getInspectionById, seedDemoOfficer, createOfficer,
  createUser, findAccount, verifyPassword, addComplaint, getComplaints,
  updateComplaint, getNotifications
} from './db.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5000;
seedDemoOfficer();

function publicAccount(account) {
  if (!account) return null;
  const { password_hash, ...safeAccount } = account;
  return safeAccount;
}

function sessionFor(account) {
  const safeAccount = publicAccount(account);
  return {
    sessionToken: crypto.randomBytes(32).toString('hex'),
    ...safeAccount,
    officerId: safeAccount.officer_id || undefined,
    officerName: safeAccount.name,
    zone: safeAccount.location || undefined,
    badge: safeAccount.role,
    mobile: safeAccount.phone || undefined,
    authenticatedAt: new Date().toISOString()
  };
}

app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body || {};
    if (!name || (!email && !phone) || !password || password !== confirmPassword) {
      return res.status(400).json({ success: false, error: 'Name, email or phone, and matching passwords are required.' });
    }
    if (email && !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ success: false, error: 'Enter a valid email address.' });
    const user = createUser({ name, email, phone, password });
    if (!user) return res.status(409).json({ success: false, error: 'An account already exists for that email or phone.' });
    return res.status(201).json({ success: true, session: sessionFor(user) });
  } catch (err) {
    console.error('[Auth Register Error]', err.message);
    return res.status(500).json({ success: false, error: 'Unable to create account.' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { identifier, password } = req.body || {};
    if (!identifier || !password) return res.status(400).json({ success: false, error: 'Email, phone, or officer ID and password are required.' });
    const account = findAccount(identifier);
    if (!account || !verifyPassword(password, account.password_hash)) return res.status(401).json({ success: false, error: 'Invalid login credentials.' });
    return res.json({ success: true, session: sessionFor(account) });
  } catch (err) {
    console.error('[Auth Login Error]', err.message);
    return res.status(500).json({ success: false, error: 'Unable to authenticate.' });
  }
});

app.post('/api/auth/register-officer', (req, res) => {
  try {
    const { name, officerId, password, confirmPassword } = req.body || {};
    if (!name || !officerId || !password || password !== confirmPassword) {
      return res.status(400).json({ success: false, error: 'Full name, valid officer ID, and matching passwords are required.' });
    }
    if (!/^OFFICER\d{3}$/i.test(officerId.trim())) {
      return res.status(400).json({ success: false, error: 'Officer ID must match OFFICER001 through OFFICER999.' });
    }
    const officer = createOfficer({ name, officerId, password });
    if (!officer) return res.status(409).json({ success: false, error: 'That officer ID is already registered.' });
    return res.status(201).json({ success: true, session: sessionFor(officer) });
  } catch (err) {
    console.error('[Officer Register Error]', err.message);
    return res.status(500).json({ success: false, error: 'Unable to create officer account.' });
  }
});

app.post('/api/complaints', (req, res) => {
  try { return res.status(201).json({ success: true, data: addComplaint(req.body || {}) }); }
  catch (err) { console.error('[Complaint Create Error]', err.message); return res.status(500).json({ success: false, error: 'Unable to save complaint.' }); }
});

app.get('/api/complaints', (req, res) => res.json({ success: true, data: getComplaints(), notifications: getNotifications() }));

app.patch('/api/complaints/:id', (req, res) => {
  const complaint = updateComplaint(req.params.id, req.body || {});
  if (!complaint) return res.status(404).json({ success: false, error: 'Complaint not found.' });
  return res.json({ success: true, data: complaint });
});

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: (req, file, cb) => cb(null, ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.mimetype.toLowerCase())) });

app.post('/api/vision/analyze', (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err) return res.status(400).json({ success: false, error: 'Image upload validation failed.' });
    try {
      if (!req.file) return res.status(400).json({ success: false, error: 'No image file uploaded.' });
      const fields = await analyzeImageWithOpenAiVision(req.file.buffer, req.file.mimetype);
      return res.json({ success: true, data: { fields, source: 'openai-vision', violations: [], status: 'REVIEW_REQUIRED' } });
    } catch (error) {
      console.error('[Vision API Error]', error.message);
      return res.status(502).json({ success: false, error: 'Unable to analyze image with OpenAI Vision.' });
    }
  });
});

app.post('/api/inspect/upload', (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err) return res.status(400).json({ success: false, error: 'Image upload validation failed.' });
    try {
      let fileBuffer; let filename = 'uploaded_package.png'; let mimeType = 'image/png';
      if (req.file) { fileBuffer = req.file.buffer; filename = req.file.originalname; mimeType = req.file.mimetype; }
      else if (req.body?.imageBase64) { fileBuffer = Buffer.from(req.body.imageBase64.replace(/^data:image\/\w+;base64,/, ''), 'base64'); filename = req.body.filename || 'captured_canvas.jpg'; mimeType = req.body.mimeType || 'image/jpeg'; }
      else return res.status(400).json({ success: false, error: 'No image file uploaded.' });
      const result = await analyzePackageImage(fileBuffer, filename, mimeType);
      return res.json({ success: true, message: 'Package inspection complete.', timestamp: result.timestamp, data: result });
    } catch (error) { console.error('[Inspection Error]', error.message); return res.status(422).json({ success: false, error: `Inspection failed: ${error.message}` }); }
  });
});

app.get('/api/dashboard/stats', (req, res) => res.json({ success: true, data: getDashboardStats() }));
app.get('/api/inspections', (req, res) => {
  const result = queryInspections({ page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 20, search: req.query.search || '', status: req.query.status || 'all', sort: req.query.sort || 'newest' });
  return res.json({ success: true, count: result.data.length, ...result });
});
app.get('/api/inspections/:id', (req, res) => {
  const record = getInspectionById(req.params.id);
  if (!record) return res.status(404).json({ success: false, error: 'Inspection not found.' });
  return res.json({ success: true, data: record });
});

const server = app.listen(PORT, () => console.log(`Mitra Metrology backend running on port ${PORT}`));
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.log(`Mitra Metrology backend is already running on port ${PORT}. Reuse the existing server.`);
    process.exit(0);
  }
  console.error('[Backend Server Error]', error.message);
  process.exit(1);
});
