import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../context/NewAuthContext';
import ymca from '../assets/images/image.png'



interface IDCardPreviewProps {
  member?: any;
  forwardedRef?: React.Ref<HTMLDivElement>;
}

const getCardTheme = (membershipType: string) => {
  switch (membershipType) {
    case 'honorary':
      return {
        ribbonBg: 'from-amber-400 via-yellow-500 to-amber-600',
        ribbonText: 'text-white',
        accent: 'text-amber-600',
        border: 'border-amber-300',
        badge: 'bg-amber-500 text-white'
      };
    case 'life':
      return {
        ribbonBg: 'from-gray-800 via-black to-gray-900',
        ribbonText: 'text-amber-200',
        accent: 'text-gray-900',
        border: 'border-amber-500',
        badge: 'bg-black text-amber-200'
      };
    case 'ordinary':
      return {
        ribbonBg: 'from-red-600 via-red-700 to-black',
        ribbonText: 'text-white',
        accent: 'text-red-600',
        border: 'border-red-500',
        badge: 'bg-red-600 text-white'
      };
    default:
      return {
        ribbonBg: 'from-red-600 via-red-700 to-black',
        ribbonText: 'text-white',
        accent: 'text-red-600',
        border: 'border-red-500',
        badge: 'bg-red-600 text-white'
      };
  }
};

const formatMembershipLabel = (membershipType: string) => {
  const type = membershipType?.toLowerCase() || 'full';
  if (type === 'life') return 'LIFE MEMBER';
  if (type === 'honorary') return 'HONORARY MEMBER';
  if (type === 'ordinary') return 'ORDINARY MEMBER';
  return 'FULL MEMBER';
};

const formatExpiryDate = (user: any) => {
  const type = (user?.membership_type || '').toString().toLowerCase();
  if (type === 'honorary' || type === 'life') return '';
  // Use payment/activation year if available; always expire on May 31 of the following year.
  const baseDate =
    (user?.card?.created_at && new Date(user.card.created_at)) ||
    (user?.created_at && new Date(user.created_at)) ||
    new Date();

  const expiryYear = baseDate.getFullYear() + 1;
  const expiry = new Date(expiryYear, 4, 31); // May 31 of next year
  return expiry.toISOString().split('T')[0];
};

