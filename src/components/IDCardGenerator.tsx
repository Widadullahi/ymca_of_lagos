// components/IDCardGenerator.tsx
import React, { useState } from 'react';
// import { User } from '../types';
import IDCardPreview from './IDCardPreview';
import { User } from '../types/types';

interface IDCardGeneratorProps {
  user: User;
}

const IDCardGenerator: React.FC<IDCardGeneratorProps> = ({ user }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);

  const handleGenerateCard = () => {
    setIsGenerating(true);
    
    // Simulate API call or processing time
    setTimeout(() => {
      setIsGenerating(false);
      setIsGenerated(true);
    }, 1500);
  };

  const handlePrintCard = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold mb-6 text-center">ID Card Generator</h2>
        
        {!isGenerated ? (
          <div className="mb-6 text-center">
            <p className="text-gray-700 mb-4">
              Click the button below to generate your YMCA of Lagos ID Card.
            </p>
            <button
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline"
              onClick={handleGenerateCard}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </span>
              ) : (
                "Generate ID Card"
              )}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="mb-6 print:mb-0">
              <IDCardPreview user={user} />
            </div>
            <div className="text-center mb-4 print:hidden">
              <p className="text-gray-700 mb-4">
                Your ID card has been generated. You can print it or save it as PDF.
              </p>
              <button
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline"
                onClick={handlePrintCard}
              >
                Print ID Card
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IDCardGenerator;