import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/NewAuthContext';
// Import icons from react-icons
import { FaIdCard, FaCalendarAlt, FaCreditCard, FaCheck} from 'react-icons/fa';
import { BiErrorCircle } from 'react-icons/bi';
import { startPaymentCheckout } from '../api/paymentCheckout';

interface FeeSettings {
  youth_council_first_payment: number;
  youth_council_renewal: number;
  regular_first_payment: number;
  regular_renewal: number;
}

const MemberDashboardMember: React.FC = () => {
  const { user, fetchWithAuth, FRONTEND_URL, displayNotification } = useAuth();
  const [greeting, setGreeting] = useState('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [daysRemaining, setDaysRemaining] = useState<number>(0);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [paymentYears, setPaymentYears] = useState<number>(1);
  const [arrearsYears, setArrearsYears] = useState<number>(1);
  const [feeSettings, setFeeSettings] = useState<FeeSettings | null>(null);
  const navigate = useNavigate();

  const calculateDaysRemaining = (expiryDate: Date): number => {
    const now = new Date();
    const timeDiff = expiryDate.getTime() - now.getTime();
    const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return Math.max(0, days);
  };

  // Function to format date as YYYY-MM-DD
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const fetchFeeSettings = async () => {
    try {
      const response = await fetchWithAuth({
        method: 'GET',
        path: '/membership-fees/'
      });
      if (response?.data) {
        setFeeSettings(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch fee settings:', error);
    }
  };

  useEffect(() => {
    fetchFeeSettings();
  }, []);

  useEffect(() => {
    // Set greeting
    const hour = new Date().getHours();
    let greetingMessage = '';
    
    if (hour < 12) greetingMessage = 'Good Morning';
    else if (hour < 17) greetingMessage = 'Good Afternoon';
    else greetingMessage = 'Good Evening';

    setGreeting(greetingMessage);

    if (user?.role === 'Admin') {
      navigate('/admin/dashboard');
      return;
    }

    // Calculate expiry date and status from the saved card expiry
    if (user) {
      const savedExpiryDate = user?.card?.expired_at ? new Date(user.card.expired_at) : null;

      if (savedExpiryDate && !Number.isNaN(savedExpiryDate.getTime())) {
        const formattedExpiry = formatDate(savedExpiryDate);
        const remainingDays = calculateDaysRemaining(savedExpiryDate);

        setExpiryDate(formattedExpiry);
        setDaysRemaining(remainingDays);
        setIsExpired(savedExpiryDate < new Date());

        const today = new Date();
        const calculatedArrearsYears = savedExpiryDate < today
          ? Math.max(1, today.getFullYear() - savedExpiryDate.getFullYear())
          : 1;
        setArrearsYears(calculatedArrearsYears);
      } else {
        const fallbackExpiry = new Date(new Date().getFullYear() + 1, 4, 31);
        setExpiryDate(formatDate(fallbackExpiry));
        setDaysRemaining(calculateDaysRemaining(fallbackExpiry));
        setIsExpired(false);
        setArrearsYears(1);
      }
    }
  }, [user, navigate]);

  const getMemberPrefix = () => {
    const idNumber = user?.card?.id_number || '';
    if (idNumber.toUpperCase().startsWith('LYY')) return 'LYY';
    if (idNumber.toUpperCase().startsWith('LYA')) return 'LYA';
    return '';
  };

  const membershipType = (user?.membership_type || 'full').toLowerCase();
  const isHonoraryOrLife = membershipType === 'honorary' || membershipType === 'life';
  const memberPrefix = getMemberPrefix();
  const isCardActive = Boolean(user?.card?.is_active);
  const hasExpiredCard = Boolean(user?.card?.expired) || isExpired;

  const getDueAmount = (renew: boolean): number => {
    if (isHonoraryOrLife) return 0;
    if (!feeSettings) {
      // Fallback to defaults if settings haven't loaded yet
      if (memberPrefix === 'LYY') return renew ? 2000 : 2500;
      if (memberPrefix === 'LYA') return renew ? 2500 : 3000;
      return renew ? 2500 : 3000;
    }

    if (memberPrefix === 'LYY') {
      return renew 
        ? Number(feeSettings.youth_council_renewal) 
        : Number(feeSettings.youth_council_first_payment);
    }
    return renew 
      ? Number(feeSettings.regular_renewal) 
      : Number(feeSettings.regular_first_payment);
  };

  const calculateMembershipFee = (renew: boolean, years: number): number => {
    const safeYears = Math.max(1, years);
    if (isHonoraryOrLife) return 0;
    if (renew) return getDueAmount(true) * safeYears;
    return getDueAmount(false) + (Math.max(0, safeYears - 1) * getDueAmount(true));
  };

  async function handleRenewSubscription(renew: boolean) {
    const selectedYears = renew && membershipExpired ? arrearsYears : paymentYears;
    const payload = {
      redirect_url: FRONTEND_URL + '/payment',
      amount: calculateMembershipFee(renew, selectedYears),
      membership_type: membershipType || 'full',
      years: Math.max(1, selectedYears),
    };
    
    try {
      const path = renew ? '/membership/renewal' : '/membership/activation';
      const response = await fetchWithAuth({
        method: 'POST',
        path: path,
        body: payload
      });
      await startPaymentCheckout(response.data, message => displayNotification('error', message));
    } catch (error: any) {
      console.error('Error processing payment:', error);
      displayNotification('error', error?.message || 'Failed to process payment');
    }
  };

  const handleViewDigitalId = () => {
    navigate('/myid');
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading your dashboard...</div>
      </div>
    );
  }

  // Determine membership status
  const membershipActive = isCardActive && !isExpired;
  const membershipInactive = !isCardActive && !hasExpiredCard;
  const membershipExpired = hasExpiredCard && !membershipActive;
  const totalFirstPayment = calculateMembershipFee(false, paymentYears);
  const totalRenewalPayment = calculateMembershipFee(true, paymentYears);
  const totalArrearsPayment = calculateMembershipFee(true, arrearsYears);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header with Greeting */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {greeting}, {user?.first_name || 'Member'}!
        </h1>
        <p className="text-gray-600">Welcome to your digital ID dashboard</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Digital ID Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-blue-50 px-6 py-4 border-b">
            <div className="flex items-center">
              <FaIdCard className="mr-2 text-blue-600" size={20} />
              <h2 className="text-lg font-semibold">Digital ID Card</h2>
            </div>
          </div>
          
          <div className="p-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold">{user?.first_name} {user?.last_name}</h3>
                  <p className="opacity-80">{user?.unit}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  membershipActive
                    ? "bg-green-100 text-green-800"
                    : membershipInactive
                      ? "bg-yellow-100 text-yellow-800"
                      : isExpired
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-red-800"
                }`}>
                  {membershipActive ? "ACTIVE" : membershipInactive ? "INACTIVE" : "EXPIRED"}
                </span>
              </div>
              
              <div className="mt-4 space-y-1 text-sm">
                <p>Member ID: {user?.card?.id_number || 'N/A'}</p>
                <p>Email: {user?.email}</p>
                {user?.church && <p>Church: {user?.church?.name}</p>}
                {user?.youth_council_group && <p>Group: {user?.youth_council_group?.name}</p>}
              </div>
              
              <div className="mt-4 text-xs flex items-center">
                <FaCalendarAlt size={12} className="mr-1" />
                {membershipActive
                  ? `Valid until: ${expiryDate}`
                  : membershipInactive
                    ? `Inactive until payment is completed`
                    : `Expired on: ${expiryDate}`}
              </div>
            </div>
          </div>
          
          {membershipActive && (
            <div className="bg-gray-50 px-6 py-4 flex justify-between">
              <button 
                onClick={handleViewDigitalId}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View ID
              </button>
              <button 
                onClick={() => navigate('/account')}
                className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Update Info
              </button>
            </div>
          )}
        </div>
        
        {/* Subscription Status */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className={`px-6 py-4 border-b ${
            membershipInactive ? "bg-yellow-50" : membershipActive ? "bg-green-50" : "bg-red-50"
          }`}>
            <div className="flex items-center">
              {membershipInactive ? (
                <BiErrorCircle className="mr-2 text-yellow-500" size={20} />
              ) : membershipActive ? (
                <FaCheck className="mr-2 text-green-500" size={20} />
              ) : (
                <BiErrorCircle className="mr-2 text-red-500" size={20} />
              )}
              <h2 className="text-lg font-semibold">Membership Status</h2>
            </div>
          </div>
          
          <div className="p-6">
            {isHonoraryOrLife ? (
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mr-4">
                    <FaCheck size={32} className="text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">No Dues Required</h3>
                    <p className="text-sm text-gray-600">Honorary and Life members do not pay dues</p>
                  </div>
                </div>
              </div>
            ) : membershipInactive ? (
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mr-4">
                    <BiErrorCircle size={32} className="text-yellow-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Inactive Membership</h3>
                    <p className="text-sm text-gray-600">Your digital ID is currently inactive</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Membership expires annually on May 31st
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      First payment: NGN {totalFirstPayment.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="text-xs text-gray-600">Years to pay</label>
                  <input
                    type="number"
                    min={1}
                    value={paymentYears}
                    onChange={(e) => setPaymentYears(Math.max(1, Number(e.target.value || 1)))}
                    className="mt-1 w-24 px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">You can pay for more than 1 year.</p>
                </div>
                
                <div className="mt-4">
                  <button 
                    onClick={() => handleRenewSubscription(false)}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FaCreditCard size={16} className="mr-2" />
                    Start Membership
                  </button>
                </div>
              </div>
            ) : membershipActive ? (
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mr-4">
                    <FaCheck size={32} className="text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Active Membership</h3>
                    <p className="text-sm text-gray-600">Your digital ID is valid and active</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Annual membership - Expires May 31st of next year
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Renewal fee: NGN {totalRenewalPayment.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="text-xs text-gray-600">Years to pay</label>
                  <input
                    type="number"
                    min={1}
                    value={paymentYears}
                    onChange={(e) => setPaymentYears(Math.max(1, Number(e.target.value || 1)))}
                    className="mt-1 w-24 px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">You can pay for more than 1 year.</p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span>Days Remaining:</span>
                    <span className="font-bold">{daysRemaining} days</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${Math.min(100, (daysRemaining / 365) * 100)}%` }}
                    ></div>
                  </div>
                  
                  <p className="text-xs text-gray-600 mt-2">
                    Expires on: {expiryDate}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Annual expiry date: May 31st
                  </p>
                </div>
                
                <div className="mt-4">
                  {daysRemaining < 60 && (
                    <p className="text-amber-600 mb-2">
                      {daysRemaining < 30 
                        ? "Your membership expires soon!" 
                        : "Your membership expiry is approaching."}
                    </p>
                  )}
                  <button 
                    onClick={() => handleRenewSubscription(true)}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FaCreditCard size={16} className="mr-2" />
                    Renew Now (NGN {totalRenewalPayment.toLocaleString()})
                  </button>
                  {daysRemaining >= 60 && (
                    <p className="text-[11px] text-gray-500 mt-2">
                      Early renewal is available anytime.
                    </p>
                  )}
                </div>
              </div>
            ) : membershipExpired ? (
              <div>
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mr-4">
                    <BiErrorCircle size={32} className="text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Expired Membership</h3>
                    <p className="text-sm text-gray-600">Your digital ID is currently inactive</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Membership expired on {expiryDate}
                    </p>
                  </div>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg mb-4">
                  <p className="text-sm">
                    Your annual membership expired on {expiryDate}. 
                    Renew your subscription to continue accessing all member benefits.
                  </p>
                  <p className="text-sm mt-2 font-medium">
                    Arrears due: {arrearsYears} year{arrearsYears > 1 ? 's' : ''} missed
                  </p>
                  <p className="text-xs text-gray-600 mt-2">
                    Renewal arrears are enforced automatically from your saved expiry date.
                  </p>
                </div>
                
                <button 
                  onClick={() => handleRenewSubscription(true)}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FaCreditCard size={16} className="mr-2" />
                  Clear Arrears Now (NGN {totalArrearsPayment.toLocaleString()})
                </button>
                <p className="text-[11px] text-gray-500 mt-3">
                  Payment charges and VAT are deducted from the payer, not the organization.
                </p>
              </div>
            ) : null
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboardMember;

