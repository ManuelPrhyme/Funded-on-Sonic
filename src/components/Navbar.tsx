import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Wallet, Search } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
// import {UserButton} from '@civic/auth-web3/react'
import Img from '../pages/lg.png'

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { account, connectWallet, isConnecting, chainId, switchToSonicTest, disconnectWallet } = useWallet();
  const location = useLocation();

  const handleConnectWallet = async () => {
    
    await connectWallet();
    if (chainId !== 14601) { 
      await switchToSonicTest();
    }

  
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8" style={{color: '#111926'}}>
              <img src={Img} alt="" />
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">Funded-On-Sonic</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link 
                to="/" 
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/') ? 'text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                style={isActive('/') ? {borderBottomColor: '#111926'} : {}}
              >
                Home
              </Link>
              <Link 
                to="/campaigns" 
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/campaigns') ? 'text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                style={isActive('/campaigns') ? {borderBottomColor: '#111926'} : {}}
              >
                Campaigns
              </Link>
              <Link 
                to="/create" 
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/create') ? 'text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                style={isActive('/create') ? {borderBottomColor: '#111926'} : {}}
              >
                Create Campaign
              </Link>
              <Link 
                to="/dashboard" 
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/dashboard') ? 'text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                style={isActive('/dashboard') ? {borderBottomColor: '#111926'} : {}}
              >
                Dashboard
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
        
            <button 
              onClick={account ? disconnectWallet : handleConnectWallet}
              disabled={isConnecting}
              className={`ml-4 px-4 py-2 rounded-md text-white font-medium transition duration-150 ease-in-out ${
                account 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : ''
              }`}
              style={!account ? {backgroundColor: '#111926'} : {}}
              onMouseEnter={(e) => {
                if (!account) e.currentTarget.style.backgroundColor = '#0f1419';
              }}
              onMouseLeave={(e) => {
                if (!account) e.currentTarget.style.backgroundColor = '#111926';
              }}
            >
              {isConnecting ? 'Connecting...' : account 
                ? `Disconnect Wallet`
                : 'Connect Wallet'
              }
            </button>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset"
              style={{'--tw-ring-color': '#111926'} as React.CSSProperties}
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link 
              to="/" 
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/') 
                  ? 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
              }`}
              style={isActive('/') ? {borderLeftColor: '#111926', color: '#111926', backgroundColor: 'rgba(17, 25, 38, 0.1)'} : {}}
            >
              Home
            </Link>
            <Link 
              to="/campaigns" 
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/campaigns') 
                  ? 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
              }`}
              style={isActive('/campaigns') ? {borderLeftColor: '#111926', color: '#111926', backgroundColor: 'rgba(17, 25, 38, 0.1)'} : {}}
            >
              Campaigns
            </Link>
            <Link 
              to="/create" 
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/create') 
                  ? 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
              }`}
              style={isActive('/create') ? {borderLeftColor: '#111926', color: '#111926', backgroundColor: 'rgba(17, 25, 38, 0.1)'} : {}}
            >
              Create Campaign
            </Link>
            <Link 
              to="/dashboard" 
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/dashboard') 
                  ? 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
              }`}
              style={isActive('/dashboard') ? {borderLeftColor: '#111926', color: '#111926', backgroundColor: 'rgba(17, 25, 38, 0.1)'} : {}}
            >
              Dashboard
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <input
                type="text"
                placeholder="Search campaigns..."
                className="py-1 pl-10 pr-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 w-full"
                style={{'--tw-ring-color': '#111926', '--tw-border-opacity': '1'} as React.CSSProperties}
                onFocus={(e) => e.currentTarget.style.borderColor = '#111926'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'rgb(209 213 219)'}
              />
              <Search className="absolute left-7 h-5 w-5 text-gray-400" />
            </div>
            <div className="mt-3 px-2">
              <button 
                onClick={account ? disconnectWallet : handleConnectWallet}
                disabled={isConnecting}
                className={`w-full px-4 py-2 rounded-md text-white font-medium transition duration-150 ease-in-out ${
                  account 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : ''
                }`}
                style={!account ? {backgroundColor: '#111926'} : {}}
                onMouseEnter={(e) => {
                  if (!account) e.currentTarget.style.backgroundColor = '#0f1419';
                }}
                onMouseLeave={(e) => {
                  if (!account) e.currentTarget.style.backgroundColor = '#111926';
                }}
              >
                {isConnecting ? 'Connecting...' : account 
                  ? `Disconnect Wallet`
                  : 'Connect Wallet'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;