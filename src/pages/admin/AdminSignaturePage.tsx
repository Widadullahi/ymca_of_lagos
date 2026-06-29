import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/NewAuthContext';

const AdminSignaturePage: React.FC = () => {
  const {
    fetchWithAuth,
    displayNotification,
    setGlobalLoading,
    setGlobalLoadingText,
  } = useAuth();

  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [systemSignature, setSystemSignature] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSystemSignature = async () => {
    try {
      setIsLoading(true);
      const response = await fetchWithAuth({
        method: 'GET',
        path: '/admin/system/card-signature/',
      });
      if (response?.data?.signature) {
        setSystemSignature(response.data.signature);
      }
    } catch (error) {
      console.error('Error fetching system signature:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemSignature();
  }, []);

  useEffect(() => {
    if (!signatureFile) {
      setSignaturePreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(signatureFile);
    setSignaturePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [signatureFile]);

  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setSignatureFile(files[0]);
    }
  };

  const handleUploadSignature = async () => {
    if (!signatureFile) {
      displayNotification?.('error', 'Please select a signature file first.');
      return;
    }

    try {
      setIsUploading(true);
      setGlobalLoading?.(true);
      setGlobalLoadingText?.('Uploading authorised signature...');

      const formData = new FormData();
      formData.append('signature', signatureFile);

      const response = await fetchWithAuth({
        method: 'POST',
        path: `/admin/system/card-signature/`,
        body: formData,
        isFormData: true,
      });

      if (response?.data) {
        await fetchSystemSignature();
        setSignatureFile(null);
        displayNotification?.('success', 'Authorised signature updated successfully.');
      }
    } catch (error) {
      console.error('Error uploading signature:', error);
      displayNotification?.('error', 'Failed to upload authorised signature.');
    } finally {
      setIsUploading(false);
      setGlobalLoading?.(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Authorised Signature
        </h1>
        <p className="text-gray-600">
          Manage the official signature used on all membership cards
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-purple-50 rounded-lg mr-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Upload New Signature</h2>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Signature File
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleSignatureChange}
                className="block w-full text-sm text-gray-700
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              <p className="mt-2 text-sm text-gray-500">
                Recommended: Clear PNG/JPG with transparent or white background for best results.
              </p>
            </div>

            <div className="flex items-center justify-between">
              {signatureFile && (
                <p className="text-sm text-gray-600">
                  Selected: <span className="font-medium text-gray-900">{signatureFile.name}</span>
                </p>
              )}
              <button
                onClick={handleUploadSignature}
                disabled={!signatureFile || isUploading}
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Save Authorised Signature
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-blue-50 rounded-lg mr-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Current Signature</h2>
            </div>

            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 min-h-[200px] flex items-center justify-center bg-gray-50">
              {isLoading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
              ) : signaturePreview ? (
                <div className="text-center">
                  <p className="text-sm font-medium text-purple-600 mb-2">New Signature Preview</p>
                  <img 
                    src={signaturePreview} 
                    alt="Signature preview" 
                    className="h-24 object-contain mx-auto" 
                  />
                </div>
              ) : systemSignature ? (
                <div className="text-center">
                  <p className="text-sm font-medium text-green-600 mb-2">Active Signature</p>
                  <img 
                    src={systemSignature} 
                    alt="Authorised signature" 
                    className="h-24 object-contain mx-auto" 
                  />
                </div>
              ) : (
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="mt-2 text-sm font-medium text-gray-500">No signature uploaded</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-start">
          <div className="p-2 bg-yellow-50 rounded-lg mr-4 flex-shrink-0">
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Important Information</h3>
            <p className="text-gray-600 mb-2">
              After uploading a new signature, it will be immediately applied to all new and existing membership cards.
            </p>
            <ul className="mt-2 space-y-1">
              <li className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Only one active signature allowed at a time
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Upload replaces the current signature automatically
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Changes are reflected immediately across the system
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSignaturePage;
