// Overview.tsx
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useState, Suspense } from 'react';
import * as THREE from 'three';
import './Overview.scss';
import { useAtom } from 'jotai';
import { loadingAtom } from '../atoms/dataAtoms';
import FinancialDashboard from './components/FinancialDashboard';
import CompanyInfo from './components/CompanyInfo';

export interface CompanyInfoData {
  name: string;
  ticker: string;
  founded: string;
  headquarters: string;
  ceo: string;
  employees: number;
  marketCap: number;
  revenue: number;
  netIncome: number;
  industry: string;
  sector: string;
  website: string;
  phone: string;
  email: string;
  fiscalYearEnd: string;
  nextEarnings: string;
  creditRating: string;
  sustainabilityScore: number;
  innovationIndex: number;
  customerSatisfaction: number;
  socialMediaFollowers: {
    twitter: number;
    linkedin: number;
    instagram: number;
  };
}

const mockCompany: CompanyInfoData = {
  name: 'NexaCorp Industries',
  ticker: 'NXA',
  founded: '2015',
  headquarters: 'San Francisco, CA',
  ceo: 'Dr. Elena Márquez',
  employees: 4_280,
  marketCap: 18_700_000_000,
  revenue: 3_450_000_000,
  netIncome: 580_000_000,
  industry: 'Advanced Technology & AI',
  sector: 'Technology',
  website: 'https://nexacorp.tech',
  phone: '+1 (800) 555-0192',
  email: 'investors@nexacorp.tech',
  fiscalYearEnd: 'December 31',
  nextEarnings: '2025-04-15',
  creditRating: 'AA+ (S&P)',
  sustainabilityScore: 87,
  innovationIndex: 94,
  customerSatisfaction: 91,
  socialMediaFollowers: {
    twitter: 1_240_000,
    linkedin: 890_000,
    instagram: 420_000,
  },
};

export default function Overview({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const [appLoading] = useAtom(loadingAtom);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'company'>('company');

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.03;
    }
  });

  if (appLoading) {
    return (
      <group position={position}>
        <Html transform center>
          <div className="overview-loading">Loading application data...</div>
        </Html>
      </group>
    );
  }

  return (
    <group ref={groupRef} position={position} scale={1.2}>
      <Html transform center distanceFactor={8} wrapperClass="overview-wrapper">
        <div className="overview-container">
          <div className="overview-header">
            <h1 className="overview-title">OVERVIEW</h1>
            <div className="overview-tabs">
              <button
                className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                Dashboard
              </button>
              <button
                className={`tab-button ${activeTab === 'company' ? 'active' : ''}`}
                onClick={() => setActiveTab('company')}
              >
                Company Info
              </button>
            </div>
          </div>

          <div className="overview-content">
            <Suspense fallback={
              <div className="overview-loading">
                <div className="spinner" />
                <div>Loading {activeTab}...</div>
              </div>
            }>
              {activeTab === 'dashboard' ? (
                <FinancialDashboard />
              ) : (
                <CompanyInfo company={mockCompany} />
              )}
            </Suspense>
          </div>

          <div className="overview-footer">
            <div className="disclaimer">
              Data as of {new Date().toLocaleDateString()} • Internal Use Only
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}
