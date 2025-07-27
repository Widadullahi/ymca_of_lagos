import { useState, useEffect,JSX } from 'react';
import { useAuth } from '../context/NewAuthContext';

// Define interfaces for type safety
interface VerificationData {
  first_name: string;
  last_name: string;
  id_number: string;
  expired_at: string;
  card?: {
    id_number: string;
    expired_at: string;
  };
}

interface VerificationResult {
  valid: boolean;
  expired?: boolean;
  error?: string;
  cardId?: string;
  data?: VerificationData;
  verifiedAt?: string;
}

const QRVerificationPage = () => {
  const { fetchWithAuth } = useAuth();
  const [verificationId, setVerificationId] = useState<string>('');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [manualVerification, setManualVerification] = useState<boolean>(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#verify=')) {
      const cardId = hash.split('#verify=')[1];
      setVerificationId(cardId);
      verifyCard(cardId);
    }
  }, []);

  const verifyCard = async (cardId: string): Promise<void> => {
    setLoading(true);
    setVerificationResult(null);

    try {
      const response = await fetchWithAuth({
        method: 'GET',
        path: `/id-verification/${cardId}`,
      });
      
      setVerificationResult(response?.data);
    } catch (error) {
      setVerificationResult({
        valid: false,
        error: 'Card not found or invalid verification ID',
        cardId: cardId
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualVerification = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (verificationId.trim()) {
      verifyCard(verificationId.trim());
    }
  };

  const renderVerificationResult = (): JSX.Element | null => {
    if (!verificationResult) return null;

    if (verificationResult.valid && verificationResult.data) {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="bg-green-600 text-white p-2 rounded-full mr-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-green-800">Valid YMCA ID Card</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-green-800 mb-2">Member Information</h4> 
              <div className="space-y-1 text-sm text-green-700">
                <p><span className="font-medium">Name:</span> {verificationResult.data.first_name} {verificationResult.data.last_name}</p>
                <p><span className="font-medium">Registration No.:</span> {verificationResult.data.id_number}</p>
                <p><span className="font-medium">Valid Until:</span> {verificationResult.data.expired_at}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-green-800 mb-2">Verification Details</h4>
              <div className="space-y-1 text-sm text-green-700">
                <p><span className="font-medium">Verification ID:</span> {verificationId}</p>
                <p><span className="font-medium">Verified At:</span> {verificationResult.verifiedAt ? new Date(verificationResult.verifiedAt).toLocaleString() : 'N/A'}</p>
                <p><span className="font-medium">Status:</span> <span className="bg-green-200 px-2 py-1 rounded text-xs">VALID</span></p>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (verificationResult.expired && verificationResult.data) {  
      return (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="bg-orange-600 text-white p-2 rounded-full mr-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-orange-800">Expired ID Card</h3>
          </div>
          
          <div className="space-y-2 text-sm text-orange-700">
            <p><span className="font-medium">Name:</span> {verificationResult.data.first_name} {verificationResult.data.last_name}</p>
            <p><span className="font-medium">Registration No.:</span> {verificationResult.data.card?.id_number}</p>
            <p><span className="font-medium">Expired on:</span> {verificationResult.data.card?.expired_at}</p>
            <p className="mt-3 p-3 bg-orange-100 rounded">
              This ID card has expired and is no longer valid. Please contact YMCA of Lagos for renewal.
            </p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="bg-red-600 text-white p-2 rounded-full mr-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-red-800">Invalid ID Card</h3>
          </div>
          
          <div className="space-y-2 text-sm text-red-700">
            <p><span className="font-medium">Error:</span> {verificationResult.error}</p>
            {verificationResult.cardId && (
              <p><span className="font-medium">Verification ID:</span> {verificationResult.cardId}</p>
            )}
            <p className="mt-3 p-3 bg-red-100 rounded">
              This ID card could not be verified. Please contact YMCA of Lagos administration if you believe this is an error.
            </p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-red-600 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold">YMCA ID Card Verification</h1>
            <p className="mt-2">Verify the authenticity of YMCA of Lagos membership cards</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Instructions */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">How to Verify</h2>
            <div className="space-y-3 text-gray-700">
              <div className="flex items-start">
                <span className="bg-red-100 text-red-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</span>
                <p>Scan the QR code on the ID card using your mobile device</p>
              </div>
              <div className="flex items-start">
                <span className="bg-red-100 text-red-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</span>
                <p>Or manually enter the verification ID found on the ID card</p>
              </div>
              <div className="flex items-start">
                <span className="bg-red-100 text-red-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</span>
                <p>View the verification results to confirm authenticity</p>
              </div>
            </div>
          </div>

          {/* Manual Verification Form */}
          {!verificationId || manualVerification ? (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Manual Verification</h2>
              <form onSubmit={handleManualVerification}>
                <div className="mb-4">
                  <label htmlFor="verificationId" className="block text-sm font-medium text-gray-700 mb-2">
                    Verification ID
                  </label>
                  <input
                    type="text"
                    id="verificationId"
                    value={verificationId}
                    onChange={(e) => setVerificationId(e.target.value)}
                    placeholder="Enter verification ID (e.g., VERIFY-1234567890-abc123)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  {loading ? 'Verifying...' : 'Verify ID Card'}
                </button>
              </form>
              
              {!manualVerification && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setManualVerification(true)}
                    className="text-red-600 hover:text-red-800 text-sm underline"
                  >
                    Enter verification ID manually
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">QR Code Detected</h2>
              <p className="text-gray-700 mb-4">
                Verification ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{verificationId}</span>
              </p>
              <button
                onClick={() => {
                  setManualVerification(true);
                  setVerificationResult(null);
                }}
                className="text-red-600 hover:text-red-800 text-sm underline"
              >
                Enter a different verification ID
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-800">Verifying ID Card...</h3>
                <p className="text-gray-600 mt-2">Please wait while we verify the authenticity of this YMCA ID card.</p>
              </div>
            </div>
          )}

          {/* Verification Results */}
          {renderVerificationResult()}

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Need Help?</h2>
            <div className="text-gray-700 space-y-2">
              <p><span className="font-medium">YMCA of Lagos</span></p>
              <p>77, Awolowo S/W Road, Ikoyi, Lagos</p>
              <p>Phone: +234 (0) 1 234 5678</p>
              <p>Email: info@ymcalagos.org</p>
            </div>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                If you encounter any issues with verification or suspect a fraudulent ID card, 
                please contact our administration office immediately.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 YMCA of Lagos. All rights reserved.</p>
          <p className="text-sm text-gray-400 mt-1">Secure ID Card Verification System</p>
        </div>
      </footer>
    </div>
  );
};

export default QRVerificationPage;