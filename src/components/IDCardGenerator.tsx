import React, { useRef } from 'react';
import IDCardPreview from './IDCardPreview';
import NewIDCardPreview from './NewIDCardPreview';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useAuth } from '../context/NewAuthContext';

interface IDCardGeneratorProps {
  member?: any;
  isAdminView?: boolean;
  variant?: 'modern' | 'image' | 'auto';
}

const IDCardGenerator: React.FC<IDCardGeneratorProps> = ({ member, isAdminView, variant = 'auto' }) => {
  const { user: authUser } = useAuth();
  const cardRef = useRef<HTMLDivElement>(null);
  const effectiveUser = member || authUser;
  const membershipType = (effectiveUser?.membership_type || '').toString().toLowerCase();
  const shouldUseTemplate =
    membershipType === 'ordinary' ||
    membershipType === 'full' ||
    membershipType === 'honorary' ||
    membershipType === 'life';
  const resolvedVariant = variant === 'auto' ? (shouldUseTemplate ? 'image' : 'modern') : variant;
  const CardComponent = resolvedVariant === 'image' ? NewIDCardPreview : IDCardPreview;

  const captureCardSides = async () => {
    if (!cardRef.current) return [];

    const sideElements = Array.from(
      cardRef.current.querySelectorAll<HTMLElement>('[data-card-side]')
    );

    const targets = sideElements.length > 0 ? sideElements : [cardRef.current];
    const captures: string[] = [];

    for (const target of targets) {
      const canvas = await html2canvas(target, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      captures.push(canvas.toDataURL('image/png'));
    }

    return captures;
  };

  const handlePrintCard = async () => {
    const images = await captureCardSides();
    if (images.length === 0) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to print the ID card.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>YMCA ID Card</title>
          <style>
            body {
              margin: 0;
              padding: 24px 0;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              background: #f5f5f5;
            }
            .page {
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              page-break-after: always;
              break-after: page;
              padding: 16px;
              box-sizing: border-box;
            }
            .page:last-child {
              page-break-after: auto;
              break-after: auto;
            }
            img {
              max-width: 100%;
              width: 400px;
              height: auto;
              display: block;
              box-shadow: 0 12px 32px rgba(0, 0, 0, 0.16);
              border-radius: 12px;
              background: white;
            }
            @media print {
              body {
                padding: 0;
                background: white;
              }
              .print-button {
                display: none;
              }
              .page {
                padding: 0;
              }
              img {
                box-shadow: none;
                border-radius: 0;
              }
            }
          </style>
        </head>
        <body>
          ${images.map((image, index) => `
            <div class="page">
              <img src="${image}" alt="YMCA ID Card ${index + 1}" />
            </div>
          `).join('')}
          <div class="print-button" style="position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); margin-top: 20px;">
            <button onclick="window.print(); window.close();" style="background-color: #dc2626; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;">
              Print ID Card
            </button>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  const handleDownloadAsPDF = async () => {
    try {
      const images = await captureCardSides();
      if (images.length === 0) return;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [210, 297] // A4 size
      });

      const imgWidth = 180; // mm
      const imgHeight = 113.4;
      const posX = (210 - imgWidth) / 2;
      const posY = 20; // Top margin

      images.forEach((image, index) => {
        if (index > 0) {
          pdf.addPage();
        }
        pdf.addImage(image, 'PNG', posX, posY, imgWidth, imgHeight);
      });

      pdf.save('YMCA_ID_Card.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleDownloadAsImage = async () => {
    try {
      const images = await captureCardSides();
      if (images.length === 0) return;

      images.forEach((image, index) => {
        const link = document.createElement('a');
        link.download = `YMCA_ID_Card_${index === 0 ? 'front' : 'back'}.png`;
        link.href = image;
        link.click();
      });
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to download image. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-none mx-auto">
      <div className={`${isAdminView ? '' : 'bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4'}`}>
        {!isAdminView && <h2 className="text-2xl font-bold mb-6 text-center">ID Card Generator</h2>}

        <div className="flex flex-col items-center">
          <div className="mb-6" ref={cardRef}>
            <CardComponent member={member} />
          </div>
          <div className="text-center mb-4">
            <p className="text-gray-700 mb-4">
              {isAdminView
                ? `You are viewing the ID card for ${member?.first_name} ${member?.last_name}. You can print or download it below.`
                : "Your ID card has been generated. You can print it or download it."}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline"
                onClick={handlePrintCard}
              >
                Print ID Card
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline"
                onClick={handleDownloadAsPDF}
              >
                Download as PDF
              </button>
              <button
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline"
                onClick={handleDownloadAsImage}
              >
                Download as Image
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IDCardGenerator;
