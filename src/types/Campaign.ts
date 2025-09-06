export interface Contributor {
  address: string;
  amount: number;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  creator: string;
  creatorName: string;
  goalAmount: number;
  currentAmount: number;
  deadline: string;
  imageUrl: string;
  category: string;
  contributors: Contributor[];
  createdAt: string;
}

export interface MockCampaign {
  title: string;
  description: string;
  longDescription: string;
  creator: string;
  creatorName: string;
  goalAmount: number;
  deadline: string;
  imageUrl: string;
  category: string;
}