// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/NewAuthContext';

const AdminSignaturePage: React.FC = () => {
  const {
    fetchWithAuth,
    displayNotification,
    user,
    fetchUserProfile,
    setGlobalLoading,
    setGlobalLoadingText,
  } = useAuth();

  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const currentSignature = useMemo(() => user?.signature || null, [user]);

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
        path: `/account/signature/`,
        body: formData,
        isFormData: true,
      });

      if (response?.data) {
        await fetchUserProfile();
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
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Authorised Signature</h1>
        <p className="text-gray-600 mt-1">
          This signature is used as the authorised signatory on every membership card.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Authorised Signature
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleSignatureChange}
              className="block w-full text-sm text-gray-700"
            />
            <p className="text-xs text-gray-500 mt-2">
              Recommended: clear PNG/JPG with transparent or white background.
            </p>

            <button
              onClick={handleUploadSignature}
              disabled={!signatureFile || isUploading}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isUploading ? 'Uploading...' : 'Save Authorised Signature'}
            </button>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Preview</h3>
            <div className="border rounded-md p-4 min-h-[120px] flex items-center justify-center bg-gray-50">
              {signaturePreview ? (
                <img src={signaturePreview} alt="Signature preview" className="h-24 object-contain" />
              ) : currentSignature ? (
                <img src={currentSignature} alt="Authorised signature" className="h-24 object-contain" />
              ) : (
                <span className="text-sm text-gray-400">No signature uploaded</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-600">
          <p>
            After upload, all member cards will display this authorised signature.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSignaturePage;
