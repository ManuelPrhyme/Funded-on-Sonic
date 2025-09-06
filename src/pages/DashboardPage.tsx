import React from 'react';
import { Link } from 'react-router-dom';
import { useCampaigns } from '../contexts/CampaignContext';
import { useWallet } from '../contexts/WalletContext';
import CampaignGrid from '../components/CampaignGrid';
import { PlusCircle, Wallet, Zap, TrendingUp, Clock, AlertCircle, Users, Target, RefreshCw } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { campaigns, userCampaigns, loading, error, refreshCampaigns } = useCampaigns();
  const { account: connectedAccount, connectWallet } = useWallet();
  
  // If no wallet connected, show connect wallet interface
  if (!connectedAccount) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
              <Wallet className="h-full w-full" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              To access your creator dashboard and manage your campaigns, please connect your wallet first.
            </p>
            <button
              onClick={connectWallet}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white"
              style={{backgroundColor: '#0061FF'}}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0052E6'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0061FF'}
            >
              <Wallet className="h-5 w-5 mr-2" />
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  const userCampaignsList = userCampaigns(connectedAccount);
  
  // Debug: Log the campaigns and filtering
  console.log('All campaigns:', campaigns);
  console.log('Connected account:', connectedAccount);
  console.log('User campaigns:', userCampaignsList);
  
  // Calculate total funds raised from user campaigns
  const totalRaised = userCampaignsList.reduce((sum, campaign) => sum + campaign.currentAmount, 0);
  
  // Count active campaigns (deadline in the future)
  const activeCampaigns = userCampaignsList.filter(
    campaign => new Date(campaign.deadline) > new Date()
  ).length;
  
  // Count successful campaigns (reached goal)
  const successfulCampaigns = userCampaignsList.filter(
    campaign => campaign.currentAmount >= campaign.goalAmount
  ).length;
  
  // Calculate total contributors across all user campaigns
  const totalContributors = new Set(
    userCampaignsList.flatMap(campaign => 
      campaign.contributors.map(contributor => contributor.address)
    )
  ).size;
  
  // Calculate average funding percentage
  const avgFundingPercentage = userCampaignsList.length > 0 
    ? userCampaignsList.reduce((sum, campaign) => 
        sum + Math.min((campaign.currentAmount / campaign.goalAmount) * 100, 100), 0
      ) / userCampaignsList.length
    : 0;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Creator Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Manage your campaigns and track your funding progress
            </p>
          </div>
          <button
            onClick={() => refreshCampaigns()}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 p-4 rounded-md mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center mb-6">
            <div className="h-12 w-12 rounded-full flex items-center justify-center mr-4" style={{backgroundColor: 'rgba(0, 97, 255, 0.1)'}}>
              <Wallet className="h-6 w-6" style={{color: '#0061FF'}} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Connected Wallet</p>
              <p className="font-medium truncate" title={connectedAccount}>
                {connectedAccount.substring(0, 5)}...{connectedAccount.substring(connectedAccount.length - 4)}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-lg p-4" style={{backgroundColor: 'rgba(0, 97, 255, 0.05)'}}>
              <div className="flex items-center">
                <div className="mr-4 p-2 rounded-md" style={{backgroundColor: 'rgba(0, 97, 255, 0.1)'}}>
                  <TrendingUp className="h-6 w-6" style={{color: '#0061FF'}} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Raised</p>
                  <p className="text-lg font-bold">{totalRaised.toFixed(3)} S</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="mr-4 p-2 bg-green-100 rounded-md">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Active Campaigns</p>
                  <p className="text-lg font-bold">{activeCampaigns}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="mr-4 p-2 bg-purple-100 rounded-md">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Successful Campaigns</p>
                  <p className="text-lg font-bold">{successfulCampaigns}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="mr-4 p-2 bg-orange-100 rounded-md">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Contributors</p>
                  <p className="text-lg font-bold">{totalContributors}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Your Campaigns</h2>
            <p className="text-sm text-gray-500 mt-1">
              {loading ? 'Loading...' : `${userCampaignsList.length} campaigns found`}
            </p>
          </div>
          <Link 
            to="/create" 
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white"
            style={{backgroundColor: '#0061FF'}}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0052E6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0061FF'}
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Create New Campaign
          </Link>
        </div>
        
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{borderBottomColor: '#0061FF'}}></div>
              <span className="ml-3 text-gray-600">Loading your campaigns...</span>
            </div>
          </div>
        ) : userCampaignsList.length > 0 ? (
          <CampaignGrid campaigns={userCampaignsList} title="" />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mx-auto h-24 w-24 text-gray-400">
              <Wallet className="h-full w-full" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No campaigns yet</h3>
            <p className="mt-2 text-gray-500">
              You haven't created any campaigns with this wallet address yet. Start your first campaign to begin raising funds.
            </p>
            {campaigns.length > 0 && (
              <p className="mt-2 text-sm text-gray-400">
                Found {campaigns.length} total campaigns on the platform, but none created by your address ({connectedAccount.substring(0, 8)}...{connectedAccount.substring(connectedAccount.length - 6)})
              </p>
            )}
            <div className="mt-6">
              <Link 
                to="/create" 
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white"
                style={{backgroundColor: '#0061FF'}}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0052E6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0061FF'}
              >
                Create Your First Campaign
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;