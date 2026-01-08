import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/NewAuthContext';
// Import icons from react-icons
import { FaIdCard, FaCalendarAlt, FaCreditCard, FaCheck} from 'react-icons/fa';
import { BiErrorCircle } from 'react-icons/bi';


const MemberDashboardMember: React.FC = () => {
  const { user,fetchWithAuth ,FRONTEND_URL, displayNotification} = useAuth();
  const [greeting, setGreeting] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
  const hour = new Date().getHours();
  let greetingMessage = '';
  
  if (hour < 12) greetingMessage = 'Good Morning';
  else if (hour < 17) greetingMessage = 'Good Afternoon';
  else greetingMessage = 'Good Evening';

  setGreeting(greetingMessage);

  if (user?.role === 'Admin') {
    navigate('/admin/dashboard');
  }

}, [user]); // 👈 Add user here



  async function handleRenewSubscription(renew:boolean){

    try {
        const response = await fetchWithAuth({
          method: 'POST',
          path: `/membership/demo`,
          body: {}
        });
        console.log(response)
        // refresh window
        window.location.reload();
      } catch (error) {
        console.error('Error fetching churches:', error);
        displayNotification('error','Failed to load churches', );
      }


    // navigate('/payment');
    const payload  = {
      redirect_url : FRONTEND_URL + '/payment',
    }
    if (renew) {
      try {
        const response = await fetchWithAuth({
          method: 'POST',
          path: `/membership/renewal`,
          body: payload
        });
        window.location = response?.data?.payment_url
      } catch (error) {
        console.error('Error fetching churches:', error);
        displayNotification('error','Failed to load churches', );
      }
    } else {
        try {
          const response = await fetchWithAuth({
            method: 'POST',
            path: `/membership/activation`,
            body: payload
          });
          window.location = response?.data?.payment_url
        } catch (error) {
          console.error('Error fetching churches:', error);
          displayNotification('error','Failed to load churches', );
        }
      }
  };

  const handleViewDigitalId = () => {
    navigate('/myid');
    console.log('Viewing Card')
  };


  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header with Greeting */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {greeting}, {user?.first_name || 'Member'}!
        </h1>
        <p className="text-gray-600">Welcome to your digital ID dashboard</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Digital ID Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-blue-50 px-6 py-4 border-b">
            <div className="flex items-center">
              <FaIdCard className="mr-2 text-blue-600" size={20} />
              <h2 className="text-lg font-semibold">Digital ID Card</h2>
            </div>
          </div>
          
          <div className="p-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold">{user?.first_name} {user?.last_name}</h3>
                  <p className="opacity-80">{user?.unit}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user?.card?.first_time ? "bg-yellow-100 text-red-800" : !user?.card?.expired 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"
                }`}>
                  
                  {user?.card?.first_time ? "INACTIVE" :  !user?.card?.expired ? "ACTIVE" : "EXPIRED"}
                  {/* {!user?.card?.expired ? "ACTIVE" : "EXPIRED"} */}
                </span>
              </div>
              
              <div className="mt-4 space-y-1 text-sm">
                <p>Member ID: {user?.card?.id_number || 'N/A'}</p>
                <p>Email: {user?.email}</p>
                {user?.card?.first_time}
                {user?.card?.expired}
                {user?.church && <p>Church: {user?.church?.name}</p>}
                {user?.youth_council_group && <p>Group: {user?.youth_council_group?.name}</p>}
              </div>
              
              <div className="mt-4 text-xs flex items-center">
                <FaCalendarAlt size={12} className="mr-1" />
                {user?.card?.first_time ? "Not a member yet" : !user?.card?.expired 
                  ? `Valid until: ${user?.card?.expired_at}`
                  : 'Membership expired'}
              </div>
            </div>
          </div>
          
          {!user?.card?.expired && (
            <div className="bg-gray-50 px-6 py-4 flex justify-between">
              <button 
                onClick={handleViewDigitalId}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View ID
              </button>
              <button 
                onClick={() => navigate('/account')}
                className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Update Info
              </button>
            </div>
          )}
          
        </div>
        
        {/* Subscription Status */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className={`px-6 py-4 border-b ${user?.card?.first_time ? "bg-yellow-50" : !user?.card?.expired ? "bg-green-50" : "bg-red-50"}`}>
            <div className="flex items-center">
              {user?.card?.first_time ? <BiErrorCircle className="mr-2 text-yellow-500" size={20} /> :!user?.card?.expired 
                ? <FaCheck className="mr-2 text-green-500" size={20} />
                : <BiErrorCircle className="mr-2 text-red-500" size={20} />
              }
              <h2 className="text-lg font-semibold">Membership Status</h2>
            </div>
          </div>
          
          <div className="p-6">
            {user?.card?.first_time ? (
              <div>
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mr-4">
                  <BiErrorCircle size={32} className="text-yellow-500" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Active Membership</h3>
                  <p className="text-sm text-gray-600">Your digital ID is not activated yet</p>
                </div>
              </div>

              
              <div className="mt-4">
                  <button 
                    onClick={()=> handleRenewSubscription(false)}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FaCreditCard size={16} className="mr-2" />
                    Start Membership
                  </button>
                </div>
            </div>
            ): (
              !user?.card?.expired ? (
                <div>
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mr-4">
                      <FaCheck size={32} className="text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Active Membership</h3>
                      <p className="text-sm text-gray-600">Your digital ID is valid and active</p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span>Days Remaining:</span>
                      <span className="font-bold">{user?.card?.days_remaining} days</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${Math.min(100, (user?.card?.days_remaining / 180) * 100)}%` }}
                      ></div>
                    </div>
                    
                    <p className="text-xs text-gray-600 mt-2">
                      Expires on: {user?.card?.expired_at}
                    </p>
                  </div>
                  
                  {user?.card?.days_remaining < 30 && (
                    <div className="mt-4">
                      <p className="text-amber-600 mb-2">
                        {user?.card?.days_remaining < 7 
                          ? "Your membership expires very soon!" 
                          : "Your membership will expire soon."}
                      </p>
                      <button 
                        onClick={()=> handleRenewSubscription(true)}
                        className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <FaCreditCard size={16} className="mr-2" />
                        Renew Now
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mr-4">
                      <BiErrorCircle size={32} className="text-red-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Expired Membership</h3>
                      <p className="text-sm text-gray-600">Your digital ID is currently inactive</p>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 p-4 rounded-lg mb-4">
                    <p>Your membership has expired or is inactive. Please renew your subscription to continue accessing all member benefits.</p>
                  </div>
                  
                  <button 
                    onClick={()=> handleRenewSubscription(true)}
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FaCreditCard size={16} className="mr-2" />
                    Make Payment Now
                  </button>
                </div>
              )
            )}
            
          </div>
        </div>
      </div>
      
      {/* Quick Actions Section */}
      {/* <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => navigate('/events')}
            className="h-24 border border-gray-200 rounded-lg hover:bg-gray-50 flex flex-col items-center justify-center transition-colors"
          >
            <span className="text-2xl mb-1">📅</span>
            <span className="text-sm font-medium">Events</span>
          </button>
          
          <button 
            onClick={() => navigate('/help')}
            className="h-24 border border-gray-200 rounded-lg hover:bg-gray-50 flex flex-col items-center justify-center transition-colors"
          >
            <span className="text-2xl mb-1">❓</span>
            <span className="text-sm font-medium">Help</span>
          </button>
        </div>
      </div> */}
    </div>
  );
};

export default MemberDashboardMember;