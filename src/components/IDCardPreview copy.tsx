import React from 'react';
import { useAuth } from '../context/AuthContext';
import avatar from '../assets/images/widad.jpeg'

const IDCardPreview: React.FC = () => {
  const { currentUser } = useAuth();
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg overflow-hidden shadow-lg mb-4">
        {/* Front of ID Card */}
        <div className="relative">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-white" style={{ 
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f87171' fill-opacity='0.1' fill-rule='evenodd'%3E%3Cpath d='M10 0l10 10-10 10L0 10z'/%3E%3C/g%3E%3C/svg%3E\")",
            backgroundSize: "20px 20px"
          }}></div>
          
          {/* Card Content */}
          <div className="relative p-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <div className="mr-2">
                  <div className="w-8 h-8 bg-red-600 flex items-center justify-center">
                    <div className="w-6 h-6 bg-white flex items-center justify-center">
                      <div className="w-4 h-4 bg-red-600 rotate-45"></div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold">YMCA</div>
                  <div className="text-xs text-red-600 font-semibold">OF LAGOS</div>
                </div>
              </div>
              
              <div className="bg-red-600 h-full p-2">
                <div className="text-white text-2xl font-bold writing-vertical transform rotate-180">
                  MEMBER
                </div>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="flex mb-4">
              {/* Photo */}
              <div className="mr-4 border-2 border-red-600 w-24 h-32 flex-shrink-0">
                {/* {currentUser?.photo && (
                  <img 
                    src={avatar}
                    alt="Member" 
                    className="w-full h-full object-cover"
                  />
                )} */}
                <img 
                  src={avatar}
                  alt="Member" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Info */}
              <div className="flex-grow text-gray-700">
                <h2 className="text-3xl font-bold">{currentUser?.lastName.toUpperCase()}</h2>
                <h3 className="text-2xl mb-2">{currentUser?.firstName.toUpperCase()}</h3>
                
                <div className="grid grid-cols-2 gap-1 text-sm">
                  <div className="font-semibold">Registration No.:</div>
                  <div className="text-red-600 font-bold">{currentUser?.registrationNumber}</div>
                  
                  <div className="font-semibold">Category:</div>
                  <div className="text-red-600 font-bold">{currentUser?.category}</div>
                  
                  <div className="font-semibold">Reg. Period Ending:</div>
                  <div className="text-red-600 font-bold">{currentUser?.registrationEndDate}</div>
                  
                  <div className="font-semibold mt-2">Holder's Signature:</div>
                </div>
                
                {/* Signature */}
                <div className="h-10 mt-1">
                  {currentUser?.signature ? (
                    <img 
                      src={currentUser?.signature} 
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
      <div className="bg-white rounded-lg overflow-hidden shadow-lg text-gray-700">
        <div className="relative">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-white" style={{ 
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f87171' fill-opacity='0.1' fill-rule='evenodd'%3E%3Cpath d='M10 0l10 10-10 10L0 10z'/%3E%3C/g%3E%3C/svg%3E\")",
            backgroundSize: "20px 20px"
          }}></div>
          
          {/* Card Content */}
          <div className="relative p-6 text-center">
            <p className="text-base mb-1">This ID card remains the property of</p>
            <h2 className="text-2xl font-bold mb-1">YMCA OF LAGOS</h2>
            <p className="text-base mb-1">77, Awolowo S/W Road Ikoyi, Lagos.</p>
            <p className="text-base mb-4">and is for identification only.</p>
            <p className="text-base mb-4">If found kindly return to<br />the address above.</p>
            
            {/* Signature */}
            <div className="h-12 mb-2">
              <img 
                src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 30'%3E%3Cpath d='M10,15 C20,5 30,25 40,15 C50,5 60,25 70,15 C80,5 90,25 95,15' stroke='black' fill='none' stroke-width='1'/%3E%3C/svg%3E" 
                alt="Official Signature" 
                className="h-full object-contain mx-auto"
              />
            </div>
            
            <div className="flex justify-center items-center">
              <div className="border-t border-gray-400 w-32 text-center">
                <p className="text-sm mt-1">Authorised Signature</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IDCardPreview;