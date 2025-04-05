import React, { useState } from 'react';
import { IoCloudUploadOutline, IoTrashOutline, IoSearchOutline } from 'react-icons/io5';

const WebsiteMedia: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const heroImages = [
    { url: 'https://i.postimg.cc/3NpVh2St/IMG-20250318-WA0030-2.jpg', title: "Hero Image 1" },
    { url: 'https://i.postimg.cc/SQTJYCKn/IMG-20250324-WA0032-2.jpg', title: "Hero Image 2" },
    { url: 'https://i.postimg.cc/sx6sKkyt/clean-water-donation.jpg', title: "Hero Image 3" },
    { url: 'https://i.postimg.cc/7YRqzrKz/build-africa-history.jpg', title: "Hero Image 4" },
    { url: 'https://i.postimg.cc/7ZTwMtRW/build-africa-charity-fighting-po.jpg', title: "Hero Image 5" },
  ];

  const teamImages = [
    { url: 'https://i.postimg.cc/RVHcm8Qv/tz-flag.jpg', title: "Government" },
    { url: 'https://i.postimg.cc/8cFLjX2B/donors.jpg', title: "Donors" },
    { url: 'https://i.postimg.cc/0jLDmdxg/NGO-S.jpg', title: "NGOs" },
    { url: 'https://i.postimg.cc/d1N8QcxV/individual.jpg', title: "Individual" },
  ];

  const allMedia = [...heroImages, ...teamImages].map((item, index) => ({
    id: index + 1,
    name: item.title,
    type: 'image',
    url: item.url,
    size: '2.4 MB',
    date: '2024-03-15'
  }));

  const filteredMedia = allMedia.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700">
          <IoCloudUploadOutline className="w-5 h-5" />
          <span>Upload New</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="relative">
          <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search media files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredMedia.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="aspect-w-16 aspect-h-9 bg-gray-100">
              <img 
                src={item.url} 
                alt={item.name}
                className="w-full h-48 object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
              <p className="text-sm text-gray-500">{item.size} • {item.date}</p>
              <div className="mt-3 flex justify-end">
                <button className="text-red-600 hover:bg-red-50 p-2 rounded-lg">
                  <IoTrashOutline className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WebsiteMedia; 