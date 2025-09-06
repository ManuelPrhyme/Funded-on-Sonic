import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserProvider, ethers } from 'ethers';

interface WalletContextType {
  account: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isConnecting: boolean;
  chainId: number | null;
  switchToSonicTest: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState<number | null>(null);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask or another Ethereum wallet!');
      return;
    }

    setIsConnecting(true);
    try {
      const provider = new BrowserProvider(window.ethereum);
      const _accounts = await window.ethereum.request({method:'eth_requestAccounts'});
      const Acc = _accounts[0]
      console.log("...",Acc)
      setAccount(_accounts[0]);
      const network = await provider.getNetwork();
      
      setChainId(Number(network.chainId));
      console.log(account, 'and', _accounts)
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const switchToSonicTest = async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x3909' }], 
      });
    } catch (error: any) {
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x3909',
            chainName: 'Sonic Testnet',
            nativeCurrency: { name: 'S Token', symbol: 'S', decimals: 18 },
            rpcUrls: ['https://rpc.testnet.soniclabs.com'],
            blockExplorerUrls: ['https://testnet.sonicscan.org/'],
          }],
        });
      }
    }
  };

  const disconnectWallet = async () => {
    await window.ethereum.request({method:'wallet_revokePermissions',params:[{'eth_accounts':{}}]})
    console.log('Accounts',typeof(account),account)
    setAccount(null);
    setChainId(null);
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        setAccount(accounts[0] || null);
      });

      window.ethereum.on('chainChanged', (chainId: string) => {
        setChainId(Number(chainId));
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
        window.ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, []);

  return (
    <WalletContext.Provider value={{
      account,
      connectWallet,
      disconnectWallet,
      isConnecting,
      chainId,
      switchToSonicTest
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};