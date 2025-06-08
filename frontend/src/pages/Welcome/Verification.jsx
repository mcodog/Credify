import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  FaUpload, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaSpinner,
  FaFile,
  FaCalendarAlt,
  FaHashtag,
  FaImage,
  FaShieldAlt
} from "react-icons/fa";
import {
  verifyCertificate,
  getVerificationStats,
  clearVerificationResult,
  clearError,
} from "../../features/certificates/verificationSlice";
import {
  selectIsLoading,
  selectError,
  selectVerificationResult,
  selectStats,
  selectStatsLoading,
} from "../../features/certificates/verificationSelector";
import Header from "../../components/layouts/Header";
import Loader from "../../components/layouts/Loader";

const CertificateVerification = () => {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const verificationResult = useSelector(selectVerificationResult);
  const stats = useSelector(selectStats);
  const statsLoading = useSelector(selectStatsLoading);
  const [pageLoading, setPageLoading] = useState(true);

  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    dispatch(getVerificationStats())
    .finally(() => setPageLoading(false));
      }, [dispatch]);

  if (pageLoading) {
    return <Loader fullPage size="xl" />;
  }


  // Convert file to base64 string
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
    });

  const handleFileChange = (selectedFile) => {
    dispatch(clearVerificationResult());
    dispatch(clearError());
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff', 'application/pdf'];
    if (!allowedTypes.includes(selectedFile.type)) {
      alert('Please select a valid file type (JPEG, PNG, GIF, WebP, BMP, TIFF, PDF)');
      return;
    }
    
    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (selectedFile.size > maxSize) {
      alert('File size must be less than 10MB');
      return;
    }
    
    setFile(selectedFile);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    try {
      const base64Data = await fileToBase64(file);
      dispatch(verifyCertificate(base64Data));
    } catch {
      alert("Failed to read file.");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const truncateHash = (hash) => {
    if (!hash) return "N/A";
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
  };

  return (
    <>
      <Header />
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen pt-16">
        <div className="max-w-4xl mx-auto p-6 space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Certificate Verification
            </h1>
            <p className="text-gray-600">
              Upload your certificate to verify its authenticity
            </p>
          </div>

          {/* Statistics */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {statsLoading ? "..." : stats.totalCertificates}
                </div>
                <div className="text-sm text-gray-600">Total Certificates</div>
              </div>
              <div className="bg-white rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {statsLoading ? "..." : stats.verifiedCertificates}
                </div>
                <div className="text-sm text-gray-600">Verified</div>
              </div>
              <div className="bg-white rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {statsLoading ? "..." : stats.revokedCertificates}
                </div>
                <div className="text-sm text-gray-600">Revoked</div>
              </div>
              <div className="bg-white rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {statsLoading ? "..." : `${stats.verificationRate}%`}
                </div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>
          )}

          {/* Upload Form */}
          <div className="bg-white rounded-lg border p-6">
            <form onSubmit={handleSubmit}>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors
                  ${dragActive 
                    ? "border-blue-400 bg-blue-50" 
                    : file 
                    ? "border-green-400 bg-green-50" 
                    : "border-gray-300 hover:border-gray-400"
                  }
                  ${isLoading ? "opacity-60 pointer-events-none" : "cursor-pointer"}
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload').click()}
              >
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => e.target.files[0] && handleFileChange(e.target.files[0])}
                  disabled={isLoading}
                  className="hidden"
                />
                
                <div className="space-y-4">
                  {isLoading ? (
                    <FaSpinner className="w-12 h-12 text-blue-500 mx-auto animate-spin" />
                  ) : (
                    <FaUpload className="w-12 h-12 text-gray-400 mx-auto" />
                  )}
                  
                  <div>
                    <p className="text-lg font-medium text-gray-700">
                      {isLoading 
                        ? "Verifying certificate..." 
                        : file 
                        ? `Selected: ${file.name}` 
                        : "Drop your certificate here or click to browse"
                      }
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Supports: JPEG, PNG, GIF, WebP, BMP, TIFF, PDF (Max 10MB)
                    </p>
                  </div>

                  {file && !isLoading && (
                    <div className="text-green-600 font-medium">
                      ✓ File ready: {formatFileSize(file.size)}
                    </div>
                  )}
                </div>
              </div>

              {file && !isLoading && (
                <button
                  type="submit"
                  className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
                >
                  <FaShieldAlt className="w-5 h-5 mr-2" />
                  Verify Certificate
                </button>
              )}
            </form>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <FaTimesCircle className="w-5 h-5 text-red-500 mr-3" />
                <div className="text-red-700">
                  <strong>Error:</strong> {error}
                </div>
                <button
                  onClick={() => dispatch(clearError())}
                  className="ml-auto text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Verification Result */}
          {verificationResult && (
            <div className={`rounded-lg border p-6 ${
              verificationResult.verified 
                ? "bg-green-50 border-green-200" 
                : "bg-red-50 border-red-200"
            }`}>
              <div className="flex items-center mb-4">
                {verificationResult.verified ? (
                  <FaCheckCircle className="w-8 h-8 text-green-500 mr-3" />
                ) : (
                  <FaTimesCircle className="w-8 h-8 text-red-500 mr-3" />
                )}
                <div>
                  <h3 className={`text-xl font-bold ${
                    verificationResult.verified ? "text-green-800" : "text-red-800"
                  }`}>
                    {verificationResult.verified ? "Certificate Verified ✓" : "Certificate Not Found ✗"}
                  </h3>
                  <p className={`text-sm ${
                    verificationResult.verified ? "text-green-600" : "text-red-600"
                  }`}>
                    {verificationResult.message}
                  </p>
                </div>
              </div>

              {/* Verified Certificate Details */}
              {verificationResult.verified && verificationResult.certificate && (
                <div className="mt-6 bg-white rounded-lg p-6 border">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Certificate Details
                  </h4>
                  
                  {verificationResult.certificate.imageUrl && (
                    <div className="mb-6">
                      <img
                        src={verificationResult.certificate.imageUrl}
                        alt="Certificate"
                        className="w-full max-w-md mx-auto rounded-lg border"
                      />
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <FaFile className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="font-medium">Name:</span>
                        <span className="ml-2">{verificationResult.certificate.name || "N/A"}</span>
                      </div>
                      <div className="flex items-center">
                        <FaImage className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="font-medium">Type:</span>
                        <span className="ml-2 capitalize">{verificationResult.certificate.fileType}</span>
                      </div>
                      <div className="flex items-center">
                        <FaCalendarAlt className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="font-medium">Issued:</span>
                        <span className="ml-2">{formatDate(verificationResult.certificate.issuedDate)}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center mb-1">
                          <FaHashtag className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="font-medium">File Hash:</span>
                        </div>
                        <div className="font-mono text-xs bg-gray-100 p-2 rounded break-all">
                          {truncateHash(verificationResult.certificate.fileHash)}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center mb-1">
                          <FaHashtag className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="font-medium">Content Hash:</span>
                        </div>
                        <div className="font-mono text-xs bg-gray-100 p-2 rounded break-all">
                          {truncateHash(verificationResult.certificate.contentHash)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* File Upload Details */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h5 className="font-medium text-gray-700 mb-2">Uploaded File Details</h5>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Size: {formatFileSize(verificationResult.uploadedFile.size)}</div>
                  <div>Type: {verificationResult.uploadedFile.type}</div>
                  <div className="font-mono">Hash: {truncateHash(verificationResult.uploadedFile.hash)}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CertificateVerification;