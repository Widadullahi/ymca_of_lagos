import { openRemitaInlinePayment } from './remitaInline';

export async function startPaymentCheckout(data: any, onError: (message: string) => void) {
  if (data?.checkout_type === 'hosted') {
    if (!data.payment_reference || !data.payment_url) throw new Error('The payment link was not returned.');
    const url = new URL(data.payment_url, window.location.origin);
    const localTest = url.origin === window.location.origin && url.pathname === '/checkout/local-test';
    if (url.protocol !== 'https:' && !localTest) throw new Error('Invalid checkout address.');
    localStorage.setItem('remita_reference', data.payment_reference);
    localStorage.removeItem('remita_rrr');
    window.location.assign(url.toString());
    return;
  }
  if (!data?.rrr) throw new Error('Missing Remita RRR');
  localStorage.setItem('remita_rrr', data.rrr);
  localStorage.removeItem('remita_reference');
  await openRemitaInlinePayment({ rrr: data.rrr, scriptUrl: data.payment_url, inlineConfig: data.inline_config, onError });
}
