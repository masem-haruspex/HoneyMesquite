// src/common_components/LoadingScreen.tsx
import { useState, useEffect } from 'react';
import './LoadingScreen.scss';

interface LoadingScreenProps {
  progress: number;
  status: string;
  onComplete?: () => void;
}

export default function LoadingScreen({ progress, status, onComplete }: LoadingScreenProps) {
  const [displayProgress, setDisplayProgress] = useState(0);
  const [loadingSteps, setLoadingSteps] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayProgress(progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  useEffect(() => {
    const steps = [
      'Initializing Core Systems...',
      'Loading 3D Assets...',
      'Compiling Shaders...',
      'Loading Financial Data...',
      'Initializing Charts...',
      'Calibrating HUD...',
      'Finalizing...',
    ];

    setLoadingSteps(steps);
    const stepIndex = Math.min(
      Math.floor((progress / 100) * steps.length),
      steps.length - 1
    );
    setCurrentStep(stepIndex);

    if (progress >= 100 && onComplete) {
      const timer = setTimeout(onComplete, 800);
      return () => clearTimeout(timer);
    }
  }, [progress, onComplete]);

  return (
    <div className="loading-screen">
      <div className="loading-bg-grid" />
      
      <div className="loading-bg-glow" />

      <div className="loading-container">
        <div className="loading-header">
          <div className="loading-logo">
            <div className="logo-icon">◈</div>
            <div className="logo-text">
              <span className="logo-title">HONEY MESQUITE FINANCE</span>
              <span className="logo-subtitle">FINANCIAL HUB</span>
            </div>
          </div>
          <div className="loading-version">v1.0.1</div>
        </div>

        <div className="loading-central">
          <div className="loader-rings">
            <div className="ring ring-1" />
            <div className="ring ring-2" />
            <div className="ring ring-3" />
            <div className="ring-core" />
          </div>

          <div className="progress-percentage">
            {Math.round(displayProgress)}%
          </div>
        </div>

        <div className="loading-status">
          <div className="status-label">SYSTEM STATUS</div>
          <div className="status-text">{status || loadingSteps[currentStep]}</div>
          <div className="status-dots">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </div>
        </div>

        <div className="loading-progress-bar">
          <div className="progress-track">
            <div 
              className="progress-fill" 
              style={{ width: `${displayProgress}%` }}
            >
              <div className="progress-glow" />
            </div>
          </div>
          <div className="progress-markers">
            {[0, 25, 50, 75, 100].map((mark) => (
              <div 
                key={mark} 
                className={`marker ${displayProgress >= mark ? 'active' : ''}`}
                style={{ left: `${mark}%` }}
              />
            ))}
          </div>
        </div>

        <div className="loading-steps">
          {loadingSteps.map((step, index) => (
            <div 
              key={index} 
              className={`step ${index <= currentStep ? 'completed' : ''} ${index === currentStep ? 'active' : ''}`}
            >
              <div className="step-indicator">
                {index < currentStep ? '✓' : index === currentStep ? '◈' : '○'}
              </div>
              <div className="step-text">{step}</div>
            </div>
          ))}
        </div>

        <div className="loading-footer">
          <div className="footer-text">
            <span>SECURE CONNECTION</span>
            <span className="footer-divider">|</span>
            <span>ENCRYPTED</span>
            <span className="footer-divider">|</span>
            <span>SYSTEM READY</span>
          </div>
          <div className="footer-glitch" />
        </div>
      </div>

      <div className="loading-scan-line" />
    </div>
  );
}
