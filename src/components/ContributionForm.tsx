import React, { useState } from 'react';
import { useCampaigns } from '../contexts/CampaignContext';
import { useWallet } from '../contexts/WalletContext';

interface ContributionFormProps {
  campaignId: string;
  onSuccess?: () => void;
}

const ContributionForm: React.FC<ContributionFormProps> = ({ campaignId, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const { account: activeAccount, connectWallet, isConnecting, chainId, switchToSepolia } = useWallet();
  const { contributeToCampaign } = useCampaigns();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Check if wallet is connected
    if (!activeAccount) {
      setError('Please connect your wallet first');
      return;
    }
    
    // Check if on correct network (Sepolia)
    if (chainId !== 11155111) { // Sepolia chain ID
      setError('Please switch to Sepolia testnet');
      return;
    }
    
    // Validate amount
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    // Check minimum contribution (e.g., 0.001 S)
    if (amountValue < 0.001) {
      setError('Minimum contribution is 0.001 S');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      await contributeToCampaign(campaignId, amountValue, activeAccount);
      setIsSuccess(true);
      setAmount('');
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setIsSuccess(false);
        if (onSuccess) onSuccess();
      }, 5000);
    } catch (err) {
      console.error('Contribution error:', err);
      setError('Transaction failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // If no wallet connected, show connect wallet interface
  if (!activeAccount) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-md">
        <h3 className="text-xl font-semibold mb-4">Support This Campaign</h3>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Connect your wallet to contribute to this campaign</p>
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        </div>
      </div>
    );
  }
  
  // If on wrong network, show switch network interface
  if (chainId && chainId !== 11155111) { // Sepolia chain ID
    return (
      <div className="bg-white rounded-lg p-6 shadow-md">
        <h3 className="text-xl font-semibold mb-4">Switch Network</h3>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Please switch to Sepolia testnet to contribute</p>
          <button
            onClick={switchToSepolia}
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-orange-600 hover:bg-orange-700"
          >
            Switch to Sepolia
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <h3 className="text-xl font-semibold mb-4">Support This Campaign</h3>
      
      {isSuccess ? (
        <div className="bg-green-50 text-green-800 p-4 rounded-md mb-4">
          <p className="font-medium">Thank you for your contribution!</p>
          <p className="text-sm mt-1">Your transaction has been processed successfully.</p>
        </div>
      ) : (
        <>
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Connected:</span> {activeAccount.substring(0, 8)}...{activeAccount.substring(activeAccount.length - 6)}
            </p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount (S)
              </label>
              <div className="relative rounded-md shadow-sm">
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  step="0.001"
                  min="0.001"
                  disabled={isProcessing}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                  placeholder="0.001"
                  aria-describedby="amount-currency"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <div className="absolute inset-y-0 left-15 pl-15 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">S</span>
                </div>
              </div>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>
          
            <div className="mb-4">
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm text-blue-800 mb-2">
                  <span className="font-medium">5% platform fee</span> will be applied to your contribution to maintain our service.
                </p>
                {amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 && (
                  <div className="text-xs text-blue-700">
                    <p>Your contribution: {parseFloat(amount).toFixed(3)} S</p>
                    <p>Platform fee (5%): {(parseFloat(amount) * 0.05).toFixed(3)} S</p>
                    <p className="font-medium">Campaign receives: {(parseFloat(amount) * 0.95).toFixed(3)} S</p>
                  </div>
                )}
              </div>
            </div>
          
            <button
              type="submit"
              disabled={isProcessing || amount === ''}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isProcessing || amount === '' ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Contribute Now'
              )}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default ContributionForm;