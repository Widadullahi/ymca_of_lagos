// components/Layout.tsx
import React, { JSX, useState } from 'react';
import Header from './Header';
import Navigation from './navigation/Navigation';


interface LayoutProps {
  children: JSX.Element;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {

const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="">
      {/* Sidebar */}
      <div className="flex h-screen overflow-hidden">
        <Navigation />
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
            <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <main>
                <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
                    {children}
                </div>
            </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
