import React, { useRef } from 'react';
import IDCardPreview from './IDCardPreview';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface IDCardGeneratorProps {
  member?: any;
  isAdminView?: boolean;
}

const IDCardGenerator: React.FC<IDCardGeneratorProps> = ({ member, isAdminView }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // Instead of using window.print(), create a new window with only the card content
  const handlePrintCard = () => {
    if (!cardRef.current) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to print the ID card.');
      return;
    }

    // Get the HTML content of the ID card
    const cardHTML = cardRef.current.innerHTML;

    // Create a print-friendly document
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>YMCA ID Card</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            }
            .card-container {
              max-width: 400px;
              width: 100%;
            }
            @media print {
              body {
                padding: 0;
              }
              .print-button {
                display: none;
              }
            }
          </style>
          <!-- Include Tailwind styles for proper rendering -->
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        </head>
        <body>
          <div class="card-container">
            ${cardHTML}
          </div>
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
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        logging: false,
        windowHeight: cardRef.current.scrollHeight,
        windowWidth: cardRef.current.scrollWidth
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [210, 297] // A4 size
      });

      // Calculate dimensions to fit the card properly
      const imgWidth = 180; // mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const posX = (210 - imgWidth) / 2; // Center horizontally
      const posY = 20; // Top margin

      pdf.addImage(imgData, 'PNG', posX, posY, imgWidth, imgHeight);
      pdf.save('YMCA_ID_Card.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleDownloadAsImage = async () => {
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        windowHeight: cardRef.current.scrollHeight,
        windowWidth: cardRef.current.scrollWidth
      });

      const link = document.createElement('a');
      link.download = 'YMCA_ID_Card.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to download image. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className={`${isAdminView ? '' : 'bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4'}`}>
        {!isAdminView && <h2 className="text-2xl font-bold mb-6 text-center">ID Card Generator</h2>}

        <div className="flex flex-col items-center">
          <div className="mb-6" ref={cardRef}>
            <IDCardPreview member={member} />
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