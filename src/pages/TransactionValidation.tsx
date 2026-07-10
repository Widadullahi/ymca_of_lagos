import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/NewAuthContext';

// Define types for our transaction data and API response
type ApiResponse = {
  success: boolean;
  message: string;
};

const TransactionValidation: React.FC = () => {
    const { fetchWithAuth, fetchUserProfile, user  } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [validationResult, setValidationResult] = useState<ApiResponse | null>(null);
  const [manualRrr, setManualRrr] = useState<string>('');

  useEffect(() => {
    const validateTransaction = async (rrrToValidate: string) => {
      try {
        console.log('Validating transaction with RRR:', rrrToValidate);
        const response = await fetchWithAuth({
            method: 'POST',
            path: '/payment/verify',
            body: { rrr: rrrToValidate },
            isAthenticated: false
        });
        console.log('Verification response:', response);

        setValidationResult(response?.data);
        if (user) {
          fetchUserProfile();
        }
        // Clear RRR from localStorage after verification
        localStorage.removeItem('remitta_rrr');
        setLoading(false);
      } catch (error) {
        console.error('Error validating transaction:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        setValidationResult({
          success: false,
          message: 'An error occurred while validating the transaction'
        });
        setLoading(false);
      }
    };

    // First try to get RRR from localStorage
    const storedRrr = localStorage.getItem('remitta_rrr');
    // Also check URL params for RRR
    const urlRrr = searchParams.get('rrr');
    
    if (storedRrr || urlRrr) {
      const rrrToUse = urlRrr || storedRrr;
      validateTransaction(rrrToUse!);
    } else {
      // No RRR found, show manual input
      setLoading(false);
    }
  }, [searchParams, user, fetchWithAuth, fetchUserProfile]);

  const handleManualVerify = async () => {
    if (!manualRrr.trim()) {
      return;
    }
    setLoading(true);
    try {
      const response = await fetchWithAuth({
          method: 'POST',
          path: `/payment/verify`,
          body: { rrr: manualRrr },
          isAthenticated: false
      });

      setValidationResult(response?.data);
      if (user) {
        fetchUserProfile();
      }
      // Clear RRR from localStorage after verification
      localStorage.removeItem('remitta_rrr');
      setLoading(false);
    } catch (error) {
      console.error('Error validating transaction:', error);
      setValidationResult({
        success: false,
        message: 'An error occurred while validating the transaction'
      });
      setLoading(false);
    }
  };

  const handleNavigateHome = () => {
    navigate('/');
  };

  const handleNavigateToDashboard = () => {
    navigate('/dashboard');
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
            <h2 className="mt-4 text-xl font-semibold text-gray-700">Validating Transaction...</h2>
            <p className="mt-2 text-gray-500">Please wait while we verify your payment.</p>
          </div>
        </div>
      </div>
    );
  }

  // If we have a validation result, show it
  if (validationResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
          <div className="text-center">
            {validationResult?.success ? (
              <>
                <div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-100 rounded-full">
                  <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="mt-4 text-xl font-semibold text-gray-700">Payment Successful!</h2>
                <p className="mt-2 text-gray-500">Your transaction has been validated.</p>
                <button 
                  onClick={user ? handleNavigateToDashboard : handleNavigateHome} 
                  className="w-full px-4 py-2 mt-6 font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {user ? "Go to Dashboard" : "Return to Home"}
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full">
                  <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="mt-4 text-xl font-semibold text-gray-700">Transaction Failed</h2>
                <p className="mt-2 text-gray-500">{validationResult?.message || 'Your transaction could not be completed.'}</p>
                <button 
                  onClick={user ? handleNavigateToDashboard : handleNavigateHome} 
                  className="w-full px-4 py-2 mt-6 font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {user ? "Return to Dashboard" : "Return to Home"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // If no RRR found, show manual input form
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">Verify Payment</h2>
          <p className="mt-2 text-gray-500">Enter your Remitta Retrieval Reference (RRR) to verify your payment.</p>
        </div>
        <div>
          <input
            type="text"
            placeholder="Enter RRR"
            value={manualRrr}
            onChange={(e) => setManualRrr(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          />
        </div>
        <button
          onClick={handleManualVerify}
          className="w-full px-4 py-2 font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Verify Payment
        </button>
        <button
          onClick={user ? handleNavigateToDashboard : handleNavigateHome}
          className="w-full px-4 py-2 font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100"
        >
          {user ? "Return to Dashboard" : "Return to Home"}
        </button>
      </div>
    </div>
  );
};

export default TransactionValidation;