// App.tsx
import { OrbitControls } from '@react-three/drei';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useAtom } from 'jotai';
import * as THREE from 'three';
import Departments from './Departments/Departments';
import ProfitLoss from './ProfitLoss/ProfitLoss';
import Budgets from './Budget/Budget';
import CashFlow from './CashFlow/CashFlow';
import Vendors from './Vendor/Vendor';
import Receivables from './Receivables/Receivables';
import Sidebar from './common_components/Sidebar';
import Company from "./Overview/Overview";
import GeneralLedger from './GeneralLedger/GeneralLedger';
import RotatingPages from './common_components/RotatingPages';
import { showIceCubeAtom } from './atoms/atomShowIceCube';
import { MainService } from './mainService';
import LoadingScreen from './common_components/LoadingScreen';
import ErrorScreen from './common_components/ErrorScreen';
import {
  budgetsDataAtom,
  cashFlowDataAtom,
  departmentsDataAtom,
  profitLossDataAtom,
  receivablesDataAtom,
  vendorsDataAtom,
  loadingAtom,
  errorAtom,
  retryCountAtom,
  activePageAtom,
} from './atoms/dataAtoms';

export const PAGE_CONFIG = [
  { id: 'company', component: Company, label: 'Company', icon: '🏢' },
  { id: 'cash-flow', component: CashFlow, label: 'Cash Flow', icon: '🌊' },
  { id: 'receivables', component: Receivables, label: 'Receivables', icon: '📥' },
  { id: 'general-ledger', component: GeneralLedger, label: 'General Ledger', icon: '📒' },
  { id: 'departments', component: Departments, label: 'Departments', icon: '🏢' },
  { id: 'profit-loss', component: ProfitLoss, label: 'Profit & Loss', icon: '📈' },
  { id: 'budgets', component: Budgets, label: 'Budgets', icon: '💰' },
  { id: 'vendors', component: Vendors, label: 'Vendors', icon: '🏭' },
] as const;

const IS_CAMERA_MOVABLE = false;

const easeInOutCubic = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

