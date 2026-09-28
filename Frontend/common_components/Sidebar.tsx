import { Html } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { COLORS } from '../colors';
import './Sidebar.scss';

const NAV_ITEMS = [
  { id: 'company', label: 'Company', icon: '🏢' },
  { id: 'cash-flow', label: 'Cash Flow', icon: '🌊' },
  { id: 'receivables', label: 'Receivables', icon: '📥' },
  { id: 'general-ledger', label: 'General Ledger', icon: '📒' },
  { id: 'departments', label: 'Departments', icon: '🏢' },
  { id: 'profit-loss', label: 'Profit & Loss', icon: '📈' },
  { id: 'budgets', label: 'Budgets', icon: '💰' },
  { id: 'vendors', label: 'Vendors', icon: '🏭' },
];

interface SidebarProps {
  activePage: string;
  onNavigate: (pageId: string) => void;
}

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const groupRef = useRef<any>(null);
  const isActive = useRef(false);
  const [isExpanded, setIsExpanded] = useState(true);

  useFrame((state) => {
    if (groupRef.current && !isActive.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    }
  });

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.y = 0;
    }
  }, [activePage]);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <group ref={groupRef} position={[-1.8, 0, 0]} scale={0.84}>
      <Html transform style={{ width: isExpanded ? '220px' : '60px', height: '100%' }}>
        <div className={`sidebar-container ${isExpanded ? '' : 'collapsed'}`}>

          <div className="sidebar-header">
            <h2 className="sidebar-title-container" onClick={toggleSidebar}>
              {isExpanded ? (
                <>
                  <div className='sidebar-title'>
                    FINANCE HUB
                    <span className="toggle-arrow">▼</span>
                  </div>
                  <span className="sidebar-subtitle">Financial Intelligence Platform</span>
                </>
              ) : (
                <div className="sidebar-title-collapsed">
                  FH
                  <span className="toggle-arrow">▲</span>
                </div>
              )}
            </h2>
          </div>

          {isExpanded && (
            <>

              <nav className="sidebar-nav">
                <ul className="sidebar-menu">
                  {NAV_ITEMS.map((item) => (
                    <li key={item.id} className="sidebar-item">
                      <button
                        onClick={() => onNavigate(item.id)}
                        className={`sidebar-button ${activePage === item.id ? 'active' : ''}`}
                      >
                        <span className="sidebar-icon">{item.icon}</span>
                        <span className="sidebar-label">{item.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="sidebar-footer">
                <div className="sidebar-status">
                  <span className="status-dot" style={{ backgroundColor: COLORS.PRIMARY }}></span>
                  <span className="status-text">Connected</span>
                </div>
              </div>

            </>
          )}
        </div>
      </Html>
    </group>
  );
}
