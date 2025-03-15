import React from 'react';
import avatar from '../assets/images/default.jpg';
import { useAuth } from '../context/NewAuthContext';

interface IDCardPreviewProps {
  forwardedRef?: React.Ref<HTMLDivElement>;
}

const IDCardPreview: React.FC<IDCardPreviewProps> = ({ forwardedRef }) => {
  const { user } = useAuth();
  
  return (
    <div className="w-full max-w-md mx-auto" ref={forwardedRef}>
      {/* Front of ID Card - Using landscape orientation properly */}
      <div className="bg-white rounded-lg overflow-hidden shadow-lg mb-8 w-[350px] h-[200px] mx-auto">
        <div className="relative h-full w-full">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-white" style={{ 
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f87171' fill-opacity='0.1' fill-rule='evenodd'%3E%3Cpath d='M10 0l10 10-10 10L0 10z'/%3E%3C/g%3E%3C/svg%3E\")",
            backgroundSize: "20px 20px"
          }}></div>
          
          {/* Card Content */}
          <div className="relative p-3 h-full flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <div className="mr-2">
                  <div className="w-6 h-6 bg-red-600 flex items-center justify-center">
                    <div className="w-4 h-4 bg-white flex items-center justify-center">
                      <div className="w-2 h-2 bg-red-600 rotate-45"></div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-xl font-bold">YMCA</div>
                  <div className="text-xs text-red-600 font-semibold">OF LAGOS</div>
                </div>
              </div>
              
              <div className="bg-red-600 h-full p-2">
                <div className="text-white text-lg font-bold">
                  MEMBER
                </div>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="flex mb-2 flex-grow">
              {/* Photo */}
              <div className="mr-3 border-2 border-red-600 w-16 h-24 flex-shrink-0">
                <img 
                  src={user?.image || avatar}
                  alt="Member" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Info */}
              <div className="flex-grow text-gray-700">
                <h2 className="text-xl font-bold">{user?.last_name?.toUpperCase() || ''}</h2>
                <h3 className="text-lg mb-1">{user?.first_name?.toUpperCase() || ''}</h3>
                
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div className="font-semibold">Registration No.:</div>
                  <div className="text-red-600 font-bold">{user?.card?.id_number || ''}</div>
                  
                  <div className="font-semibold">Category:</div>
                  <div className="text-red-600 font-bold">{user?.category?.name || 'FULL MEMBER'}</div>
                  
                  <div className="font-semibold">Reg. Period Ending:</div>
                  <div className="text-red-600 font-bold">{user?.card?.expired_at || ''}</div>
                  
                  <div className="font-semibold mt-1">Holder's Signature:</div>
                </div>
                
                {/* Signature */}
                <div className="h-6 mt-1">
                  {user?.card?.signature ? (
                    <img 
                      src={user?.card?.signature} 
                      alt="Signature" 
                      className="h-full object-contain"
                    />
                  ) : (
                    <div className="border-b border-gray-400 h-full"></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Back of ID Card */}
      <div className="bg-white rounded-lg overflow-hidden shadow-lg text-gray-700 w-[350px] h-[200px] mx-auto">
        <div className="relative h-full">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-white" style={{ 
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f87171' fill-opacity='0.1' fill-rule='evenodd'%3E%3Cpath d='M10 0l10 10-10 10L0 10z'/%3E%3C/g%3E%3C/svg%3E\")",
            backgroundSize: "20px 20px"
          }}></div>
          
          {/* Card Content */}
          <div className="relative p-4 text-center h-full w-full flex flex-col justify-center">
            <p className="text-sm mb-1">This ID card remains the property of</p>
            <h2 className="text-lg font-bold mb-1">YMCA OF LAGOS</h2>
            <p className="text-sm mb-1">77, Awolowo S/W Road Ikoyi, Lagos.</p>
            <p className="text-sm mb-2">and is for identification only.</p>
            <p className="text-sm mb-2">If found kindly return to<br />the address above.</p>
            
            {/* Signature */}
            <div className="h-8 mb-1">
              <img 
                src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 30'%3E%3Cpath d='M10,15 C20,5 30,25 40,15 C50,5 60,25 70,15 C80,5 90,25 95,15' stroke='black' fill='none' stroke-width='1'/%3E%3C/svg%3E" 
                alt="Official Signature" 
                className="h-full object-contain mx-auto"
              />
            </div>
            
            <div className="flex justify-center items-center">
              <div className="border-t border-gray-400 w-24 text-center">
                <p className="text-xs mt-1">Authorised Signature</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IDCardPreview;