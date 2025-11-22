// import React from 'react';

// interface MembershipCardProps {
//   firstName: string;
//   lastName: string;
//   registrationNumber: string;
//   category: string;
//   expiryDate: string;
//   signature?: string;
//   photoUrl?: string;
// }

// const YMCAMembershipCard: React.FC<MembershipCardProps> = ({
//   firstName = 'ADEFEMI',
//   lastName = 'ADEDUGBE',
//   registrationNumber = 'LYA 697',
//   category = 'ADULT MEMBER',
//   expiryDate = '31/05/24',
//   signature,
//   photoUrl
// }) => {
//   return (
//     <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
//       {/* Card Container */}
//       <div className="relative w-full h-full">
//         {/* Background pattern */}
//         <div className="absolute inset-0 bg-white opacity-80">
//           <div className="grid grid-cols-10 gap-4">
//             {Array(100).fill(null).map((_, i) => (
//               <div key={i} className="text-pink-100 text-2xl">▽</div>
//             ))}
//           </div>
//         </div>

//         {/* Card Content */}
//         <div className="relative p-4 flex flex-col">
//           {/* Header with Logo */}
//           <div className="flex items-center justify-between mb-6">
//             <div className="flex items-center">
//               <div className="mr-2">
//                 <div className="w-12 h-12 bg-gray-200 rounded-sm flex items-center justify-center">
//                   <div className="text-red-600 text-3xl">▽</div>
//                 </div>
//               </div>
//               <div className="flex flex-col">
//                 <span className="text-4xl font-black">YMCA</span>
//                 <span className="text-red-600 text-sm font-medium">OF LAGOS</span>
//               </div>
//             </div>
            
//             {/* Right side red band */}
//             <div className="bg-red-600 h-32 w-16 absolute right-0 top-0 flex flex-col items-center justify-center text-white">
//               <span className="rotate-90 text-xl font-bold tracking-wider">MEMBER</span>
//             </div>
//           </div>

//           {/* Main Content */}
//           <div className="flex">
//             {/* Photo placeholder */}
//             <div className="w-32 h-40 border-4 border-red-600 mb-2 mr-4 flex-shrink-0">
//               {photoUrl ? (
//                 <img 
//                   src={photoUrl} 
//                   alt={`${firstName} ${lastName}`} 
//                   className="w-full h-full object-cover"
//                 />
//               ) : (
//                 <div className="w-full h-full bg-gray-200"></div>
//               )}
//             </div>

//             {/* Member details */}
//             <div className="flex flex-col">
//               <h1 className="text-4xl font-bold">{lastName}</h1>
//               <h2 className="text-3xl mb-4">{firstName}</h2>
              
//               <div className="grid grid-cols-2 gap-y-2">
//                 <div className="text-gray-600">Registration No.:</div>
//                 <div className="text-red-600 font-bold">{registrationNumber}</div>
                
//                 <div className="text-gray-600">Category:</div>
//                 <div className="text-red-600 font-bold">{category}</div>
                
//                 <div className="text-gray-600">Reg. Period Ending:</div>
//                 <div className="text-red-600 font-bold">{expiryDate}</div>
                
//                 <div className="text-gray-600">Holder's Signature:</div>
//                 <div className="italic text-gray-800 border-b border-gray-400 w-40">
//                   {signature && <span className="font-signature">{signature}</span>}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default YMCAMembershipCard;

import React from 'react';

interface MembershipCardProps {
  firstName: string;
  lastName: string;
  registrationNumber: string;
  category: string;
  expiryDate: string;
  signature?: string;
  photoUrl?: string;
}

const YMCAMembershipCard: React.FC<MembershipCardProps> = ({
  firstName = 'ADEFEMI',
  lastName = 'ADEDUGBE',
  registrationNumber = 'LYA 697',
  category = 'ADULT MEMBER',
  expiryDate = '31/05/24',
  signature,
  photoUrl
}) => {
  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Card Container */}
      <div className="relative w-full h-full">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-white opacity-80">
          <div className="grid grid-cols-10 gap-4">
            {Array(100).fill(null).map((_, i) => (
              <div key={i} className="text-pink-100 text-2xl">▽</div>
            ))}
          </div>
        </div>

        {/* Card Content */}
        <div className="relative p-4 flex flex-col">
          {/* Header with Logo */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="mr-2">
                <div className="w-12 h-12 bg-gray-200 rounded-sm flex items-center justify-center">
                  <div className="text-red-600 text-3xl">▽</div>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-4xl font-black">YMCA</span>
                <span className="text-red-600 text-sm font-medium">OF LAGOS</span>
              </div>
            </div>
            
            {/* Right side red band */}
            <div className="bg-red-600 h-32 w-16 absolute right-0 top-0 flex flex-col items-center justify-center text-white">
              <span className="rotate-90 text-xl font-bold tracking-wider">MEMBER</span>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-wrap items-start">
            {/* Photo placeholder */}
            <div className="w-32 h-40 border-4 border-red-600 mb-2 mr-4 flex-shrink-0">
              {photoUrl ? (
                <img 
                  src={photoUrl} 
                  alt={`${firstName} ${lastName}`} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200"></div>
              )}
            </div>

            {/* Member details */}
            <div className="flex flex-col space-y-2 flex-grow">
              <h1 className="text-4xl font-bold truncate">{lastName}</h1>
              <h2 className="text-3xl mb-4 truncate">{firstName}</h2>
              
              <div className="grid grid-cols-2 gap-y-2">
                <div className="text-gray-600">Registration No.:</div>
                <div className="text-red-600 font-bold">{registrationNumber}</div>
                
                <div className="text-gray-600">Category:</div>
                <div className="text-red-600 font-bold">{category}</div>
                
                <div className="text-gray-600">Reg. Period Ending:</div>
                <div className="text-red-600 font-bold">{expiryDate}</div>
                
                <div className="text-gray-600">Holder's Signature:</div>
                <div className="italic text-gray-800 border-b border-gray-400 w-40">
                  {signature && <span className="font-signature">{signature}</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YMCAMembershipCard;
