import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileText,
  AlertCircle,
  MapPin,
  Clock,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { usePrintContext } from '../../context/PrintContext.jsx';
import { CAMPUS_XEROX_CENTER } from '../../data/mockData.js';
import { detectPagesFromFile, formatFileSize } from '../../utils/pdfUtils.js';
import api from '../../utils/api.js';

export const NewPrintRequest = () => {
  const navigate = useNavigate();
  const { pricingRates, showToast, refreshStudentRequests } = usePrintContext();

  const [formData, setFormData] = useState({
    documentName: 'Project_Report_Final.pdf',
    fileSize: '2.5 MB',
    pages: 10,
    copies: 1,
    printShop: CAMPUS_XEROX_CENTER.name,
    printType: 'B&W', // 'B&W' | 'Color'
    side: 'Single', // 'Single' | 'Double'
    specialInstructions: '',
  });

  const [isDragging, setIsDragging] = useState(false);
  const [analyzingFile, setAnalyzingFile] = useState(false);
  const [detectionNotice, setDetectionNotice] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Handle Input Changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePagesChange = (e) => {
    const rawVal = e.target.value;
    if (rawVal === '') {
      handleInputChange('pages', '');
      return;
    }
    const val = parseInt(rawVal, 10);
    if (!isNaN(val)) {
      handleInputChange('pages', Math.max(1, Math.min(1000, val)));
    }
  };

  const handleCopiesChange = (e) => {
    const rawVal = e.target.value;
    if (rawVal === '') {
      handleInputChange('copies', '');
      return;
    }
    const val = parseInt(rawVal, 10);
    if (!isNaN(val)) {
      handleInputChange('copies', Math.max(1, Math.min(100, val)));
    }
  };

  // Price Calculation Formula: pages × copies × rate
  const selectedType = formData.printType || 'B&W';
  const selectedSide = formData.side || 'Single';
  const ratePerPage = pricingRates[selectedType]?.[selectedSide] ?? 2.0;
  const numPages = Math.max(1, Number(formData.pages) || 1);
  const numCopies = Math.max(1, Number(formData.copies) || 1);
  const totalSheets = numPages * numCopies;
  const totalAmount = Number((totalSheets * ratePerPage).toFixed(2));

  // Process File Upload and automatically detect pages
  const processUploadedFile = async (file) => {
    if (!file) return;

    setAnalyzingFile(true);
    setError('');

    try {
      const result = await detectPagesFromFile(file);
      const detectedPages = result.pages || 1;
      const formattedSize = result.sizeFormatted || formatFileSize(file.size);

      setFormData((prev) => ({
        ...prev,
        documentName: file.name,
        fileSize: formattedSize,
        pages: detectedPages,
      }));

      setDetectionNotice({
        pages: detectedPages,
        fileName: file.name,
      });

      showToast(`Uploaded ${file.name} (${detectedPages} pages)`, 'success');
    } catch (err) {
      console.error('File analysis error:', err);
      setFormData((prev) => ({
        ...prev,
        documentName: file.name,
        fileSize: formatFileSize(file.size),
      }));
    } finally {
      setAnalyzingFile(false);
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.documentName.trim()) {
      setError('Please provide a document name or upload a file.');
      return;
    }

    if (numPages <= 0 || numCopies <= 0) {
      setError('Pages and copies must be at least 1.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        shopId: CAMPUS_XEROX_CENTER.id, // 'shop-main'
        documentName: formData.documentName.trim(),
        pages: numPages,
        copies: numCopies,
        printType: formData.printType || 'B&W',
        side: formData.side || 'Single',
        fileSize: formData.fileSize || '1.0 MB',
        specialInstructions: formData.specialInstructions.trim(),
        paymentMethod: 'Campus Card / UPI',
      };

      const createdRequest = await api.createPrintRequest(payload);
      if (refreshStudentRequests) {
        refreshStudentRequests();
      }
      showToast(
        `Print request ${createdRequest?.id || ''} submitted successfully!`,
        'success'
      );
      navigate('/my-requests');
    } catch (err) {
      setError(err?.message || 'Failed to submit print request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Simple Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          New Print Request
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Upload your document and submit your print job directly to the campus Xerox center.
        </p>
      </div>

      {/* Campus Shop Notice */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-900">{CAMPUS_XEROX_CENTER.name}</div>
            <div className="text-slate-500 flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{CAMPUS_XEROX_CENTER.location}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-500 shrink-0">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{CAMPUS_XEROX_CENTER.timing}</span>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form and Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Form: 2 cols */}
        <div className="lg:col-span-2 space-y-5">
          {/* Upload Box */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
            <h2 className="text-sm font-semibold text-slate-900">1. Document</h2>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                isDragging
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
              }`}
            >
              <input
                id="document-file-input"
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                onChange={handleFileInputChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                  {analyzingFile ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Upload className="w-5 h-5" />
                  )}
                </div>
                <p className="text-xs sm:text-sm font-medium text-slate-800">
                  {analyzingFile ? 'Detecting pages...' : 'Click to browse or drag and drop file'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  PDF, Word, PPT, or Images (PDF pages automatically detected)
                </p>
              </div>
            </div>

            {detectionNotice && (
              <div className="p-2.5 rounded-lg bg-green-50 border border-green-200 flex items-center gap-2 text-xs text-green-800">
                <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                <span className="truncate">
                  {detectionNotice.fileName} — <strong>{detectionNotice.pages} pages</strong> auto-detected
                </span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Document Name
              </label>
              <input
                id="document-name-input"
                type="text"
                required
                value={formData.documentName}
                onChange={(e) => handleInputChange('documentName', e.target.value)}
                placeholder="e.g. Assignment_1.pdf"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Print Preferences */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
            <h2 className="text-sm font-semibold text-slate-900">2. Print Options</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Print Type */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Print Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    id="type-bw-btn"
                    onClick={() => handleInputChange('printType', 'B&W')}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium transition-colors cursor-pointer text-center ${
                      formData.printType === 'B&W'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Black & White
                    <span className="block text-[10px] text-slate-500 mt-0.5">
                      ₹{pricingRates['B&W'][formData.side || 'Single']}/pg
                    </span>
                  </button>

                  <button
                    type="button"
                    id="type-color-btn"
                    onClick={() => handleInputChange('printType', 'Color')}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium transition-colors cursor-pointer text-center ${
                      formData.printType === 'Color'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Color
                    <span className="block text-[10px] text-slate-500 mt-0.5">
                      ₹{pricingRates['Color'][formData.side || 'Single']}/pg
                    </span>
                  </button>
                </div>
              </div>

              {/* Side */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Side Layout
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    id="side-single-btn"
                    onClick={() => handleInputChange('side', 'Single')}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium transition-colors cursor-pointer text-center ${
                      formData.side === 'Single'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Single Sided
                    <span className="block text-[10px] text-slate-500 mt-0.5">
                      1 side / sheet
                    </span>
                  </button>

                  <button
                    type="button"
                    id="side-double-btn"
                    onClick={() => handleInputChange('side', 'Double')}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium transition-colors cursor-pointer text-center ${
                      formData.side === 'Double'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Double Sided
                    <span className="block text-[10px] text-slate-500 mt-0.5">
                      Back-to-back
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Pages & Copies */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Number of Pages
                </label>
                <input
                  id="input-pages"
                  type="number"
                  min="1"
                  max="1000"
                  required
                  value={formData.pages}
                  onChange={handlePagesChange}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Number of Copies
                </label>
                <input
                  id="input-copies"
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={formData.copies}
                  onChange={handleCopiesChange}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Special Instructions */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Special Instructions <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                id="special-instructions-input"
                rows={2}
                value={formData.specialInstructions}
                onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                placeholder="e.g. Staple top-left, spiral binding, front page in color..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Right Summary Column: 1 col */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-semibold text-slate-900 pb-3 border-b border-slate-100">
              Print Summary
            </h2>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Print Shop:</span>
                <span className="font-medium text-slate-900 text-right">Campus Xerox</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Print Type:</span>
                <span className="font-medium text-slate-900">{formData.printType}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Side:</span>
                <span className="font-medium text-slate-900">{formData.side}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Pages:</span>
                <span className="font-medium text-slate-900">{numPages}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Copies:</span>
                <span className="font-medium text-slate-900">{numCopies}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Rate per Page:</span>
                <span className="font-medium text-slate-900">₹{ratePerPage.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
              <span className="text-xs font-semibold text-slate-700">Total Price</span>
              <span className="text-xl font-bold text-blue-600">
                ₹{totalAmount.toFixed(2)}
              </span>
            </div>

            <button
              id="submit-print-request-btn"
              type="button"
              onClick={handleSubmit}
              disabled={submitting || analyzingFile}
              className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewPrintRequest;
