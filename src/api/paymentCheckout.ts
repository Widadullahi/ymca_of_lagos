type CheckoutData = { payment_url?: string; payment_reference?: string };

export async function startPaymentCheckout(data: CheckoutData, onError: (message: string) => void) {
  try {
    if (!data?.payment_url || !data.payment_reference) throw new Error('The payment link was not returned.');
    const url = new URL(data.payment_url);
    if (url.protocol !== 'https:' || url.hostname !== 'checkout.paystack.com') {
      throw new Error('Invalid Paystack checkout address.');
    }
    localStorage.setItem('paystack_reference', data.payment_reference);
    window.location.assign(url.toString());
  } catch (error) {
    onError(error instanceof Error ? error.message : 'Unable to open checkout.');
  }
}
