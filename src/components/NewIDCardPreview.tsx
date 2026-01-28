import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../context/NewAuthContext';
import frontCard from '../assets/idcard/front.png';
import backCard from '../assets/idcard/back.png';


interface IDCardPreviewProps {
    member?: any;
    forwardedRef?: React.Ref<HTMLDivElement>;
}

// Updated IDCardPreview component with QR code
const NewIDCardPreview: React.FC<IDCardPreviewProps> = ({ member, forwardedRef }) => {

    const { user: authUser } = useAuth();
    const user = member || authUser;
    const verificationUrl = `${window.location.origin}/verify/#verify=${user?.card?.id_number}`;

    return (
        <div className="w-full bg-gray-100 p-4" ref={forwardedRef}>
            <div className="max-w-6xl mx-auto">
                {/* ID Card Container - Fixed aspect ratio */}
                <div className="flex flex-col items-center space-y-8">

                    {/* Front of ID Card */}
                    <div className="relative">
                        <div
                            className="rounded-lg overflow-hidden shadow-xl relative"
                            style={{
                                width: 'min(90vw, 400px)',
                                height: 'calc(min(90vw, 400px) * 0.63)', // Credit card ratio (1.586:1 inverted = 0.63)
                                minWidth: '320px',
                                minHeight: '200px',
                                backgroundImage: `url(${frontCard})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }}
                        >
                            <div className="relative h-full w-full p-4 sm:p-5 text-black">

                                {/* Content Overlay */}
                                <div className="flex h-full items-center">

                                    {/* Photo Section - Adjust positioning as needed */}
                                    <div className="absolute top-[35%] left-[6%] w-[18%] h-[40%] rounded-md overflow-hidden bg-gray-200">
                                        {/* <img
                                            src={user?.image}
                                            alt="Member"
                                            className="w-full h-full object-cover"
                                        /> */}
                                    </div>

                                    {/* Details Section - Adjust positioning to align with card fields */}
                                    <div className="absolute top-[32%] left-[28%] w-[50%] h-full flex flex-col justify-start space-y-0.5 sm:space-y-1 text-xs sm:text-xs font-semibold text-blue-900">

                                        {/* Name */}
                                        <div className="mb-2">
                                            <h3 className="text-sm sm:text-base font-bold leading-tight">{user?.last_name?.toUpperCase() || ''}</h3>
                                            <h4 className="text-sm sm:text-base font-bold leading-tight">{user?.first_name?.toUpperCase() || ''}</h4>
                                        </div>

                                        {/* Reg No */}
                                        <div className="flex flex-row items-center gap-1">
                                            <span className="font-normal text-[0.6rem] sm:text-[0.65rem] opacity-80 decoration-blue-900">Registration No.:</span>
                                            <span className="text-[0.6rem] sm:text-[0.65rem]">{user?.card?.id_number || ''}</span>
                                        </div>

                                        {/* Category */}
                                        <div className="flex flex-row items-center gap-1">
                                            <span className="font-normal text-[0.6rem] sm:text-[0.65rem] opacity-80 text-blue-900">Category:</span>
                                            <span className="text-[0.6rem] sm:text-[0.65rem] uppercase">{user?.membership_type?.replace('_', ' ') || 'FULL MEMBER'}</span>
                                        </div>

                                        {/* Expiry */}
                                        <div className="flex flex-row items-center gap-1">
                                            <span className="font-normal text-[0.6rem] sm:text-[0.65rem] opacity-80 text-blue-900">Expired At:</span>
                                            <span className="text-[0.6rem] sm:text-[0.65rem]">{user?.card?.expired_at || ''}</span>
                                        </div>

                                        {/* Signature */}
                                        <div className="mt-1 flex items-center gap-1">
                                            <span className="font-normal text-[0.6rem] sm:text-[0.65rem] opacity-80 text-blue-900">Holder's Signature:</span>
                                            <div className="h-4 sm:h-5 w-16">
                                                {user?.card?.signature && (
                                                    <img
                                                        src={user?.card?.signature}
                                                        alt="Signature"
                                                        className="h-full object-contain"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* QR Code Section */}
                                    <div className="absolute top-[25%] right-[5%] flex flex-col items-center">
                                        <div className="bg-white p-1 rounded shadow-sm">
                                            <QRCodeSVG
                                                value={verificationUrl}
                                                size={45}
                                            />
                                        </div>
                                        <p className="text-[0.5rem] mt-1 text-center font-medium text-white">Scan to verify</p>
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
                                width: 'min(90vw, 400px)',
                                height: 'calc(min(90vw, 400px) * 0.63)',
                                minWidth: '320px',
                                minHeight: '200px',
                                backgroundImage: `url(${backCard})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }}
                        >
                            {/* Content for back of card can be added here if needed, currently just the image */}
                            <div className="relative h-full w-full p-4 flex flex-col items-center justify-center text-center">
                                {/* Depending on if the back image already has text, we might leave this empty or overlay text */}
                                {/* Usually back image has the text, so we leave it clear unless dynamic text is needed */}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default NewIDCardPreview;