// Updated IDCardPreview component with QR code
const IDCardPreview: React.FC<IDCardPreviewProps> = ({ member, forwardedRef }) => {

  const { user: authUser } = useAuth();
  const user = member || authUser;
  const theme = getCardTheme(user?.membership_type || 'full');
  const verificationUrl = `${window.location.origin}/verify/#verify=${user?.card?.id_number}`;
  const memberSignature = user?.card?.signature || null;
  const resolvedAuthorisedSignature = member ? authUser?.signature : user?.signature || null;

  return (
    <div className="w-full bg-gray-100 p-4" ref={forwardedRef}>
      <div className="max-w-6xl mx-auto">
        {/* ID Card Container - Fixed aspect ratio */}
        <div className="flex flex-col items-center space-y-8">

          {/* Front of ID Card */}
          <div className="relative">
            <div
              className={`bg-white rounded-lg overflow-hidden shadow-xl border ${theme.border}`}
              style={{
                width: 'min(100%, 400px)',
                height: 'calc(min(90vw, 400px) * 0.63)', // Credit card ratio (1.586:1 inverted = 0.63)
                minHeight: '200px'
              }}
            >
              <div className="relative h-full w-full">
                {/* Background pattern */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='28' height='28' viewBox='0 0 28 28' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d1d5db' fill-opacity='0.35'%3E%3Cpath d='M14 0l14 14-14 14L0 14z'/%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: "28px 28px"
                  }}
                />

                {/* Card Content */}
                <div className="relative h-full">
                  {/* Vertical ribbon */}
                  <div className={`absolute top-0 right-0 h-full w-12 sm:w-14 bg-gradient-to-b ${theme.ribbonBg} flex items-center justify-center`}>
                    <span className={`transform -rotate-90 font-black tracking-[0.2em] text-xs sm:text-sm ${theme.ribbonText}`}>
                      MEMBER ID
                    </span>
                  </div>

                  <div className="relative p-4 sm:p-5 h-full text-gray-900 flex flex-col">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={ymca}
                          alt="YMCA Lagos Logo"
                          className="h-10 w-auto object-contain drop-shadow-sm"
                        />
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${theme.badge}`}>
                        {formatMembershipLabel(user?.membership_type)}
                      </span>
                    </div>

                    <div className="mt-3 flex gap-3">
                      <div className={`border-2 ${theme.border} p-1 bg-white`} style={{ width: '70px', height: '90px' }}>
                        <img src={user?.image} alt="Member" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="text-base font-bold tracking-wide">
                          {user?.last_name?.toUpperCase() || ''} {user?.first_name?.toUpperCase() || ''}
                        </div>
                        <div className="mt-2 space-y-1 text-xs">
                          <div className="flex gap-2 items-baseline">
                            <span className="text-gray-600">Registration No.:</span>
                            <span className={`${theme.accent} font-semibold`}>{user?.card?.id_number || ''}</span>
                          </div>
                          <div className="flex gap-2 items-baseline">
                            <span className="text-gray-600">Category:</span>
                            <span className={`${theme.accent} font-semibold`}>{formatMembershipLabel(user?.membership_type)}</span>
                          </div>
                          {user?.membership_type !== 'honorary' && user?.membership_type !== 'life' && (
                            <div className="flex gap-2 items-baseline">
                              <span className="text-gray-600">Expiry Date:</span>
                              <span className={`${theme.accent} font-semibold`}>{formatExpiryDate(user)}</span>
                            </div>
                          )}
                          <div className="flex gap-2 items-baseline">
                            <span className="text-gray-600">Signature</span>
                            <div className="h-6 w-24 flex items-end">
                              {memberSignature && (
                                <img src={memberSignature} alt="Signature" className="max-h-6 object-contain" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto flex items-end justify-end">
                      <div className="flex items-center gap-2">
                        <div className="bg-white p-1 rounded shadow-sm">
                          <QRCodeSVG value={verificationUrl} size={40} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Back of ID Card */}
          <div className="relative">
            <div
              className={`bg-white rounded-lg overflow-hidden shadow-xl border ${theme.border}`}
              style={{
                width: 'min(100%, 400px)',
                height: 'calc(min(90vw, 400px) * 0.63)',
                minHeight: '200px'
              }}
            >
              <div className="relative h-full">
                {/* Background pattern */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='28' height='28' viewBox='0 0 28 28' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d1d5db' fill-opacity='0.35'%3E%3Cpath d='M14 0l14 14-14 14L0 14z'/%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: "28px 28px"
                  }}
                />

                {/* Card Content */}
                <div className="relative p-4 sm:p-6 text-center h-full w-full flex flex-col justify-center text-gray-800">
                  <p className="text-xs sm:text-sm mb-1">This ID card remains the property of</p>
                  <h2 className="text-sm sm:text-lg font-bold mb-1">YMCA OF LAGOS</h2>
                  <p className="text-xs sm:text-sm mb-1">77, Awolowo S/W Road Ikoyi, Lagos.</p>
                  <p className="text-xs sm:text-sm mb-2">and is for identification only.</p>
                  <p className="text-xs sm:text-sm mb-3">
                    If found kindly return to<br />the address above.
                  </p>

                  <div className="mt-3 flex flex-col items-center justify-end">
                    <div className="h-8 mb-0.5 flex items-end justify-center w-28">
                      {resolvedAuthorisedSignature ? (
                        <img src={resolvedAuthorisedSignature} alt="Authorised Signature" className="max-h-7 object-contain" />
                      ) : (
                        <div className="w-24 h-8"></div>
                      )}
                    </div>
                    <p className="text-xs">Authorised Signature</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default IDCardPreview;
