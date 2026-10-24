type RemitaInlineOptions = {
  rrr: string;
  scriptUrl?: string;
  inlineConfig?: Record<string, unknown>;
  verificationUrl?: string;
  onError?: (message: string) => void;
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
let scriptLoad: { url: string; promise: Promise<void> } | null = null;

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
  const resolvedScriptUrl = getScriptUrl(scriptUrl);
  if (scriptLoad?.url === resolvedScriptUrl) return scriptLoad.promise;
  if (scriptLoad) return Promise.reject(new Error('Reload this page before switching payment environments.'));
  const promise = new Promise<void>((resolve, reject) => {
    document.getElementById(REMITA_SCRIPT_ID)?.remove();
    const script = document.createElement('script');
    script.id = REMITA_SCRIPT_ID;
    script.src = resolvedScriptUrl;
    script.async = true;
    const timeout = window.setTimeout(() => fail(), 20000);
    const fail = () => {
      window.clearTimeout(timeout);
      script.onload = null;
      script.onerror = null;
      script.remove();
      scriptLoad = null;
      reject(new Error('Unable to load Remita payment script. Please try again.'));
    };
    script.onload = () => {
      window.clearTimeout(timeout);
      if (!window.RmPaymentEngine) { fail(); return; }
      resolve();
    };
    script.onerror = fail;
    document.body.appendChild(script);
  });
  scriptLoad = { url: resolvedScriptUrl, promise };
  return promise;
}

export async function openRemitaInlinePayment({
  rrr,
  scriptUrl,
  inlineConfig,
  verificationUrl = '/payment',
  onError,
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

  const remitaConfig = {
    ...(inlineConfig || {}),
    processRrr: true,
    paymentReference: String(inlineConfig?.paymentReference || rrr),
    transactionId: String(inlineConfig?.transactionId || rrr),
    // The widget serializes extendedData; paymentReference alone is discarded.
    extendedData: {
      ...((inlineConfig?.extendedData as Record<string, unknown>) || {}),
      customFields: [
        ...((((inlineConfig?.extendedData as any)?.customFields || []) as Array<{ name: string }>).filter(field => field.name !== 'rrr')),
        { name: 'rrr', value: rrr },
      ],
    },
    onSuccess: goToVerification,
    onError: () => onError?.('Remita could not complete checkout. You can retry or verify your payment reference if you were debited.'),
    onClose: () => {},
  };
  const paymentEngine = window.RmPaymentEngine.init(remitaConfig);

  paymentEngine.showPaymentWidget();
}
