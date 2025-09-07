import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCampaigns } from '../contexts/CampaignContext';
import ContributionForm from '../components/ContributionForm';
import { formatDistanceToNow, format } from 'date-fns';
import { Clock, Users, AlertCircle, Check, CircleDollarSign } from 'lucide-react';

const CampaignPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getCampaign } = useCampaigns();
  const [campaign, setCampaign] = useState(id ? getCampaign(id) : undefined);
  
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Refresh campaign data when contribution is successful
  useEffect(() => {
    if (id) {
      setCampaign(getCampaign(id));
    }
  }, [id, getCampaign, refreshKey]);
  
  if (!campaign) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-yellow-50 p-4 rounded-md mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Campaign not found</h3>
              <p className="mt-2 text-sm text-yellow-700">
                The campaign you're looking for doesn't exist or has been removed.
              </p>
              <div className="mt-4">
                <Link to="/" className="text-sm font-medium text-yellow-800 hover:text-yellow-700">
                  Go back to homepage
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const progressPercentage = Math.min(Math.round((campaign.currentAmount / campaign.goalAmount) * 100), 100);
  const daysLeft = Math.max(
    Math.ceil((new Date(campaign.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    0
  );
  
  const isSuccessful = campaign.currentAmount >= campaign.goalAmount;
  const hasEnded = daysLeft === 0;
  
  const handleContributionSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6">
        <Link to="/" className="hover:text-gray-800" style={{color: '#111926'}} onMouseEnter={(e) => e.currentTarget.style.color = '#0f1419'} onMouseLeave={(e) => e.currentTarget.style.color = '#111926'}>
          &larr; Back to campaigns
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          <div className="md:w-2/3">
            <img 
              src={campaign.imageUrl} 
              alt={campaign.title} 
              className="h-64 w-full object-cover md:h-96"
            />
          </div>
          
          <div className="md:w-1/3 p-6">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium" style={{backgroundColor: 'rgba(17, 25, 38, 0.1)', color: '#111926'}}>
                {campaign.category}
              </span>
              
              {hasEnded ? (
                isSuccessful ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <Check className="mr-1 h-4 w-4" />
                    Successful
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    <AlertCircle className="mr-1 h-4 w-4" />
                    Ended
                  </span>
                )
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  <Clock className="mr-1 h-4 w-4" />
                  Active
                </span>
              )}
            </div>
            
            <div className="mt-8">
              <p className="text-2xl font-bold text-gray-900">
                {campaign.currentAmount.toFixed(3)} S
              </p>
              <p className="text-sm text-gray-500">
                raised of {campaign.goalAmount.toFixed(3)} S goal
              </p>
              
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="h-2.5 rounded-full" 
                  style={{ width: `${progressPercentage}%`, backgroundColor: '#111926' }}
                ></div>
              </div>
              
              <div className="flex items-center justify-between mt-4 text-gray-500 text-sm">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{campaign.contributors.length} contributors</span>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>
                    {daysLeft > 0 
                      ? `${daysLeft} days left` 
                      : 'Campaign ended'
                    }
                  </span>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-gray-500">
                Campaign ends on {format(new Date(campaign.deadline), 'PPP')}
              </div>
            </div>
            
            <div className="mt-8">
              {(!hasEnded || isSuccessful) && (
                <ContributionForm 
                  campaignId={campaign.id}
                  campaign={campaign}
                  onSuccess={handleContributionSuccess}
                />
              )}
              
              {hasEnded && !isSuccessful && (
                <div className="p-4 rounded-md bg-gray-50">
                  <p className="font-medium text-gray-800">
                    This campaign has ended without reaching its goal.
                  </p>
                  <p className="mt-1 text-sm">
                    Contributors have been refunded.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{campaign.title}</h1>
            <p className="text-gray-600">By {campaign.creatorName}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold mb-4">About This Campaign</h2>
              <div className="prose max-w-none">
                {campaign.longDescription.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="mb-4 text-gray-700">{paragraph}</p>
                ))}
              </div>
              
              {isSuccessful && (
                <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <CircleDollarSign className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">Successful Campaign</h3>
                      <div className="mt-2 text-sm text-green-700">
                        <p>
                          This campaign has reached its funding goal! The funds have been automatically disbursed to the campaign creator.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Campaign Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="font-medium">
                      {formatDistanceToNow(new Date(campaign.createdAt))} ago
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Creator</p>
                    <p className="font-medium truncate" title={campaign.creator}>
                      {campaign.creator.substr(0, 8)}...{campaign.creator.substr(-6)}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Platform Fee</p>
                    <p className="font-medium">5% of funds raised</p>
                  </div>
                  
                  {campaign.contributors.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Top Contributors</p>
                      <ul className="space-y-2">
                        {campaign.contributors
                          .sort((a, b) => b.amount - a.amount)
                          .slice(0, 3)
                          .map((contributor, idx) => (
                            <li key={idx} className="flex justify-between">
                              <span className="text-sm truncate" title={contributor.address}>
                                {contributor.address.substr(0, 6)}...{contributor.address.substr(-4)}
                              </span>
                              <span className="font-medium">{contributor.amount.toFixed(3)} S</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignPage;