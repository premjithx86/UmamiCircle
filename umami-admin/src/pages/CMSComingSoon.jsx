import React from 'react';
import { Layout, Rocket, Settings, Database, Edit } from 'lucide-react';

const CMSComingSoon = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-8 bg-white rounded-3xl shadow-sm border border-gray-100">
      <div className="relative mb-8">
        <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 animate-pulse">
          <Layout size={48} />
        </div>
        <div className="absolute -top-2 -right-2 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-orange-500">
          <Rocket size={20} />
        </div>
      </div>
      
      <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
        Content Management System
      </h1>
      <p className="text-lg text-gray-600 max-w-md mb-10 leading-relaxed">
        We're building a powerful CMS to help you manage landing pages, blog posts, and site-wide banners with ease.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-2xl">
        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
          <Edit className="mx-auto mb-3 text-gray-400" size={24} />
          <h3 className="font-bold text-gray-900 mb-1">Visual Editor</h3>
          <p className="text-xs text-gray-500">Drag-and-drop page builder</p>
        </div>
        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
          <Database className="mx-auto mb-3 text-gray-400" size={24} />
          <h3 className="font-bold text-gray-900 mb-1">Asset Library</h3>
          <p className="text-xs text-gray-500">Centralized media management</p>
        </div>
        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
          <Settings className="mx-auto mb-3 text-gray-400" size={24} />
          <h3 className="font-bold text-gray-900 mb-1">Global Config</h3>
          <p className="text-xs text-gray-500">Site-wide style & SEO settings</p>
        </div>
      </div>

      <div className="mt-12">
        <span className="px-4 py-2 rounded-full bg-orange-600 text-white text-sm font-bold tracking-widest uppercase">
          Coming Soon
        </span>
      </div>
    </div>
  );
};

export { CMSComingSoon };
