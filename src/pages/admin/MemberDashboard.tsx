// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useAuth } from '../../context/NewAuthContext';

const MemberDashboard = () => {
  const { fetchWithAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [memberMainStats, setMemberMainStats] = useState({})
  const [memberMonthStats, setMemberMonthStats] = useState([
    { month: 'Jan', members: 0 },
    { month: 'Feb', members: 0 },
    { month: 'Mar', members: 0 },
    { month: 'Apr', members: 0 },
    { month: 'May', members: 0 },
    { month: 'Jun', members: 0 },
    { month: 'Jul', members: 0 },
    { month: 'Aug', members: 0 }
  ])
  const [memberGenderStats, setMemberGenderStats] = useState([
    { name: 'Male', value: 0 },
    { name: 'Female', value: 0 },
    
  ]);
  const [memberStats, setMemberStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    inactiveMembers: 0,
    onLeaveMembers: 0,
    newMembersThisMonth: 0,
    membersByCategory: [],
    membersByUnit: [],
    membersByGender: [],
    membershipTrend: []
  });


  async function fetchGenderOverview() {
    try {
      const response = await fetchWithAuth({
        method: 'GET',
        path: `/admin/members/overview?overview=gender`,
      });
      setMemberGenderStats(response?.data || [])
    } catch (error) {
      console.error('Error fetching churches:', error);
    }
  }
  async function fetchMainOverview() {
    try {
      const response = await fetchWithAuth({
        method: 'GET',
        path: `/admin/members/overview`,
      });
      setMemberMainStats(response?.data || memberMainStats)
    } catch (error) {
      console.error('Error fetching churches:', error);
    }
  }
  async function fetchMonthOverview() {
    try {
      const response = await fetchWithAuth({
        method: 'GET',
        path: `/admin/members/overview?overview=month`,
      });
      setMemberMonthStats(response?.data || memberMonthStats)
    } catch (error) {
      console.error('Error fetching churches:', error);
    }
  }

  useEffect(() => {
    // Simulate API call to fetch member statistics
    setTimeout(() => {
      const stats = {
        totalMembers: 243,
        activeMembers: 198,
        inactiveMembers: 32,
        onLeaveMembers: 13,
        newMembersThisMonth: 17,
        membersByCategory: [
          { name: 'Adult Member', value: 128 },
          { name: 'Youth Member', value: 87 },
          { name: 'Senior Member', value: 28 }
        ],
        membersByUnit: [
          { name: 'Council of Church', value: 72 },
          { name: 'Youth Council', value: 94 },
          { name: "Y's Men", value: 45 },
          { name: 'Central Club', value: 32 }
        ],
        membersByGender: [
          { name: 'Male', value: 118 },
          { name: 'Female', value: 120 },
         
        ],
        membershipTrend: [
          { month: 'Jan', members: 210 },
          { month: 'Feb', members: 215 },
          { month: 'Mar', members: 220 },
          { month: 'Apr', members: 226 },
          { month: 'May', members: 230 },
          { month: 'Jun', members: 235 },
          { month: 'Jul', members: 241 },
          { month: 'Aug', members: 243 }
        ]
      };
      
      setMemberStats(stats);
      setIsLoading(false);
    }, 1000);

    fetchMainOverview()
    fetchMonthOverview()
    fetchGenderOverview()
  }, []);


  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  const UNIT_COLORS = {
    'Council of Church': '#0088FE',
    'Youth Council': '#00C49F',
    "Y's Men": '#FFBB28',
    'Central Club': '#FF8042'
  };

  const CATEGORY_COLORS = {
    'Adult Member': '#0088FE',
    'Youth Member': '#00C49F',
    'Senior Member': '#FFBB28'
  };

  const GENDER_COLORS = {
    'Male': '#0088FE',
    'Female': '#FF8042',
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of membership statistics</p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Members" 
          value={memberMainStats?.total} 
          icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Active Members" 
          value={memberMainStats.active} 
          icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} 
          color="bg-green-500" 
        />
        <StatCard 
          title="Expired Members" 
          value={memberMainStats.inactive} 
          icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} 
          color="bg-red-500" 
        />
        <StatCard 
          title="New This Month" 
          value={memberMainStats.new} 
          icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>} 
          color="bg-purple-500" 
        />
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Member Distribution by Category */}
        {/* <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Member Distribution by Category</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={memberStats.membersByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {memberStats.membersByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} members`, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div> */}

        {/* Member Distribution by Unit */}
        {/* <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Member Distribution by Unit</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={memberStats.membersByUnit}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Members" fill="#8884d8">
                  {memberStats.membersByUnit.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={UNIT_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div> */}
      </div>

      {/* Second Row of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Membership Trend */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Membership Growth Trend</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={memberMonthStats}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="members" name="Total Members" stroke="#0088FE" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gender Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Gender Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={memberGenderStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {memberGenderStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={GENDER_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} members`, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
