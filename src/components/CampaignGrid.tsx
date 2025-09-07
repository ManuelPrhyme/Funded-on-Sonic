import React, { useState } from 'react';
import CampaignCard from './CampaignCard';
import { Campaign } from '../types/Campaign';
import { Search, Filter } from 'lucide-react';

interface CampaignGridProps {
  campaigns: Campaign[];
  title?: string;
  showFilters?: boolean;
}

const CampaignGrid: React.FC<CampaignGridProps> = ({  
  campaigns, 
  title = "Campaigns", 
  showFilters = true 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const categories = ['All', 'Technology', 'Environment', 'Education', 'Healthcare', 'Art', 'Community'];

  // Filter and sort campaigns
  let filteredCampaigns = [...campaigns];
  
  // Apply search filter
  if (searchTerm) {
    filteredCampaigns = filteredCampaigns.filter(campaign => 
      campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  // Apply category filter
  if (selectedCategory && selectedCategory !== 'All') {
    filteredCampaigns = filteredCampaigns.filter(campaign => 
      campaign.category === selectedCategory
    );
  }
  
  // Apply sorting
  switch (sortBy) {
    case 'newest':
      filteredCampaigns.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    case 'funded':
      filteredCampaigns.sort((a, b) => (b.currentAmount / b.goalAmount) - (a.currentAmount / a.goalAmount));
      break;
    case 'ending-soon':
      filteredCampaigns.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
      break;
    case 'most-funded':
      filteredCampaigns.sort((a, b) => b.currentAmount - a.currentAmount);
      break;
    default:
      break;
  }

  return (
    <div className="w-full">
      {title && <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>}
      
      {showFilters && (
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{'--tw-ring-color': '#111926'} as React.CSSProperties}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#111926';
                  e.currentTarget.style.boxShadow = `0 0 0 2px rgba(17, 25, 38, 0.2)`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(209 213 219)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 bg-white"
                  style={{'--tw-ring-color': '#111926'} as React.CSSProperties}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#111926';
                    e.currentTarget.style.boxShadow = `0 0 0 2px rgba(17, 25, 38, 0.2)`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgb(209 213 219)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 bg-white"
                style={{'--tw-ring-color': '#111926'} as React.CSSProperties}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#111926';
                  e.currentTarget.style.boxShadow = `0 0 0 2px rgba(17, 25, 38, 0.2)`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgb(209 213 219)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <option value="newest">Newest</option>
                <option value="funded">Most Funded %</option>
                <option value="most-funded">Highest Amount</option>
                <option value="ending-soon">Ending Soon</option>
              </select>
            </div>
          </div>
        </div>
      )}
      
      {filteredCampaigns.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map(campaign => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500 text-lg">No campaigns found matching your criteria.</p>
          <button 
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('');
              setSortBy('newest');
            }}
            className="mt-4 px-4 py-2 text-white font-medium rounded"
            style={{backgroundColor: '#111926'}}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0f1419'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#111926'}
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default CampaignGrid;