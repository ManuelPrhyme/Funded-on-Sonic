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

  const { account: activeAccount, connectWallet, isConnecting, chainId, switchToSonicTest } = useWallet();
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
    if (chainId !== 14601) { // Sepolia chain ID
      setError('Please switch to Sonic Testnet');
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
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
            style={{backgroundColor: '#111926'}}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = '#0f1419';
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = '#111926';
            }}
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        </div>
      </div>
    );
  }
  
  // If on wrong network, show switch network interface
  if (chainId && chainId !== 14601) { // Sepolia chain ID
    return (
      <div className="bg-white rounded-lg p-6 shadow-md">
        <h3 className="text-xl font-semibold mb-4">Switch Network</h3>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Please switch to Sonic testnet to contribute</p>
          <button
            onClick={switchToSonicTest}
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-orange-600 hover:bg-orange-700"
          >
            Switch to Sonic Testnet
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
                  className="block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{'--tw-ring-color': '#111926'} as React.CSSProperties}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#111926';
                    e.currentTarget.style.boxShadow = `0 0 0 2px rgba(17, 25, 38, 0.2)`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgb(209 213 219)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
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
              <div className="p-3 rounded-md" style={{backgroundColor: 'rgba(17, 25, 38, 0.05)'}}>
                <p className="text-sm mb-2" style={{color: '#111926'}}>
                  <span className="font-medium">5% platform fee</span> will be applied to your contribution to maintain our service.
                </p>
                {amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 && (
                  <div className="text-xs" style={{color: '#374151'}}>
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
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isProcessing || amount === '' ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              style={{
                backgroundColor: '#111926',
                '--tw-ring-color': '#111926'
              } as React.CSSProperties}
              onMouseEnter={(e) => {
                if (!isProcessing && amount !== '') e.currentTarget.style.backgroundColor = '#0f1419';
              }}
              onMouseLeave={(e) => {
                if (!isProcessing && amount !== '') e.currentTarget.style.backgroundColor = '#111926';
              }}
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