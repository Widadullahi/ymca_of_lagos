import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/NewAuthContext';

export default function LocalCheckoutPage() {
  const { fetchWithAuth } = useAuth();
  const [params] = useSearchParams();
  const reference = params.get('reference');
  const navigate = useNavigate();
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!reference) { setError('Missing payment reference'); return; }
    fetchWithAuth({ path: `/payment/local-test/${reference}/`, isAthenticated: false })
      .then((r: any) => setAmount(r.data.amount)).catch((e: Error) => setError(e.message));
  }, [reference]);
  const complete = async (outcome: string) => {
    setBusy(true);
    try {
      await fetchWithAuth({ path: `/payment/local-test/${reference}/`, method: 'POST', body: { outcome }, isAthenticated: false });
      navigate(`/payment?reference=${encodeURIComponent(reference || '')}`);
    } catch (e: any) { setError(e.message); setBusy(false); }
  };
  return <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6"><section className="max-w-lg w-full rounded-2xl bg-white border p-8 shadow-sm">
    <p className="text-sm font-bold text-amber-700">LOCAL TEST CHECKOUT</p><h1 className="text-2xl font-bold mt-3">Try your donation checkout</h1>
    <p className="text-gray-600 mt-3">This simulates the hosted payment flow. No card details are needed and no money will be charged.</p>
    {amount && <p className="text-4xl font-bold my-8">₦{Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>}
    {error && <p role="alert" className="text-red-700 my-4">{error}</p>}
    <div className="grid gap-3 mt-6"><button disabled={busy || !amount} onClick={() => complete('success')} className="bg-green-700 text-white rounded-lg p-3 disabled:opacity-50">Complete test payment</button>
    <button disabled={busy || !amount} onClick={() => complete('failed')} className="border rounded-lg p-3">Simulate failed payment</button>
    <button disabled={busy} onClick={() => navigate('/')} className="text-gray-600 p-3">Cancel and return home</button></div>
  </section></main>;
}
