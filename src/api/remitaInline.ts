type RemitaInlineOptions = {
  rrr: string;
  scriptUrl?: string;
  inlineConfig?: Record<string, unknown>;
  verificationUrl?: string;
};

type RemitaPaymentWidget = {
  showPaymentWidget: () => void;
};

type RemitaPaymentEngine = {
  init: (options: Record<string, unknown>) => RemitaPaymentWidget;
};

declare global {
  interface Window {
    RmPaymentEngine?: RemitaPaymentEngine;
  }
}

const DEFAULT_REMITA_SCRIPT_URL = 'https://demo.remita.net/payment/v1/remita-pay-inline.bundle.js';
const REMITA_SCRIPT_ID = 'remita-pay-inline-script';

function getScriptUrl(paymentUrl?: string) {
  if (!paymentUrl) return DEFAULT_REMITA_SCRIPT_URL;

  try {
    const url = new URL(paymentUrl);
    url.search = '';
    return url.toString();
  } catch {
    return DEFAULT_REMITA_SCRIPT_URL;
  }
}

function loadRemitaScript(scriptUrl?: string) {
  return new Promise<void>((resolve, reject) => {
    if (window.RmPaymentEngine) {
      resolve();
      return;
    }

    const resolvedScriptUrl = getScriptUrl(scriptUrl);
    const existingScript = document.getElementById(REMITA_SCRIPT_ID) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Unable to load Remita payment script')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = REMITA_SCRIPT_ID;
    script.src = resolvedScriptUrl;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Unable to load Remita payment script'));
    document.body.appendChild(script);
  });
}

export async function openRemitaInlinePayment({
  rrr,
  scriptUrl,
  inlineConfig,
  verificationUrl = '/payment',
}: RemitaInlineOptions) {
  if (!rrr) {
    throw new Error('Missing Remita RRR');
  }

  await loadRemitaScript(scriptUrl);

  if (!window.RmPaymentEngine) {
    throw new Error('Remita payment engine is unavailable');
  }

  const goToVerification = () => {
    window.location.assign(`${verificationUrl}?rrr=${encodeURIComponent(rrr)}`);
  };

  const paymentEngine = window.RmPaymentEngine.init({
    ...(inlineConfig || {}),
    processRrr: true,
    paymentReference: String(inlineConfig?.paymentReference || rrr),
    transactionId: String(inlineConfig?.transactionId || rrr),
    onSuccess: goToVerification,
    onError: goToVerification,
    onClose: goToVerification,
  });

  paymentEngine.showPaymentWidget();
}
