import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../context/NewAuthContext';
import ymca from '../assets/images/image.png'



interface IDCardPreviewProps {
  forwardedRef?: React.Ref<HTMLDivElement>;
}
// Updated IDCardPreview component with QR code
const IDCardPreview: React.FC<IDCardPreviewProps> = ({ forwardedRef }) => {

  const { user } = useAuth();
  const verificationUrl = `${window.location.origin}/verify/#verify=${user?.card?.id_number}`;
  
  return (
    <div className="w-full  bg-gray-100 p-4" ref={forwardedRef}>
      <div className="max-w-6xl mx-auto">
        {/* ID Card Container - Fixed aspect ratio */}
        <div className="flex flex-col items-center space-y-8">
          
          {/* Front of ID Card */}
          <div className="relative">
            <div 
              className="bg-white rounded-lg overflow-hidden shadow-xl"
              style={{
                width: 'min(90vw, 400px)',
                height: 'calc(min(90vw, 400px) * 0.63)', // Credit card ratio (1.586:1 inverted = 0.63)
                minWidth: '320px',
                minHeight: '200px'
              }}
            >
              <div className="relative h-full w-full">
                {/* Background pattern */}
                <div 
                  className="absolute inset-0 bg-white opacity-30" 
                  style={{ 
                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f87171' fill-opacity='0.1' fill-rule='evenodd'%3E%3Cpath d='M10 0l10 10-10 10L0 10z'/%3E%3C/g%3E%3C/svg%3E\")",
                    backgroundSize: "20px 20px"
                  }}
                />
                
                {/* Card Content */}
                <div className="relative p-3 sm:p-4 h-full flex flex-col text-xs sm:text-sm">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-2 sm:mb-3">
                    <div className="flex items-center">
                    <img 
                    src={ymca} 
                    alt="YMCA Lagos Logo" 
                    className="h-8 w-auto object-contain" 
                  />
                    </div>
               
                  </div>
                  
                  {/* Main Content */}
                  <div className="flex flex-grow min-h-0">
                    {/* Photo */}
                    <div className="mr-2 sm:mr-3 flex-shrink-0" 
                         style={{width: 'clamp(40px, 15%, 60px)', aspectRatio: '2/3'}}>
                      <img 
                        src={user?.image}
                        alt="Member" 
                        className="w-full max-w-16 max-h-16 h-full object-cover"
                      />
                    </div>
                    
                    {/* Info Section */}
                    <div className="flex-grow min-w-0 text-gray-700">
                      <div className="space-y-1">
                        <h3 className="text-xs sm:text-xl">{user?.last_name?.toUpperCase() || ''}</h3>
                        <h4 className="text-xs sm:text-lg mb-1">{user?.first_name?.toUpperCase() || ''}</h4>
                      </div>
                      
                      
                      <div className="space-y-1">
                        <div className="flex flex-col sm:flex-row sm:gap-2">
                          <span className="font-normal text-xs whitespace-nowrap">Registration No.:</span>
                          <span className="text-red-600 font-medium text-xs break-all">{user?.card?.id_number || ''}</span>
                        </div>
                        
                        <div className="flex flex-row gap-1 items-center">
                          <span className="font-normal text-xs whitespace-nowrap">Category:</span>
                          <span className="text-red-600 font-medium text-xs">{user?.category?.name || 'FULL MEMBER'}</span>
                        </div>
                        
                        <div className="flex flex-row gap-1 items-center">
                          <span className="font-normal text-xs whitespace-nowrap">Expired At:</span>
                          <span className="text-red-600 font-medium text-xs">{user?.card?.expired_at || ''}</span>
                        </div>
                        
                        <div className="mt-1 flex gap-1 items-center">
                          <div className="font-normal text-xs mb-1">Holder's Signature:</div>
                          <div className="h-3 sm:h-6">
                            {user?.card?.signature ? (
                              <img 
                                src={user?.card?.signature} 
                                alt="Signature" 
                                className="h-full object-contain"
                              />
                            ) : (
                              <div className="border-b border-gray-400 h-full w-16"></div> 
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* QR Code */}
                    <div className="flex flex-col items-center ml-1 sm:ml-2 flex-shrink-0">
                      <QRCodeSVG 
                        value={verificationUrl}
                        size={35}
                      />
                      <p className="text-xs text-gray-500 mt-1 text-center leading-tight">
                        Scan to<br/>verify
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Back of ID Card */}
          <div className="relative">
            <div 
              className="bg-white rounded-lg overflow-hidden shadow-xl text-gray-700"
              style={{
                width: 'min(90vw, 400px)',
                height: 'calc(min(90vw, 400px) * 0.63)',
                minWidth: '320px',
                minHeight: '200px'
              }}
            >
              <div className="relative h-full">
                {/* Background pattern */}
                <div 
                  className="absolute inset-0 bg-white opacity-30" 
                  style={{ 
                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f87171' fill-opacity='0.1' fill-rule='evenodd'%3E%3Cpath d='M10 0l10 10-10 10L0 10z'/%3E%3C/g%3E%3C/svg%3E\")",
                    backgroundSize: "20px 20px"
                  }}
                />
                
                {/* Card Content */}
                <div className="relative p-4 sm:p-6 text-center h-full w-full flex flex-col justify-center">
                  <p className="text-xs sm:text-sm mb-1">This ID card remains the property of</p>
                  <h2 className="text-sm sm:text-lg font-bold mb-1">YMCA OF LAGOS</h2>
                  <p className="text-xs sm:text-sm mb-1">77, Awolowo S/W Road Ikoyi, Lagos.</p>
                  <p className="text-xs sm:text-sm mb-2">and is for identification only.</p>
                  <p className="text-xs sm:text-sm mb-3">
                    If found kindly return to<br />the address above.
                  </p>
                  
                  {/* Signature */}
                  <div className="h-6 sm:h-8 mb-2">
                    <img 
                      src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 30'%3E%3Cpath d='M10,15 C20,5 30,25 40,15 C50,5 60,25 70,15 C80,5 90,25 95,15' stroke='black' fill='none' stroke-width='1'/%3E%3C/svg%3E" 
                      alt="Official Signature" 
                      className="h-full object-contain mx-auto"
                    />
                  </div>
                  
                  <div className="flex justify-center items-center">
                    <div className="border-t border-gray-400 w-20 sm:w-24 text-center">
                      <p className="text-xs mt-1">Authorised Signature</p>
                    </div>
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