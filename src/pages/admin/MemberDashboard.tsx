// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useAuth } from '../../context/NewAuthContext';
import { Link } from 'react-router-dom';

const MemberDashboard = () => {
  const { fetchWithAuth, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [memberMainStats, setMemberMainStats] = useState({ total: 225, active: 200, inactive: 25, new: 15 })
  const [memberMonthStats, setMemberMonthStats] = useState([
    { month: 'Jan', members: 210 },
    { month: 'Feb', members: 215 },
    { month: 'Mar', members: 220 },
    { month: 'Apr', members: 226 },
    { month: 'May', members: 230 },
    { month: 'Jun', members: 235 },
    { month: 'Jul', members: 241 },
    { month: 'Aug', members: 243 }
  ])
  const [memberGenderStats, setMemberGenderStats] = useState([
    { name: 'Male', value: 120 },
    { name: 'Female', value: 105 },
  ]);
  
  const COLORS = ['#3b82f6', '#f97316'];
  const GENDER_COLORS = {
    'Male': '#3b82f6',
    'Female': '#f97316',
  };

  const recentActivities = [
    { id: 1, type: 'New Member', user: 'Adebayo O.', time: '2 mins ago' },
    { id: 2, type: 'Request Approved', user: 'Fatima A.', time: '15 mins ago' },
    { id: 3, type: 'Update Posted', user: 'Admin', time: '1 hour ago' },
    { id: 4, type: 'Staff Added', user: 'John D.', time: '2 hours ago' },
    { id: 5, type: 'Membership Renewed', user: 'Chioma N.', time: '3 hours ago' },
  ];

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.first_name || 'Admin'}</p>
        </div>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border">
          <p className="text-sm text-gray-500">Total Members</p>
          <p className="text-2xl font-semibold mt-1">{memberMainStats.total}</p>
        </div>
        <div className="bg-white p-5 rounded-lg border">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-semibold mt-1">{memberMainStats.active}</p>
        </div>
        <div className="bg-white p-5 rounded-lg border">
          <p className="text-sm text-gray-500">Expired</p>
          <p className="text-2xl font-semibold mt-1">{memberMainStats.inactive}</p>
        </div>
        <div className="bg-white p-5 rounded-lg border">
          <p className="text-sm text-gray-500">New This Month</p>
          <p className="text-2xl font-semibold mt-1">{memberMainStats.new}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Link 
            to="/admin/membership-request" 
            className="bg-blue-600 p-4 rounded-lg text-sm font-medium text-white hover:bg-blue-700"
          >
            Pending Requests
          </Link>
          <Link 
            to="/admin/users" 
            className="bg-blue-600 p-4 rounded-lg text-sm font-medium text-white hover:bg-blue-700"
          >
            All Members
          </Link>
          <Link 
            to="/admin/updates" 
            className="bg-blue-600 p-4 rounded-lg text-sm font-medium text-white hover:bg-blue-700"
          >
            Post Update
          </Link>
          <Link 
            to="/admin/staff" 
            className="bg-blue-600 p-4 rounded-lg text-sm font-medium text-white hover:bg-blue-700"
          >
            Staff List
          </Link>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Membership Trend */}
        <div className="lg:col-span-2 bg-white p-5 rounded-lg border">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Membership Growth</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={memberMonthStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '6px', border: '1px solid #e5e7eb' }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="members" 
                  stroke="#dc2626" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-5 rounded-lg border">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="text-sm">
                <p className="text-gray-900">{activity.type}</p>
                <p className="text-gray-500 text-xs mt-0.5">{activity.user} • {activity.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gender Distribution */}
      <div className="bg-white p-5 rounded-lg border">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Gender Distribution</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={memberGenderStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                >
                  {memberGenderStats.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={GENDER_COLORS[entry.name] || COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-3">
            {memberGenderStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: GENDER_COLORS[stat.name] || COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-gray-700">{stat.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold">{stat.value}</span>
                  <span className="text-gray-500 text-sm ml-2">
                    {Math.round((stat.value / (memberGenderStats.reduce((a, b) => a + b.value, 0))) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
