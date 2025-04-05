import React from 'react';
import { IoSaveOutline } from 'react-icons/io5';

const WebsiteSettings: React.FC = () => {
  const websiteData = {
    name: "Partnership For Poverty Reduction Organisation",
    email: "ayubmuhajiry@gmail.com",
    phone: "(+255) 764 044 001",
    address: "Office no 1. Masjid haqq, Buguruni, Dar es Salaam",
    poBox: "P.O Box 911",
    social: {
      facebook: "#",
      twitter: "#",
      instagram: "#",
      linkedin: "#"
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Website Settings</h1>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <form onSubmit={(e) => e.preventDefault()}>
          {/* General Settings */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  defaultValue={websiteData.name}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  defaultValue={websiteData.email}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  defaultValue={websiteData.phone}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  defaultValue={websiteData.address}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  P.O. Box
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  defaultValue={websiteData.poBox}
                />
              </div>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Media Links</h2>
            <div className="space-y-4">
              {Object.entries(websiteData.social).map(([platform, url]) => (
                <div key={platform}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                    {platform}
                  </label>
                  <input
                    type="url"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    defaultValue={url}
                    placeholder={`https://${platform}.com/...`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
            >
              <IoSaveOutline className="w-5 h-5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WebsiteSettings; 