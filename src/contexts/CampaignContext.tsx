import React, { createContext, useState, useContext, useEffect } from 'react';
import { Campaign, MockCampaign } from '../types/Campaign';
import {createWalletClient,createPublicClient,http,custom, parseEther, formatEther, defineChain} from 'viem'
import { sepolia, sonicTestnet } from 'viem/chains';
import { FundedABI, FundedAddress } from './Fundedconfig';
import {useWallet} from './WalletContext';

export const sonicTest = defineChain({
  id: 14601,
  name: 'Sonic Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'S Token',
    symbol: 'S',
  },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.soniclabs.com'] },
  },
  blockExplorerUrls: {
    default: {
      name: 'SonicScan',
      url: 'https://testnet.sonicscan.org'
    },
  },
})


const FundedPublicClient = createPublicClient({
  chain: sonicTest,
  transport:http()
})

const FundedWalletClient = createWalletClient({
  chain:sonicTest,
  transport: custom(window.ethereum)
})



interface CampaignContextType {
  campaigns: Campaign[];
  publicCampaigns: Campaign[]; // Only campaigns with status != 0
  loading: boolean;
  error: string | null;
  addCampaign: (campaign: MockCampaign) => void;
  getCampaign: (id: string) => Campaign | undefined;
  contributeToCampaign: (id: string, amount: number, address: string) => void;
  withdrawCampaignFunds: (id: string, address: string) => void;
  userCampaigns: (address: string) => Campaign[];
  refreshCampaigns: () => Promise<void>;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

// Helper function to convert contract data to Campaign interface
const convertContractDataToCampaign = (campaignData: any, contributorsData: any, campaignId: string): Campaign => {
  const [campaignStruct] = campaignData;
  const [contributorsArray] = contributorsData;
  
  console.log(`Converting campaign ${campaignId}:`, {
    campaignStruct,
    ownersAddress: campaignStruct.ownersAddress,
    title: campaignStruct.title
  });
  
  // Convert contributors from contract format to frontend format
  const contributors = contributorsArray.map((contrib: any) => ({
    address: contrib.contribAddress,
    amount: parseFloat(formatEther(contrib.amount))
  }));

  const campaign: Campaign = {
    id: campaignId,
    title: campaignStruct.title,
    description: campaignStruct.descr,
    longDescription: campaignStruct.longDescr,
    creator: campaignStruct.ownersAddress, // This is the key field for filtering
    creatorName: campaignStruct.creatorName,
    goalAmount: parseFloat(formatEther(campaignStruct.goalAmount)),
    currentAmount: parseFloat(formatEther(campaignStruct.contributions)),
    deadline: campaignStruct.deadline,
    imageUrl: campaignStruct.image,
    category: campaignStruct.catogory, 
    contributors,
    createdAt: new Date().toISOString(),
    status: campaignStruct.campaignStatus // Extract campaign status from contract
  };
  
  console.log(`Converted campaign ${campaignId}:`, {
    id: campaign.id,
    title: campaign.title,
    creator: campaign.creator,
    creatorName: campaign.creatorName
  });
  
  return campaign;
};

export const CampaignProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalContributions, setTotalContributions] = useState<string>('');

  const {account: activeAccount} = useWallet();

  // Filter campaigns for public display (exclude closed campaigns with status = 0)
  const publicCampaigns = campaigns.filter(campaign => campaign.status !== 0);

  // Function to fetch all campaigns from the contract
  const fetchCampaignsFromContract = async (): Promise<Campaign[]> => {
    try {
      setLoading(true);
      setError(null);
      
      // Get preliminaries data (idCounter, totalContribs, proprietor, activeCampaignIDs, closedCampaignIDs)
      const preliminaries = await FundedPublicClient.readContract({
        address: FundedAddress,
        abi: FundedABI,
        functionName: "Preliminaries"
      });
      
      console.log("Preliminaries data:", preliminaries);
      
      const [idCounter, totalContribs, proprietor, activeCampaignIDs, closedCampaignIDs] = preliminaries;
      
      // Update total contributions
      setTotalContributions(formatEther(totalContribs));
      
      // Fetch all campaigns (both active and closed)
      const allCampaignIds = [...activeCampaignIDs, ...closedCampaignIDs];
      const fetchedCampaigns: Campaign[] = [];
      
      for (const campaignId of allCampaignIds) {
        try {
          // Get campaign data and contributors
          const campaignData = await FundedPublicClient.readContract({
            address: FundedAddress,
            abi: FundedABI,
            functionName: "getCampaign",
            args: [campaignId]
          });
          
          console.log(`Campaign ${campaignId.toString()} data:`, campaignData);
          
          // Convert contract data to Campaign interface
          const campaign = convertContractDataToCampaign(campaignData, [campaignData[1]], campaignId.toString());
          fetchedCampaigns.push(campaign);
        } catch (campaignError) {
          console.error(`Error fetching campaign ${campaignId.toString()}:`, campaignError);
        }
      }
      
      console.log("Fetched campaigns:", fetchedCampaigns);
      return fetchedCampaigns;
      
    } catch (err) {
      console.error("Error fetching campaigns from contract:", err);
      setError(`Failed to fetch campaigns: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Refresh campaigns function
  const refreshCampaigns = async () => {
    const fetchedCampaigns = await fetchCampaignsFromContract();
    setCampaigns(fetchedCampaigns);
  };

  // Load campaigns on component mount
  useEffect(() => {
    refreshCampaigns();
  }, []);

  const addCampaign = async (campaign: MockCampaign) => {
    try {
      setError(null);
      
      if (!activeAccount) {
        throw new Error('Please connect your wallet first');
      }
      
      // Register campaign on the smart contract
      const hash = await FundedWalletClient.writeContract({
        address: FundedAddress,
        abi: FundedABI,
        functionName: "registerCampaign",
        args: [
          campaign.title,
          campaign.description,
          campaign.longDescription,
          campaign.creatorName,
          parseEther(campaign.goalAmount.toString()),
          campaign.deadline,
          campaign.imageUrl,
          campaign.category
        ],
        account: activeAccount as `0x${string}`,
        value: parseEther("10") 
      });
      
      console.log("Campaign registration transaction hash:", hash);
      
      // Refresh campaigns after successful registration (this will handle loading states)
      await refreshCampaigns();
      
    } catch (err) {
      console.error("Error creating campaign:", err);
      setError(`Failed to create campaign: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    }
  };

  const getCampaign = (id: string) => {
    return campaigns.find(campaign => campaign.id === id);
  };

  const contributeToCampaign = async (id: string, amount: number, address: string) => {
    try {
      setError(null);
      
      // Convert amount to wei and make the contribution
      const hash = await FundedWalletClient.writeContract({
        address: FundedAddress,
        abi: FundedABI,
        functionName: "contribute",
        args: [BigInt(id)], // Convert id to BigInt for contract
        account: address as `0x${string}`,
        value: parseEther(amount.toString())
      });
      
      console.log("Contribution transaction hash:", hash);
      
      // Refresh campaigns after successful contribution (this will handle loading states)
      await refreshCampaigns();
      
    } catch (err) {
      console.error("Error contributing to campaign:", err);
      setError(`Failed to contribute: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    }
  };

  const withdrawCampaignFunds = async (id: string, address: string) => {
    try {
      setError(null);
      
      // Call withdrawCampaignFunds with campaign ID and success status (true)
      const hash = await FundedWalletClient.writeContract({
        address: FundedAddress,
        abi: FundedABI,
        functionName: "withdrawCampaignFunds",
        args: [BigInt(id), true], // Campaign ID and success status
        account: address as `0x${string}`
      });
      
      console.log("Withdrawal transaction hash:", hash);
      
      // Refresh campaigns after successful withdrawal (this will handle loading states)
      await refreshCampaigns();
      
    } catch (err) {
      console.error("Error withdrawing campaign funds:", err);
      setError(`Failed to withdraw funds: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    }
  };

  const userCampaigns = (address: string) => {
    // Normalize addresses to lowercase for comparison
    const normalizedUserAddress = address.toLowerCase();
    
    console.log('Filtering campaigns for address:', normalizedUserAddress);
    console.log('All campaigns with creators:', campaigns.map(c => ({ id: c.id, creator: c.creator.toLowerCase(), title: c.title })));
    
    const userCampaignsList = campaigns.filter(campaign => {
      const normalizedCreatorAddress = campaign.creator.toLowerCase();
      const isMatch = normalizedCreatorAddress === normalizedUserAddress;
      
      console.log(`Campaign ${campaign.id} "${campaign.title}":`); 
      console.log(`  Creator: ${normalizedCreatorAddress}`);
      console.log(`  User: ${normalizedUserAddress}`);
      console.log(`  Match: ${isMatch}`);
      
      return isMatch;
    });
    
    console.log(`Found ${userCampaignsList.length} campaigns for user ${normalizedUserAddress}`);
    return userCampaignsList;
  };

  return (
    <CampaignContext.Provider value={{ 
      campaigns,
      publicCampaigns,
      loading,
      error,
      addCampaign, 
      getCampaign,
      contributeToCampaign,
      withdrawCampaignFunds,
      userCampaigns,
      refreshCampaigns
    }}>
      {children}
    </CampaignContext.Provider>
  );
};

export const useCampaigns = () => {
  const context = useContext(CampaignContext);
  if (context === undefined) {
    throw new Error('useCampaigns must be used within a CampaignProvider');
  }
  return context;
};