function CameraAnimator() {
  const { camera } = useThree();
  const [animationStarted, setAnimationStarted] = useState(false);
  const [showIceCube, setShowIceCube] = useAtom(showIceCubeAtom);
  const startTimeRef = useRef<number | null>(null);
  const duration = 3000;
  const startZ = 20;
  const endZ = 138;

  useFrame((state, _) => {
    if (!animationStarted) return;
    if (startTimeRef.current === null) {
      startTimeRef.current = state.clock.elapsedTime * 1000;
    }
    const elapsed = state.clock.elapsedTime * 1000 - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeInOutCubic(progress);
    const currentZ = startZ + (endZ - startZ) * easedProgress;
    camera.position.z = currentZ;

    if (camera instanceof THREE.PerspectiveCamera) {
      const startFov = 80;
      const targetFov = 50;
      camera.fov = startFov + (targetFov - startFov) * progress;
      if (camera.position.z > 30 && showIceCube) setShowIceCube(false);
    }
    camera.updateProjectionMatrix();
    if (progress >= 1) setAnimationStarted(false);
  });

  useEffect(() => {
    const timer = setTimeout(() => setAnimationStarted(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  return null;
}

function CameraControls() {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const defaultPosition = [0, 0, 20] as const;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Numpad0') {
        event.preventDefault();
        if (controlsRef.current) {
          camera.position.set(...defaultPosition);
          if (camera instanceof THREE.PerspectiveCamera) camera.fov = 70;
          else if (camera instanceof THREE.OrthographicCamera) camera.zoom = 1;
          camera.updateProjectionMatrix();
          controlsRef.current.update();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.05}
      rotateSpeed={0.5}
    />
  );
}

export default function App() {
  const [activePage, setActivePage] = useAtom(activePageAtom);
  const [isLoading, setIsLoading] = useAtom(loadingAtom);

  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState('Initializing...');

  const [error, setError] = useAtom(errorAtom);
  const [retryCount, setRetryCount] = useAtom(retryCountAtom);

  const [, setBudgetsData] = useAtom(budgetsDataAtom);
  const [, setCashFlowData] = useAtom(cashFlowDataAtom);
  const [, setDepartmentsData] = useAtom(departmentsDataAtom);
  const [, setProfitLossData] = useAtom(profitLossDataAtom);
  const [, setReceivablesData] = useAtom(receivablesDataAtom);
  const [, setVendorsData] = useAtom(vendorsDataAtom);

  const activeIndex = PAGE_CONFIG.findIndex((p) => p.id === activePage);
  const targetRotation = (activeIndex / PAGE_CONFIG.length) * Math.PI * 2;

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const stages = [
          { progress: 10, status: 'Initializing Core Systems...' },
          { progress: 25, status: 'Loading 3D Assets...' },
          { progress: 40, status: 'Compiling Shaders...' },
          { progress: 55, status: 'Loading Financial Data...' },
          { progress: 70, status: 'Initializing Charts...' },
          { progress: 85, status: 'Calibrating HUD...' },
          { progress: 95, status: 'Finalizing...' },
          { progress: 100, status: 'Complete' },
        ];

        for (const stage of stages) {
          setLoadingProgress(stage.progress);
          setLoadingStatus(stage.status);
          await new Promise(resolve => setTimeout(resolve, 250));
        }

        const data = await MainService.loadAllData();

        setBudgetsData(data.budgets);
        setCashFlowData(data.cashFlow);
        setDepartmentsData(data.departments);
        setProfitLossData(data.profitLoss);
        setReceivablesData(data.receivables);
        setVendorsData(data.vendors);

        await new Promise(resolve => setTimeout(resolve, 500));
        setIsLoading(false);

      } catch (err) {
        console.error('Failed to load application data:', err);

        if (retryCount < 3) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 2000);
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load data after multiple attempts');
          setIsLoading(false);
        }
      }
    };

    loadInitialData();
  }, [retryCount, setIsLoading, setError, setRetryCount,
      setBudgetsData, setCashFlowData, setDepartmentsData,
      setProfitLossData, setReceivablesData, setVendorsData]);

  useEffect(() => {
    const preloadPages = async () => {
      await Promise.all([
        import('./CashFlow/CashFlow'),
        import('./GeneralLedger/GeneralLedger'),
        import('./ProfitLoss/ProfitLoss'),
        import('./Departments/Departments'),
        import('./Budget/Budget'),
        import('./Vendor/Vendor'),
        import('./Receivables/Receivables'),
        import('./Overview/Overview'),
        import('./Departments/components/Globe'),
        import('./Departments/components/DepartmentPerformanceScatterPlot'),
        import('./ProfitLoss/components/BarChart3D'),
        import('./ProfitLoss/components/PieChart3D'),
        import('./ProfitLoss/components/LineChart'),
      ]);
    };
    preloadPages();
  }, []);

  const handleRetry = () => {
    setRetryCount(0);
    setError(null);
  };

  if (isLoading) {
    return (
      <LoadingScreen
        progress={loadingProgress}
        status={loadingStatus}
        onComplete={() => setIsLoading(false)}
      />
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      <div style={{ flex: 1, position: 'relative' }}>
        <Canvas
          dpr={window.devicePixelRatio}
          camera={{ position: [0, 0, 20], fov: 80 }}
          gl={{ antialias: true }}
          style={{ background: '#0a1a21' }}
        >
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={0.6} color="#00F5FF" />

          <EffectComposer>
            <Bloom
              intensity={0.8}
              threshold={0.3}
              kernelSize={3}
              luminanceSmoothing={0.2}
            />
          </EffectComposer>

          {error && (
            <ErrorScreen error={error} onRetry={handleRetry} />
          )}

          {!isLoading && !error && (
            <>
              <RotatingPages targetRotation={targetRotation} />
              <CameraAnimator />
              <group position={[-7.4, 0, 125]}>
                <Sidebar
                  activePage={activePage}
                  onNavigate={(pageId: string) => setActivePage(pageId)}
                />
              </group>
              {IS_CAMERA_MOVABLE && <CameraControls />}
            </>
          )}
        </Canvas>
      </div>
    </div>
  );
}
