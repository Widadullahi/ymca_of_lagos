import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/NewAuthContext';
import frontCard from '../assets/idcard/front.png';
import backCard from '../assets/idcard/back-blank.png';
import defaultSignature from '../assets/idcard/default-signature-1.png';
import ymcaLogo from '../assets/images/image.png';
import QRCode from 'qrcode';

// Build fix for missing @types/qrcode
declare module 'qrcode' {
  export function toDataURL(text: string, options?: any): Promise<string>;
}

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
  // Only show expiry if card is active (payment made)
  if (!user?.card?.is_active) return '';

  const baseDate =
    (user?.card?.created_at && new Date(user.card.created_at)) ||
    (user?.created_at && new Date(user.created_at)) ||
    new Date();

  const expiryYear = baseDate.getFullYear() + 1;
  const expiry = new Date(expiryYear, 4, 31); // May 31 of next year
  return expiry.toISOString().split('T')[0];
};

const NewIDCardPreview: React.FC<IDCardPreviewProps> = ({ member, forwardedRef }) => {
  const [systemSignature, setSystemSignature] = React.useState<string | null>(null);
  const [fetchingSignature, setFetchingSignature] = React.useState(true);
  const { user: authUser, fetchWithAuth } = useAuth();
  const user = member || authUser;
  const frontCanvasRef = useRef<HTMLCanvasElement>(null);
  const backCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const fetchSystemSignature = async () => {
      try {
        const response = await fetchWithAuth({
          method: 'GET',
          path: '/admin/system/card-signature/',
        });
        if (response?.data?.signature) {
          setSystemSignature(response.data.signature);
        }
      } catch (error) {
        console.error('Error fetching system signature:', error);
      } finally {
        setFetchingSignature(false);
      }
    };
    fetchSystemSignature();
  }, []);

  const drawFront = async () => {
    const canvas = frontCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = 400;
    const height = 252;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    };

    try {
      const membershipType = (user?.membership_type || '').toString().toLowerCase();
      const isHonoraryOrLife = membershipType === 'honorary' || membershipType === 'life';

      if (isHonoraryOrLife) {
        ctx.fillStyle = '#fcfcfc';
        ctx.fillRect(0, 0, width, height);

        const logo = await loadImage(ymcaLogo);
        ctx.save();
        ctx.globalAlpha = 0.1;
        for (let y = 12; y < height; y += 26) {
          for (let x = 12; x < width - 44; x += 32) {
            ctx.drawImage(logo, x, y, 14, 14);
          }
        }
        ctx.restore();

        ctx.drawImage(logo, 18, 18, 150, 58);

        ctx.fillStyle = '#111111';
        ctx.fillRect(width - 40, 0, 40, height);
        ctx.fillStyle = '#e31b23';
        ctx.fillRect(width - 40, 0, 40, 62);
        ctx.fillRect(width - 40, 156, 40, 56);

        ctx.save();
        ctx.translate(width - 20, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('MEMBER ID', 0, 0);
        ctx.restore();

        const photoX = 22;
        const photoY = 100;
        const photoW = 86;
        const photoH = 118;
        ctx.strokeStyle = '#d71920';
        ctx.lineWidth = 2;
        ctx.strokeRect(photoX, photoY, photoW, photoH);

        if (user?.image) {
          try {
            const photo = await loadImage(user.image);
            ctx.drawImage(photo, photoX + 2, photoY + 2, photoW - 4, photoH - 4);
          } catch (e) {
            console.error("Failed to load user image", e);
          }
        }

        const detailsX = 138;
        let currentY = 130;
        ctx.textAlign = 'left';
        ctx.fillStyle = '#202020';
        ctx.font = '24px serif';
        ctx.fillText('Registration No.:', detailsX, currentY);
        currentY += 30;
        ctx.fillText('Category:', detailsX, currentY);
        currentY += 30;
        ctx.fillText('Reg. Period Ending:', detailsX, currentY);
        currentY += 30;
        ctx.fillText('Signature', detailsX, currentY);

        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = '#000000';
        ctx.fillText((user?.card?.id_number || '').toUpperCase(), detailsX + 118, 130);
        ctx.fillText(formatMembershipLabel(user?.membership_type), detailsX + 82, 160);

        const expiryDate = formatExpiryDate(user) || 'LIFETIME';
        ctx.fillText(expiryDate, detailsX + 128, 190);

        const memberSignature = user?.card?.signature || null;
        if (memberSignature) {
          try {
            const sigImg = await loadImage(memberSignature);
            ctx.drawImage(sigImg, detailsX + 82, 198, 72, 24);
          } catch (e) {
            console.error("Failed to load signature", e);
          }
        }

        return;
      }

      const bg = await loadImage(frontCard);
      ctx.drawImage(bg, 0, 0, width, height);

      if (user?.image) {
        try {
          const photo = await loadImage(user.image);
          // Further refinement based on latest screenshot
          const photoW = width * 0.25;
          const photoH = height * 0.41;
          const photoX = width * 0.052;
          const photoY = height * 0.48;

          ctx.drawImage(photo, photoX, photoY, photoW, photoH);
        } catch (e) {
          console.error("Failed to load user image", e);
        }
      }

      // 3. Draw Details
      const detailsX = width * 0.33;
      const detailsY = height * 0.40;

      ctx.fillStyle = 'black';
      ctx.textAlign = 'left';

      // Name
      ctx.font = `bold ${Math.floor(width * 0.04)}px sans-serif`;
      const fullName = `${user?.last_name?.toUpperCase() || ''} ${user?.first_name?.toUpperCase() || ''}`;
      ctx.fillText(fullName, detailsX, detailsY + 15);

      ctx.font = `${Math.floor(width * 0.028)}px sans-serif`;
      ctx.fillStyle = '#1f2937';

      // Reg No
      let currentY = detailsY + 42;
      ctx.fillText(`Registration No.: `, detailsX, currentY);
      const regNo = (user?.card?.id_number || '').toUpperCase();
      ctx.font = `bold ${Math.floor(width * 0.028)}px sans-serif`;
      ctx.fillStyle = 'black';
      ctx.fillText(regNo, detailsX + ctx.measureText(`Registration No.: `).width + 5, currentY);

      // Category
      currentY += 20;
      ctx.font = `${Math.floor(width * 0.028)}px sans-serif`;
      ctx.fillStyle = '#1f2937';
      ctx.fillText(`Category: `, detailsX, currentY);
      const category = formatMembershipLabel(user?.membership_type).toUpperCase();
      ctx.font = `bold ${Math.floor(width * 0.028)}px sans-serif`;
      ctx.fillStyle = 'black';
      ctx.fillText(category, detailsX + ctx.measureText(`Category: `).width + 5, currentY);

      // Expiry
      const expiryDate = formatExpiryDate(user);
      if (expiryDate) {
        currentY += 20;
        ctx.font = `${Math.floor(width * 0.028)}px sans-serif`;
        ctx.fillStyle = '#1f2937';
        ctx.fillText(`Reg. Period Ending: `, detailsX, currentY);
        ctx.font = `bold ${Math.floor(width * 0.028)}px sans-serif`;
        ctx.fillStyle = 'black';
        ctx.fillText(expiryDate, detailsX + ctx.measureText(`Reg. Period Ending: `).width + 5, currentY);
      }

      // Signature
      const memberSignature = user?.card?.signature || null;
      if (memberSignature) {
        currentY += 28;
        ctx.font = `${Math.floor(width * 0.028)}px sans-serif`;
        ctx.fillStyle = '#1f2937';
        ctx.fillText(`Signature`, detailsX, currentY);

        try {
          const sigImg = await loadImage(memberSignature);
          ctx.drawImage(sigImg, detailsX + 65, currentY - 15, 60, 20);
        } catch (e) {
          console.error("Failed to load signature", e);
        }
      }

      // 4. Draw QR Code
      const verificationUrl = `${window.location.origin}/verify?verify=${encodeURIComponent(user?.card?.id_number || '')}`;
      const qrDataUrl = await QRCode.toDataURL(verificationUrl, { margin: 1, width: 44 * dpr });
      const qrImg = await loadImage(qrDataUrl);
      // Shifted left (0.88 -> 0.82) to avoid "MEMBER ID" vertical text
      ctx.drawImage(qrImg, width * 0.78, height * 0.12, 40, 40);

    } catch (err) {
      console.error('Error drawing front card:', err);
    }
  };

  const drawBack = async () => {
    const canvas = backCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = 400;
    const height = 252;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    };

    try {
      const bg = await loadImage(backCard);
      ctx.drawImage(bg, 0, 0, width, height);

      // Drawing authorized signature
      const resolvedAuthorisedSignature = member ? authUser?.signature : user?.signature || null;
      const signatureToDraw = resolvedAuthorisedSignature || systemSignature || defaultSignature;

      if (signatureToDraw) {
        try {
          const sigImg = await loadImage(signatureToDraw);
          const sigW = width * 0.36;
          const sigH = height * 0.10;
          const sigX = (width - sigW) / 2;
          // Positioned higher to stay clearly above the line (0.72 -> 0.58)
          const sigY = height * 0.58;
          ctx.drawImage(sigImg, sigX, sigY, sigW, sigH);
        } catch (e) {
          console.error("Failed to load authorised signature", e);
        }
      }
    } catch (err) {
      console.error('Error drawing back card:', err);
    }
  };

  useEffect(() => {
    drawFront();
    drawBack();
  }, [user, systemSignature]);

  if (!user || fetchingSignature) {
    return (
      <div className="w-full flex items-center justify-center p-12 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Preparing ID card preview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-100 p-4" ref={forwardedRef}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center space-y-8">
          <div className="relative shadow-xl rounded-lg overflow-hidden" data-card-side="front">
            <canvas ref={frontCanvasRef} />
          </div>
          <div className="relative shadow-xl rounded-lg overflow-hidden" data-card-side="back">
            <canvas ref={backCanvasRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewIDCardPreview;
