import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../context/NewAuthContext';
import frontCard from '../assets/idcard/front.png';
import backCard from '../assets/idcard/back.png';

interface IDCardPreviewProps {
  member?: any;
  forwardedRef?: React.Ref<HTMLDivElement>;
}

const formatMembershipLabel = (membershipType: string) => {
  const type = membershipType?.toLowerCase() || 'full';
  if (type === 'life') return 'LIFE MEMBER';
  if (type === 'honorary') return 'HONORARY MEMBER';
  if (type === 'ordinary') return 'ORDINARY MEMBER';
  return 'FULL MEMBER';
};

const formatExpiryDate = (user: any) => {
  if (user?.card?.expired_at) return user.card.expired_at;
  const type = (user?.membership_type || '').toString().toLowerCase();
  if (type === 'honorary' || type === 'life') return '';

  const baseDate =
    (user?.card?.created_at && new Date(user.card.created_at)) ||
    (user?.created_at && new Date(user.created_at)) ||
    new Date();

  const expiryYear = baseDate.getFullYear() + 1;
  const expiry = new Date(expiryYear, 4, 31); // May 31 of next year
  return expiry.toISOString().split('T')[0];
};

const NewIDCardPreview: React.FC<IDCardPreviewProps> = ({ member, forwardedRef }) => {
  const { user: authUser } = useAuth();
  const user = member || authUser;
  const verificationUrl = `${window.location.origin}/verify/#verify=${user?.card?.id_number}`;
  const memberSignature = user?.card?.signature || null;
  const resolvedAuthorisedSignature = member ? authUser?.signature : user?.signature || null;
  const expiryDate = formatExpiryDate(user);

  return (
    <div className="w-full bg-gray-100 p-4" ref={forwardedRef}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center space-y-8">
          {/* Front of ID Card */}
          <div className="relative">
            <div
              className="rounded-lg overflow-hidden shadow-xl relative"
              style={{
                width: '400px',
                height: '252px',
                backgroundImage: `url(${frontCard})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="relative h-full w-full">
                {/* Photo */}
                <div className="absolute top-[36%] left-[6%] w-[5.5%] h-[9%] rounded-sm overflow-hidden bg-white">
                  {user?.image && (
                    <img src={user.image} alt="Member" className="w-full h-full object-cover" />
                  )}
                </div>

                {/* Details */}
                <div className="absolute top-[36%] left-[28%] w-[50%] text-[0.6rem] sm:text-[0.65rem] text-black">
                  <div className="mb-1 text-[0.8rem] sm:text-[0.9rem] font-bold leading-tight">
                    {user?.last_name?.toUpperCase() || ''} {user?.first_name?.toUpperCase() || ''}
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-gray-800">Registration No.:</span>
                    <span className="font-semibold">{user?.card?.id_number || ''}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-gray-800">Category:</span>
                    <span className="font-semibold">{formatMembershipLabel(user?.membership_type)}</span>
                  </div>

                  {expiryDate && (
                    <div className="flex items-center gap-1">
                      <span className="text-gray-800">Reg. Period Ending:</span>
                      <span className="font-semibold">{expiryDate}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-gray-800">Signature</span>
                    <div className="h-4 w-14 bg-white/70">
                      {memberSignature && (
                        <img src={memberSignature} alt="Signature" className="h-full w-full object-contain" />
                      )}
                    </div>
                  </div>
                </div>

                {/* QR Code */}
                <div className="absolute top-[26%] right-[6%]">
                  <div className="bg-white p-1 rounded shadow-sm">
                    <QRCodeSVG value={verificationUrl} size={44} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Back of ID Card */}
          <div className="relative">
            <div
              className="rounded-lg overflow-hidden shadow-xl"
              style={{
                width: '400px',
                height: '252px',
                backgroundImage: `url(${backCard})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="relative h-full w-full">
                {/* Authorised signature overlay */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-[18%] w-[36%] h-[10%] flex items-center justify-center pointer-events-none">
                  {resolvedAuthorisedSignature ? (
                    <img
                      src={resolvedAuthorisedSignature}
                      alt="Authorised Signature"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full"></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewIDCardPreview;
