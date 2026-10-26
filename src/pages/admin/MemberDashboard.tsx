import React, { useEffect, useState } from 'react';
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAuth } from '../../context/NewAuthContext';
import { Link } from 'react-router-dom';

const memberMonthStats: { month: string; members: number }[] = [];

const memberGenderStats: { name: string; value: number; color: string }[] = [];

const recentActivities: { id: number; type: string; user: string; time: string }[] = [];

const actions = [
  { title: 'Pending Requests', description: 'Review new membership applications', to: '/admin/membership-request', mark: '01' },
  { title: 'All Members', description: 'Browse and manage member records', to: '/admin/users', mark: '02' },
  { title: 'Post Update', description: 'Share news with the community', to: '/admin/updates', mark: '03' },
  { title: 'Staff List', description: 'View staff and administrators', to: '/admin/staff', mark: '04' },
];

const MemberDashboard: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const memberMainStats = { total: null, active: null, inactive: null, new: null };

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 500);
    return () => window.clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center" role="status" aria-label="Loading dashboard">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-red-100 border-t-red-600" />
      </div>
    );
  }

  const stats = [
    { label: 'Total Members', value: memberMainStats.total, note: 'Live totals are not available yet', mark: 'TM' },
    { label: 'Active', value: memberMainStats.active, note: 'Live totals are not available yet', mark: 'AC' },
    { label: 'Expired', value: memberMainStats.inactive, note: 'Live totals are not available yet', mark: 'EX' },
    { label: 'New This Month', value: memberMainStats.new, note: 'Live totals are not available yet', mark: 'NM' },
  ];

  return (
    <div className="space-y-7 pb-6 text-gray-900">
      <header className="flex flex-col gap-5 rounded-2xl border border-red-100 bg-gradient-to-r from-white via-white to-red-50/80 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-red-700">
            <span className="h-2 w-2 rounded-full bg-red-600" /> YMCA of Lagos · Administration
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">Welcome back, {user?.first_name || 'Admin'}. Here’s your membership overview.</p>
        </div>
        <div className="inline-flex w-fit items-center gap-3 rounded-xl border border-gray-200 bg-white/80 px-4 py-3 text-sm text-gray-600 shadow-sm">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-lg text-red-700" aria-hidden="true">▦</span>
          <span>
            <span className="block text-xs font-medium uppercase tracking-wide text-gray-400">Today</span>
            <span className="mt-0.5 block font-semibold text-gray-800">{new Date().toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </span>
        </div>
      </header>

      <section aria-label="Membership summary" className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        {stats.map((stat, index) => (
          <article key={stat.label} className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-6">
            <div className="absolute inset-y-0 left-0 w-1 bg-red-600" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="mt-3 text-3xl font-bold tracking-tight text-gray-950">{stat.value?.toLocaleString() ?? '—'}</p>
              </div>
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xs font-bold tracking-wide ${index === 0 ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-500'}`}>{stat.mark}</span>
            </div>
            <p className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-500">{stat.note}</p>
          </article>
        ))}
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-700">Get things done</p>
            <h2 className="mt-1 text-xl font-bold text-gray-900 sm:text-2xl">Quick Actions</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
          {actions.map((action) => (
            <Link key={action.title} to={action.to} className="group flex min-h-[104px] items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition duration-200 hover:border-red-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-300 sm:p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-sm font-bold text-red-700 transition-colors group-hover:bg-red-600 group-hover:text-white">{action.mark}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-gray-900 group-hover:text-red-700">{action.title}</span>
                <span className="mt-1 block text-xs leading-5 text-gray-500">{action.description}</span>
              </span>
              <span className="text-lg text-gray-300 transition group-hover:translate-x-1 group-hover:text-red-600" aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-700">Membership</p>
              <h2 className="mt-1 text-lg font-bold text-gray-900 sm:text-xl">Membership Growth</h2>
              <p className="mt-1 text-sm text-gray-500">Member count through the year</p>
            </div>
            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">Jan – Aug</span>
          </div>
          {memberMonthStats.length > 0 ? <div className="h-64 w-full sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={memberMonthStats} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 5" stroke="#eceff2" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={false} dy={8} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} domain={['dataMin - 10', 'dataMax + 10']} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f3d9db', boxShadow: '0 8px 24px rgba(17,24,39,.08)' }} />
                <Line type="monotone" dataKey="members" name="Members" stroke="#c51f2b" strokeWidth={3} dot={{ r: 3, fill: '#c51f2b', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, fill: '#c51f2b', stroke: '#fff', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div> : <div className="flex h-64 items-center justify-center text-sm text-gray-500 sm:h-72">Membership growth data is not available yet.</div>}
        </article>

        <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-700">Latest updates</p>
            <h2 className="mt-1 text-lg font-bold text-gray-900 sm:text-xl">Recent Activity</h2>
            <p className="mt-1 text-sm text-gray-500">Recent changes across the dashboard</p>
          </div>
          {recentActivities.length > 0 ? <div className="space-y-0">
            {recentActivities.map((activity, index) => (
              <div key={activity.id} className="relative flex gap-3 pb-5 last:pb-0">
                {index < recentActivities.length - 1 && <span className="absolute left-[7px] top-4 h-[calc(100%-8px)] w-px bg-gray-100" aria-hidden="true" />}
                <span className="relative mt-1.5 h-4 w-4 shrink-0 rounded-full border-4 border-red-100 bg-red-600" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800">{activity.type}</p>
                  <p className="mt-1 text-xs text-gray-500">{activity.user}<span className="px-1.5 text-gray-300">·</span>{activity.time}</p>
                </div>
              </div>
            ))}
          </div> : <p className="rounded-xl bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">Recent activity is not available yet.</p>}
        </article>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-700">Member profile</p>
          <h2 className="mt-1 text-lg font-bold text-gray-900 sm:text-xl">Gender Distribution</h2>
          <p className="mt-1 text-sm text-gray-500">A summary of the membership records</p>
        </div>
        {memberGenderStats.length > 0 ? <div className="grid grid-cols-1 items-center gap-5 md:grid-cols-[minmax(180px,280px)_1fr] md:gap-10">
          <div className="h-56 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={memberGenderStats} cx="50%" cy="50%" innerRadius={58} outerRadius={86} paddingAngle={4} dataKey="value" stroke="none">
                  {memberGenderStats.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f3d9db' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {memberGenderStats.map((stat) => {
              const total = memberGenderStats.reduce((sum, entry) => sum + entry.value, 0);
              const percent = Math.round((stat.value / total) * 100);
              return (
                <div key={stat.name} className="rounded-xl border border-gray-100 bg-gray-50/70 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: stat.color }} />
                      <span className="font-semibold text-gray-800">{stat.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-500">{percent}%</span>
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-950">{stat.value}</span>
                    <span className="text-xs text-gray-500">members</span>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white">
                    <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: stat.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div> : <div className="rounded-xl bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">Membership profile data is not available yet.</div>}
      </section>
    </div>
  );
};

export default MemberDashboard;
