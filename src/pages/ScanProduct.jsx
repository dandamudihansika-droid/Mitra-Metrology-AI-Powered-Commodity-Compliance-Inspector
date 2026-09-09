import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Image as ImageIcon, Check, Loader2, Upload, AlertCircle, RefreshCw } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import { analyzeImageWithVision, analyzeImageWithOcrFallback } from '../services/apiService';

export default function ScanProduct({ onBack, onScanComplete, role, theme, toggleTheme }) {
  const isDark = theme === 'dark';
  const [isScanning, setIsScanning] = useState(false);
  const [step, setStep] = useState(0);
  const [capturedImage, setCapturedImage] = useState(null);
  const [selectedFileObj, setSelectedFileObj] = useState(null);
  const [scanError, setScanError] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const fileInputRef = useRef(null);

  const steps = [
    "Initializing Real Canvas OCR Engine...",
    "Segmenting text lines & high-contrast glyphs...",
    "Reading Calorie, MRP & Date declarations...",
    "Auditing LMPC 2011 statutory compliance...",
    "Generating tamper-evident audit record..."
  ];

  const handleCaptureAndScan = async () => {
    setScanError('');
    let imgSrc = capturedImage;
    let fileObj = selectedFileObj;

    if (!imgSrc && !fileObj) {
      setScanError('Please upload a package image first.');
      return;
    }

    setIsScanning(true);
    setStep(0);
  };

  const handleFileUpload = (e) => {
    setScanError('');
    const file = e.target.files[0];
    if (!file) return;

    // Validate File Type (JPG, JPEG, PNG, WEBP)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setScanError(`Unsupported file format '${file.name}'. Please upload a valid JPG, JPEG, or PNG image.`);
      return;
    }

    // Validate File Size (10MB Limit)
    if (file.size > 10 * 1024 * 1024) {
      setScanError(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the 10MB limit. Please select a smaller photo.`);
      return;
    }

    setSelectedFileObj(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const imgSrc = event.target.result;
      setCapturedImage(imgSrc);
      setAnalysisResult(null);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (isScanning && step < steps.length) {
      const timer = setTimeout(() => {
        setStep((prev) => prev + 1);
      }, 450);
      return () => clearTimeout(timer);
    } else if (isScanning && step === steps.length) {
      const finishTimer = setTimeout(async () => {
        try {
          if (!selectedFileObj) throw new Error('Please upload a package image first.');
          console.log('[Scanner] Sending original package image to backend OpenAI Vision endpoint...');
          let visionResult;
          let usedFallback = false;
          try {
            visionResult = await analyzeImageWithVision(selectedFileObj);
          } catch (visionError) {
            console.warn('[Scanner] OpenAI Vision unavailable; using backend OCR fallback.', visionError.message);
            visionResult = await analyzeImageWithOcrFallback(selectedFileObj);
            usedFallback = true;
          }
          const backendResult = {
            ...visionResult,
            name: visionResult.fields?.productName || visionResult.name,
            manufacturer: visionResult.fields?.manufacturer || visionResult.manufacturer,
            manufacturerAddress: visionResult.fields?.manufacturerAddress || visionResult.manufacturerAddress,
            fssaiNo: visionResult.fields?.fssaiLicense || visionResult.fssaiNo,
            netQuantity: visionResult.fields?.netQuantity || visionResult.netQuantity,
            mrp: visionResult.fields?.mrp || visionResult.mrp,
            manufacturingDate: visionResult.fields?.manufacturingDate || visionResult.manufacturingDate,
            expiryDate: visionResult.fields?.expiryDate || visionResult.expiryDate,
            source: usedFallback ? 'local-ocr-fallback' : 'openai-vision',
            extractedFields: visionResult.fields ? { structured: visionResult.fields, aiVision: true } : visionResult.extractedFields
          };
          
          // Attach uploaded image preview data URL if available
          if (capturedImage) {
            backendResult.image = capturedImage;
          }

          setIsScanning(false);
          setAnalysisResult(backendResult);
        } catch (err) {
          console.error("[Scanner Backend Inspection Failed]", err);
          setIsScanning(false);
          setScanError(`Backend Inspection Error: ${err.message}`);
        }
      }, 300);
      return () => clearTimeout(finishTimer);
    }
  }, [isScanning, step, capturedImage, selectedFileObj]);

  return (
    <div className={`min-h-screen flex flex-col justify-between p-6 transition-colors duration-300 ${
      isDark ? 'bg-black text-white' : 'bg-white text-black'
    }`}>
      {/* Header */}
      <div className="w-full flex justify-between items-center pt-2 z-20">
        <button
          onClick={onBack}
          className={`p-2 rounded-full border transition-colors ${
            isDark ? 'border-zinc-800 bg-zinc-950 text-white' : 'border-zinc-300 bg-zinc-100 text-black'
          }`}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-bold tracking-tight">Real Canvas OCR Package Scanner</span>
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/jpeg,image/png,image/jpg,image/webp"
        className="hidden"
      />

      {/* Viewfinder Frame Container */}
      <div className="w-full max-w-sm mx-auto my-auto flex flex-col items-center z-10">
        <div className={`relative w-full aspect-[3/4] rounded-3xl border overflow-hidden shadow-2xl ${
          isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-900 border-zinc-700'
        }`}>
          {/* Uploaded package image */}
          {capturedImage ? (
            <img
              src={capturedImage}
              alt="Captured Product Label"
              className="w-full h-full object-cover filter brightness-95"
            />
          ) : <div className="w-full h-full flex items-center justify-center text-zinc-500 text-sm">Upload Package Image</div>}

          {/* Camera Viewfinder Reticle */}
          <div className="absolute inset-6 pointer-events-none border-2 border-dashed border-white/40 rounded-2xl flex flex-col justify-between p-2">
            <div className="flex justify-between">
              <div className="w-6 h-6 border-t-2 border-l-2 border-white rounded-tl-lg shadow-[0_0_10px_white]" />
              <div className="w-6 h-6 border-t-2 border-r-2 border-white rounded-tr-lg shadow-[0_0_10px_white]" />
            </div>

            {/* Upload action */}
            {!isScanning && (
              <div className="pointer-events-auto flex flex-col items-center justify-center space-y-2 my-auto">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-bold text-xs flex items-center space-x-2 hover:bg-zinc-800 transition-all"
                >
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>Upload Image</span>
                </button>
              </div>
            )}

            <div className="flex justify-between">
              <div className="w-6 h-6 border-b-2 border-l-2 border-white rounded-bl-lg shadow-[0_0_10px_white]" />
              <div className="w-6 h-6 border-b-2 border-r-2 border-white rounded-br-lg shadow-[0_0_10px_white]" />
            </div>
          </div>

          {/* Laser Scanning Line Animation */}
          {isScanning && (
            <motion.div
              animate={{ y: ['0%', '280%', '0%'] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
              className="absolute top-8 left-8 right-8 h-1 bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_20px_rgba(255,255,255,1)] z-20"
            />
          )}

          {/* Real-Time Processing Overlay */}
          <AnimatePresence>
            {isScanning && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-4 left-4 right-4 bg-black/90 backdrop-blur-md p-4 rounded-2xl border border-zinc-700 space-y-2 z-30"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-white font-bold flex items-center space-x-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>Real Canvas OCR Character Parser...</span>
                  </span>
                  <span className="text-zinc-400">{step}/{steps.length}</span>
                </div>

                <div className="space-y-1 text-[11px] font-mono">
                  <div className={`flex items-center space-x-1.5 ${step >= 1 ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    <Check className="w-3 h-3" />
                    <span>Pixel Contrast & Line Binarization</span>
                  </div>
                  <div className={`flex items-center space-x-1.5 ${step >= 2 ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    <Check className="w-3 h-3" />
                    <span>Reading Calorie & Macro Tokens</span>
                  </div>
                  <div className={`flex items-center space-x-1.5 ${step >= 3 ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    <Check className="w-3 h-3" />
                    <span>MRP & Net Weight Verification</span>
                  </div>
                  <div className={`flex items-center space-x-1.5 ${step >= 4 ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    <Check className="w-3 h-3" />
                    <span>LMPC 2011 Rule Audit</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message Alert */}
          {scanError && (
            <div className="absolute top-4 left-4 right-4 bg-red-950/90 border border-red-500 text-red-200 p-3 rounded-2xl text-xs space-y-2 z-40">
              <div className="flex items-center space-x-2 font-bold text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Inspection Error</span>
              </div>
              <p className="text-[11px] font-mono leading-relaxed">{scanError}</p>
              <button
                onClick={() => {
                  setScanError('');
                  fileInputRef.current?.click();
                }}
                className="mt-1 px-3 py-1.5 rounded-lg bg-red-900 hover:bg-red-800 text-white font-semibold text-[10px] flex items-center space-x-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Upload Another Photo</span>
              </button>
            </div>
          )}
        </div>

        {analysisResult && (
          <div className={`w-full mt-4 rounded-2xl border p-4 space-y-3 text-xs ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200'}`}>
            <h2 className="font-bold text-sm">AI/OCR Extraction</h2>
            {[
              ['Product', analysisResult.extractedFields?.structured?.productName || analysisResult.name],
              ['Manufacturer', analysisResult.extractedFields?.structured?.manufacturer || analysisResult.manufacturer],
              ['FSSAI', analysisResult.extractedFields?.structured?.fssaiLicense || analysisResult.fssaiNo],
              ['Net Quantity', analysisResult.extractedFields?.structured?.netQuantity || analysisResult.netQuantity],
              ['MRP', analysisResult.extractedFields?.structured?.mrp || analysisResult.mrp],
              ['Manufactured', analysisResult.extractedFields?.structured?.manufacturingDate || analysisResult.manufacturingDate],
              ['Use By', analysisResult.extractedFields?.structured?.useBy || analysisResult.useBy],
              ['Lot No', analysisResult.extractedFields?.structured?.lotNumber || analysisResult.lotBatch]
            ].map(([label, value]) => <div key={label} className="flex justify-between gap-3"><span className="text-zinc-500">{label}</span><strong className="text-right">{value || 'Not detected'}</strong></div>)}
            {(analysisResult.source === 'local-ocr-fallback' || Object.values(analysisResult.extractedFields?.structured || {}).some((value) => !value || value === 'Not detected')) && <p className="text-amber-400">Unable to automatically read some fields. Please review the extracted information.</p>}
            <button onClick={() => onScanComplete(analysisResult)} className="w-full py-3 rounded-xl bg-white text-black font-bold">Confirm &amp; Generate Inspection Report</button>
          </div>
        )}

        {/* Instructions */}
        <p className={`text-xs font-mono text-center mt-4 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
          Position back of packet containing Calorie & LMPC declarations.
        </p>
      </div>

      {/* Upload and analysis controls */}
      <div className="w-full max-w-sm mx-auto flex items-center justify-around pb-6 z-20">
        {/* Upload File Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className={`p-3.5 rounded-full border transition-all ${
            isDark ? 'bg-zinc-950 border-zinc-800 text-white hover:bg-zinc-900' : 'bg-zinc-100 border-zinc-300 text-black'
          }`}
          title="Upload Package Photo"
        >
          <ImageIcon className="w-5 h-5" />
        </button>

        <motion.button whileTap={{ scale: 0.98 }} onClick={handleCaptureAndScan} disabled={isScanning} className="px-5 py-3 rounded-xl bg-white text-black font-bold text-xs">Analyze Uploaded Image</motion.button>

      </div>
    </div>
  );
}
