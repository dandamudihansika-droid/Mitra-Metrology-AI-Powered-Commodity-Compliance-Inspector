/**
 * Frontend API Integration Service
 * Mitra Metrology — Legal Metrology & Packaged Commodity Platform
 */

const BACKEND_URL = 'http://localhost:5000';

export async function analyzeImageWithVision(file) {
  const formData = new FormData();
  formData.append('image', file, file.name || 'package-image.jpg');
  const response = await fetch(`${BACKEND_URL}/api/vision/analyze`, { method: 'POST', body: formData });
  const data = await response.json();
  if (!response.ok || !data.success) throw new Error(data.error || 'OpenAI Vision analysis failed.');
  return data.data;
}

export async function analyzeImageWithOcrFallback(file) {
  return uploadAndInspectImage(file, file.name || 'package-image.jpg');
}

/**
 * Uploads a packaged commodity label image to the backend Express server
 * @param {File|Blob|string} imageInput - File object, Blob, or Data URL string
 * @param {string} filename - Optional file name
 * @returns {Promise<Object>} Extracted inspection result object
 */
export async function uploadAndInspectImage(imageInput, filename = 'package_label.png') {
  const formData = new FormData();

  if (imageInput instanceof File || imageInput instanceof Blob) {
    formData.append('image', imageInput, filename);
  } else if (typeof imageInput === 'string' && imageInput.startsWith('data:')) {
    // Convert base64 data URL to Blob for multipart upload
    const response = await fetch(imageInput);
    const blob = await response.blob();
    formData.append('image', blob, filename);
  } else {
    throw new Error('Invalid image input format. Please select a valid JPG, JPEG, or PNG file.');
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/inspect/upload`, {
      method: 'POST',
      body: formData,
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json.error || `Server responded with status ${res.status}`);
    }

    return json.data;
  } catch (err) {
    console.error('[API Service Error] Image inspection request failed:', err.message);
    throw new Error(err.message || 'Failed to connect to Legal Metrology backend inspection server.');
  }
}

/**
 * Fetches real dashboard inspection statistics calculated by the backend
 * @returns {Promise<Object>} { totalInspections, totalViolations, todayInspections, pendingInspections }
 */
export async function fetchDashboardStats() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/dashboard/stats`);
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || `Failed to fetch stats (Status ${res.status})`);
    }
    return json.data;
  } catch (err) {
    console.error('[API Service Error] fetchDashboardStats failed:', err.message);
    throw err;
  }
}

/**
 * Query inspection audit log records with backend search, filter, sorting, and pagination
 */
export async function fetchRecentInspections(limit = 20, status = null, search = '', page = 1, sort = 'newest') {
  try {
    let url = `${BACKEND_URL}/api/inspections?limit=${limit}&page=${page}&sort=${sort}`;
    if (status && status !== 'all') url += `&status=${encodeURIComponent(status)}`;
    if (search && search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;
    
    const res = await fetch(url);
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || `Failed to fetch inspections (Status ${res.status})`);
    }
    return json;
  } catch (err) {
    console.error('[API Service Error] fetchRecentInspections failed:', err.message);
    throw err;
  }
}

/**
 * Fetches a single inspection record by ID from backend database
 * @param {string} id - Inspection ID
 * @returns {Promise<Object>} Inspection record object
 */
export async function fetchInspectionById(id) {
  if (!id) throw new Error('Inspection ID is required.');
  try {
    const res = await fetch(`${BACKEND_URL}/api/inspections/${encodeURIComponent(id)}`);
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || `Inspection '${id}' not found (Status ${res.status})`);
    }
    return json.data;
  } catch (err) {
    console.error(`[API Service Error] fetchInspectionById('${id}') failed:`, err.message);
    throw err;
  }
}
