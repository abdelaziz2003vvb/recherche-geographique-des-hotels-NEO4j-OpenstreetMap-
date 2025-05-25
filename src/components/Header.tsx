import React from 'react';
import { MapPin } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-primary-700 text-white shadow-md">
      <div className="container mx-auto py-4 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="h-8 w-8 text-accent-400" />
            <h1 className="text-2xl font-bold tracking-tight">NearbyStays</h1>
          </div>
          <div>
            <span className="hidden md:inline text-sm text-primary-100">Find hotels near you in seconds</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;