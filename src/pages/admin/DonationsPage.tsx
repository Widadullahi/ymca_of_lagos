import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/NewAuthContext';

type Donation = { id: string; name: string; email: string; phone: string; amount: string; status: string; reference: string; created_at: string; is_test: boolean; error: string };
type Result = { donations: Donation[]; summary: { count: number; received: number; pending: number; failed: number }; page: number; pages: number; count: number };
const money = (value: number | string) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(Number(value));

export default function DonationsPage() {
  const { fetchWithAuth } = useAuth();
  const fetchRef = useRef(fetchWithAuth);
  fetchRef.current = fetchWithAuth;
  const [result, setResult] = useState<Result | null>(null);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    fetchRef.current({ path: '/admin/donations/', queryParams: { status, search: query, page } })
      .then((response: any) => { if (active) setResult(response.data); })
      .catch((e: Error) => { if (active) setError(e.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [status, query, page, refresh]);
  return <section className="space-y-6">
    <div className="flex justify-between items-start gap-4"><div><h1 className="text-3xl font-bold text-gray-900">Donations</h1><p className="text-gray-500 mt-2">Track contributions and payment confirmations.</p></div>
      <button onClick={() => setRefresh(v => v + 1)} disabled={loading} className="border bg-white rounded-lg px-4 py-2">Refresh</button></div>
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">{[
      ['Received', money(result?.summary.received || 0)], ['Donation attempts', result?.summary.count || 0],
      ['Pending', result?.summary.pending || 0], ['Failed', result?.summary.failed || 0],
    ].map(([label, value]) => <div key={label} className="bg-white border rounded-xl p-5"><p className="text-sm text-gray-500">{label}</p><p className="text-2xl font-bold mt-2">{value}</p></div>)}</div>
    <div className="bg-white border rounded-xl overflow-hidden">
      <div className="p-4 border-b flex flex-wrap gap-3 justify-between"><form onSubmit={e => { e.preventDefault(); setPage(1); setQuery(search); }} className="flex gap-2">
        <input aria-label="Search donations" value={search} onChange={e => setSearch(e.target.value)} placeholder="Name, email or RRR" className="border rounded-lg px-3 py-2 min-w-0" />
        <button className="bg-gray-900 text-white rounded-lg px-4 py-2">Search</button></form>
        <select aria-label="Payment status" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="border rounded-lg px-3 py-2"><option value="">All statuses</option><option value="success">Successful</option><option value="pending">Pending</option><option value="failed">Failed</option></select></div>
      {error ? <div role="alert" className="p-6 text-red-700">{error} <button className="underline ml-2" onClick={() => setRefresh(v => v + 1)}>Try again</button></div> : loading ? <p role="status" className="p-8 text-gray-500">Loading donations…</p> : !result?.donations.length ? <p className="p-10 text-center text-gray-500">No donations match these filters.</p> : <div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="bg-gray-50 text-gray-500"><tr>{['Donor', 'Amount', 'Status', 'Reference', 'Date'].map(t => <th key={t} className="px-5 py-3 font-medium">{t}</th>)}</tr></thead>
        <tbody>{result.donations.map(donation => <tr key={donation.id} className="border-t"><td className="px-5 py-4"><p className="font-semibold">{donation.name} {donation.is_test && <span className="text-amber-700 text-xs">TEST</span>}</p><p className="text-gray-500 mt-1">{donation.email || 'Email not provided'}</p>{donation.phone && <p className="text-gray-500">{donation.phone}</p>}</td>
          <td className="px-5 py-4 font-semibold whitespace-nowrap">{money(donation.amount)}</td><td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${donation.status === 'success' ? 'bg-green-100 text-green-800' : donation.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>{donation.status === 'success' ? 'Successful' : donation.status === 'failed' ? 'Failed' : 'Pending'}</span>{donation.error && <p className="max-w-xs text-xs text-gray-500 mt-2">{donation.error}</p>}</td>
          <td className="px-5 py-4 font-mono text-xs break-all">{donation.reference}</td><td className="px-5 py-4 whitespace-nowrap">{new Date(donation.created_at).toLocaleDateString('en-GB')}</td></tr>)}</tbody></table></div>}
      <div className="p-4 border-t flex justify-between items-center text-sm text-gray-500"><span>{result?.count || 0} records · Page {result?.page || 1} of {result?.pages || 1}</span><div className="flex gap-3"><button disabled={loading || page <= 1} onClick={() => setPage(p => p - 1)} className="disabled:opacity-40">Previous</button><button disabled={loading || page >= (result?.pages || 1)} onClick={() => setPage(p => p + 1)} className="disabled:opacity-40">Next</button></div></div>
    </div>
  </section>;
}
