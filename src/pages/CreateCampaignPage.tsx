import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCampaigns } from '../contexts/CampaignContext';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { MockCampaign } from '../types/Campaign';
import { ethers, parseEther,BrowserProvider } from 'ethers';
import {createWalletClient,createPublicClient,http,custom,formatEther} from 'viem'
import {sepolia, sonicTestnet} from 'viem/chains'
import { walletConnect } from 'wagmi/connectors';
import {FundedABI,FundedAddress} from "../contexts/Fundedconfig"
import { useWallet } from '../contexts/WalletContext';



const WalletClient = createWalletClient({
  chain:sonicTestnet,
  transport: custom(window.ethereum)
})

const PublicClient = createPublicClient({
  chain:sonicTestnet,
  transport: http()
})

const CATEGORIES = [
  'Technology', 
  'Environment', 
  'Education', 
  'Healthcare', 
  'Art', 
  'Community',
  'Other'
];

const CreateCampaignPage: React.FC = () => {
  const { addCampaign } = useCampaigns();
  const navigate = useNavigate();

  const {account:activeAccount} = useWallet()

  useEffect(()=>{
      console.log('Got it',activeAccount)
  },[])
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    longDescription: '',
    creatorName: '',
    category: '',
    goalAmount: '',
    deadline: '',
    imageUrl: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const formRef = useRef<HTMLFormElement>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.longDescription.trim()) newErrors.longDescription = 'Detailed description is required';
    if (!formData.creatorName.trim()) newErrors.creatorName = 'Creator name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    
    if (!formData.goalAmount) {
      newErrors.goalAmount = 'Funding goal is required';
    } else if (isNaN(Number(formData.goalAmount)) || Number(formData.goalAmount) <= 0) {
      newErrors.goalAmount = 'Funding goal must be a positive number';
    }
    
    if (!formData.deadline) {
      newErrors.deadline = 'Deadline is required';
    } else {
      const deadlineDate = new Date(formData.deadline);
      const today = new Date();
      if (deadlineDate <= today) {
        newErrors.deadline = 'Deadline must be in the future';
      }
    }
    
    if (!formData.imageUrl.trim()) {
      newErrors.imageUrl = 'Image URL is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField && formRef.current) {
        const errorElement = formRef.current.querySelector(`[name="${firstErrorField}"]`);
        errorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    setIsSubmitting(true);

    try {
      const campaign: MockCampaign = {
        title: formData.title,
        description: formData.description,  
        longDescription: formData.longDescription,
        creator: activeAccount || '', // Add the creator address
        creatorName: formData.creatorName,
        goalAmount: Number(formData.goalAmount),
        deadline: new Date(formData.deadline).toISOString(),
        imageUrl: formData.imageUrl,
        category: formData.category
      };
      
      // This will handle the contract call and all state management
      await addCampaign(campaign);
      
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Redirect after success message is shown
      navigate('/campaigns');
        
    } catch (error) {
      setIsSubmitting(false);
      setErrors(prev => ({ ...prev, submit: 'Failed to create campaign. Please try again.' }));
      console.error('Error creating campaign:', error);
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Create a Campaign</h1>
        <p className="mt-2 text-gray-600">
          Share your idea with the world and get the funding you need to make it happen.
        </p>
      </div>
      
      {isSuccess ? (
        <div className="bg-green-50 border border-green-200 rounded-md p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-medium text-green-800 mb-2">Campaign Created Successfully!</h2>
          <p className="text-green-700 mb-4">
            Your campaign has been created and is now live on the platform.
          </p>
          <p className="text-sm text-green-600">
            Redirecting you to the homepage...
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          {errors.submit && (
            <div className="mb-6 bg-red-50 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{errors.submit}</p>
                </div>
              </div>
            </div>
          )}
          
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Campaign Title*
              </label>
              <input
                type="text"
                name="title"
                id="title"
                value={formData.title}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                  errors.title 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300'
                }`}
                style={!errors.title ? {'--tw-ring-color': '#111926'} as React.CSSProperties : {}}
                onFocus={(e) => {
                  if (!errors.title) {
                    e.currentTarget.style.borderColor = '#111926';
                    e.currentTarget.style.boxShadow = `0 0 0 2px rgba(17, 25, 38, 0.2)`;
                  }
                }}
                onBlur={(e) => {
                  if (!errors.title) {
                    e.currentTarget.style.borderColor = 'rgb(209 213 219)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
                placeholder="Enter a compelling title"
              />
              {errors.title && (
                <p className="mt-2 text-sm text-red-600">{errors.title}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Short Description*
              </label>
              <input
                type="text"
                name="description"
                id="description"
                value={formData.description}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                  errors.description 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300'
                }`}
                style={!errors.description ? {'--tw-ring-color': '#111926'} as React.CSSProperties : {}}
                onFocus={(e) => {
                  if (!errors.description) {
                    e.currentTarget.style.borderColor = '#111926';
                    e.currentTarget.style.boxShadow = `0 0 0 2px rgba(17, 25, 38, 0.2)`;
                  }
                }}
                onBlur={(e) => {
                  if (!errors.description) {
                    e.currentTarget.style.borderColor = 'rgb(209 213 219)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
                placeholder="A brief summary of your campaign (100-150 characters)"
                maxLength={150}
              />
              {errors.description && (
                <p className="mt-2 text-sm text-red-600">{errors.description}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="longDescription" className="block text-sm font-medium text-gray-700">
                Detailed Description*
              </label>
              <textarea
                name="longDescription"
                id="longDescription"
                rows={6}
                value={formData.longDescription}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                  errors.longDescription 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300'
                }`}
                style={!errors.longDescription ? {'--tw-ring-color': '#111926'} as React.CSSProperties : {}}
                onFocus={(e) => {
                  if (!errors.longDescription) {
                    e.currentTarget.style.borderColor = '#111926';
                    e.currentTarget.style.boxShadow = `0 0 0 2px rgba(17, 25, 38, 0.2)`;
                  }
                }}
                onBlur={(e) => {
                  if (!errors.longDescription) {
                    e.currentTarget.style.borderColor = 'rgb(209 213 219)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
                placeholder="Explain your campaign in detail. What are you trying to achieve? How will the funds be used?"
              />
              {errors.longDescription && (
                <p className="mt-2 text-sm text-red-600">{errors.longDescription}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Use paragraphs to organize your content. Separate paragraphs with a blank line.
              </p>
            </div>
            
            <div>
              <label htmlFor="creatorName" className="block text-sm font-medium text-gray-700">
                Creator or Organization Name*
              </label>
              <input
                type="text"
                name="creatorName"
                id="creatorName"
                value={formData.creatorName}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                  errors.creatorName 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300'
                }`}
                style={!errors.creatorName ? {'--tw-ring-color': '#111926'} as React.CSSProperties : {}}
                onFocus={(e) => {
                  if (!errors.creatorName) {
                    e.currentTarget.style.borderColor = '#111926';
                    e.currentTarget.style.boxShadow = `0 0 0 2px rgba(17, 25, 38, 0.2)`;
                  }
                }}
                onBlur={(e) => {
                  if (!errors.creatorName) {
                    e.currentTarget.style.borderColor = 'rgb(209 213 219)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
                placeholder="Your name or organization name"
              />
              {errors.creatorName && (
                <p className="mt-2 text-sm text-red-600">{errors.creatorName}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category*
                </label>
                <select
                  name="category"
                  id="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                    errors.category 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300'
                  }`}
                  style={!errors.category ? {'--tw-ring-color': '#111926'} as React.CSSProperties : {}}
                  onFocus={(e) => {
                    if (!errors.category) {
                      e.currentTarget.style.borderColor = '#111926';
                      e.currentTarget.style.boxShadow = `0 0 0 2px rgba(17, 25, 38, 0.2)`;
                    }
                  }}
                  onBlur={(e) => {
                    if (!errors.category) {
                      e.currentTarget.style.borderColor = 'rgb(209 213 219)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-2 text-sm text-red-600">{errors.category}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="goalAmount" className="block text-sm font-medium text-gray-700">
                  Funding Goal (S)*
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="number"
                    name="goalAmount"
                    id="goalAmount"
                    value={formData.goalAmount}
                    onChange={handleChange}
                    className={`pl-2 block w-full rounded-md shadow-sm sm:text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                      errors.goalAmount 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300'
                    }`}
                    style={!errors.goalAmount ? {'--tw-ring-color': '#111926'} as React.CSSProperties : {}}
                    onFocus={(e) => {
                      if (!errors.goalAmount) {
                        e.currentTarget.style.borderColor = '#111926';
                        e.currentTarget.style.boxShadow = `0 0 0 2px rgba(17, 25, 38, 0.2)`;
                      }
                    }}
                    onBlur={(e) => {
                      if (!errors.goalAmount) {
                        e.currentTarget.style.borderColor = 'rgb(209 213 219)';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                    placeholder="0.5"
                    min="0.01"
                    step="0.01"
                  />
                   <div className="absolute inset-y-0 left-0 pl-7 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">S</span>
                  </div>
                </div>
                {errors.goalAmount && (
                  <p className="mt-2 text-sm text-red-600">{errors.goalAmount}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
                  Campaign Deadline*
                </label>
                <input
                  type="date"
                  name="deadline"
                  id="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                    errors.deadline 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300'
                  }`}
                  style={!errors.deadline ? {'--tw-ring-color': '#111926'} as React.CSSProperties : {}}
                  onFocus={(e) => {
                    if (!errors.deadline) {
                      e.currentTarget.style.borderColor = '#111926';
                      e.currentTarget.style.boxShadow = `0 0 0 2px rgba(17, 25, 38, 0.2)`;
                    }
                  }}
                  onBlur={(e) => {
                    if (!errors.deadline) {
                      e.currentTarget.style.borderColor = 'rgb(209 213 219)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.deadline && (
                  <p className="mt-2 text-sm text-red-600">{errors.deadline}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                  Campaign Image URL*
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className={`mt-1 block w-full pl-3 rounded-md shadow-sm sm:text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                    errors.imageUrl 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300'
                  }`}
                  style={!errors.imageUrl ? {'--tw-ring-color': '#111926'} as React.CSSProperties : {}}
                  onFocus={(e) => {
                    if (!errors.imageUrl) {
                      e.currentTarget.style.borderColor = '#111926';
                      e.currentTarget.style.boxShadow = `0 0 0 2px rgba(17, 25, 38, 0.2)`;
                    }
                  }}
                  onBlur={(e) => {
                    if (!errors.imageUrl) {
                      e.currentTarget.style.borderColor = 'rgb(209 213 219)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                  placeholder="https://example.com/image.jpg"
                />
                {errors.imageUrl && (
                  <p className="mt-2 text-sm text-red-600">{errors.imageUrl}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Use a high-quality image that represents your campaign. Recommended size: 1200x800px.
                </p>
              </div>
            </div>
            
            <div className="p-4 rounded-md" style={{backgroundColor: 'rgba(17, 25, 38, 0.05)'}}>
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5" style={{color: '#111926'}} />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium" style={{color: '#111926'}}>Important Information</h3>
                  <div className="mt-2 text-sm" style={{color: '#374151'}}>
                    <p>
                      By creating this campaign, you agree that:
                    </p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>A 5% platform fee will be applied to all funds raised</li>
                      <li>Funds will only be disbursed if the campaign reaches its funding goal by the deadline</li>
                      <li>You are responsible for fulfilling any promises made to contributors</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
                style={{
                  backgroundColor: '#111926',
                  '--tw-ring-color': '#111926'
                } as React.CSSProperties}
                onMouseEnter={(e) => {
                  if (!isSubmitting) e.currentTarget.style.backgroundColor = '#0f1419';
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) e.currentTarget.style.backgroundColor = '#111926';
                }}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Campaign...
                  </>
                ) : (
                  'Create Campaign'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CreateCampaignPage;