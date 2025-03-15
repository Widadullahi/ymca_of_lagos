// pages/DashboardPage.tsx
import React from 'react';
import IDCardGenerator from '../components/IDCardGenerator';


const DashboardPage: React.FC = () => {


  return (
    <div className="min-h-screen bg-gray-100 ">


      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <IDCardGenerator />
      </main>
    </div>
  );
};

export default DashboardPage;