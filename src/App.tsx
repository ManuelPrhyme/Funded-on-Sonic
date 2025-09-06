import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import CampaignPage from './pages/CampaignPage';
import CreateCampaignPage from './pages/CreateCampaignPage';
import DashboardPage from './pages/DashboardPage';
import CampaignsPage from './pages/CampaignsPage';
import { CampaignProvider } from './contexts/CampaignContext';
import { WalletProvider } from './contexts/WalletContext';
import {CivicAuthProvider} from '@civic/auth-web3/react'
import { sdk } from '@farcaster/miniapp-sdk'
import { useEffect, useState} from 'react';
 

function App() {

   const [isReady, setIsReady] = useState(false);


  useEffect(()=>{
      const Await = async () =>{
      await sdk.actions.ready()
      setIsReady(true);
      }

      if (!isReady) {
        Await()
    }


      

  },[isReady])

  return (
    
    <WalletProvider>
      <CampaignProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/campaigns" element={<CampaignsPage />} />
              <Route path="/campaign/:id" element={<CampaignPage />} />
              <Route path="/create" element={<CreateCampaignPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
            </Routes>
          </Layout>
        </Router>
      </CampaignProvider>
    </WalletProvider>
  
  );
}

export default App;