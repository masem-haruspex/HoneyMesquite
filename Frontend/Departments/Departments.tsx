// Departments.tsx
import { Html, Text } from '@react-three/drei';
import React, { useEffect, useRef, useState } from 'react';
import { COLORS } from '../colors';
import type { Department, DepartmentPerformance } from './department';
import DepartmentForm from './components/DepartmentForm';
import DepartmentPerformanceForm from './components/DepartmentPerformanceForm';
import './Departments.scss';
import '../scss/glow.scss';
import { DepartmentService } from './DepartmentService';
import Globe from './components/Globe';
import { useAtom } from 'jotai';
import { departmentsDataAtom, loadingAtom } from '../atoms/dataAtoms';
import DepartmentPerformanceScatterPlot from './components/DepartmentPerformanceScatterPlot';

const DepartmentList = React.memo(({ departments, onSelect, onHover }: {
  departments: Department[],
  onSelect: (dept: Department) => void,
  onHover: (dept: Department | null) => void
}) => {
  const listRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent) => {
    if (listRef.current) {
      listRef.current.scrollTop += e.deltaY;
      e.stopPropagation();
    }
  };

  return (
    <Html
      transform
      center
      position={[0, 0, 0]}
      style={{
        width: '360px',
        height: '600px',
        overflowY: 'auto',
        border: `solid 2px ${COLORS.PRIMARY}`,
        borderRadius: '8px',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
      }}
      onWheel={handleWheel}
    >
      <div ref={listRef} className="department-list__scroll-container">
        {departments.map((department) => (
          <div
            key={department.id}
            className="department-list__item-container"
            onMouseEnter={() => onHover(department)}
            onMouseLeave={() => onHover(null)}
          >
            <div className="glow-effect glow-effect--primary" />
            <div
              className="department-list__card"
              onClick={() => onSelect(department)}
            >
              <div className="department-list__header">
                <div className="department-list__name" title={department.name}>
                  {department.name}
                </div>
                <div
                  className="department-list__efficiency"
                  style={{
                    color: department.currentEfficiency < 80 ? COLORS.EXPENSE : COLORS.INCOME
                  }}
                >
                  {department.currentEfficiency}% efficiency
                </div>
              </div>
              <div className="department-list__footer">
                <span className="department-list__headcount">
                  {department.headcount} employees
                </span>
                <span className="department-list__budget">
                  ${department.currentBudget.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Html>
  );
});

const AddDepartmentButton = React.memo(({ onClick }: { onClick: () => void }) => (
  <Html
    position={[2.5, 6.6, 0]}
    center
    transform
    style={{ width: '100px' }}
  >
    <button
      className="department-nav__add-btn"
      onClick={onClick}
      aria-label="Add department"
    >
      + Department
    </button>
  </Html>
));

const BackButton = React.memo(({ onClick }: { onClick: () => void }) => (
  <Html
    position={[-9.7, 6.84, 0]}
    center
    distanceFactor={10}
    style={{ width: '400px' }}
    transform
  >
    <button
      className="department-nav__back-btn"
      onClick={onClick}
      aria-label="Back to departments"
    >
      ← Back
    </button>
  </Html>
));

const DepartmentDetail = React.memo(({ department, performances, onAddPerformance }: {
  department: Department,
  performances: DepartmentPerformance[],
  onAddPerformance: () => void
}) => {
  return (
    <group>
      <BackButton onClick={() => {}} />

      <group position={[-8, -5, 1]}>
        <Html
          transform
          center
          distanceFactor={10}
          style={{ width: '340px' }}
        >
          <div className="department-detail__info">
            <div className="glow-effect glow-effect--primary" />
            <div className="department-detail__row">
              <span className="department-detail__label">Headcount:</span>
              <span className="department-detail__value">{department.headcount}</span>
            </div>
            <div className="department-detail__row">
              <span className="department-detail__label">Efficiency:</span>
              <span
                className="department-detail__value"
                style={{
                  color: department.currentEfficiency < 80 ? COLORS.EXPENSE : COLORS.INCOME
                }}
              >
                {department.currentEfficiency}%
              </span>
            </div>
            <div className="department-detail__row">
              <span className="department-detail__label">Budget:</span>
              <span className="department-detail__value">${department.currentBudget.toLocaleString()}</span>
            </div>
            <div className="department-detail__row">
              <span className="department-detail__label">Fiscal Year:</span>
              <span className="department-detail__value">{department.fiscalYear}</span>
            </div>
          </div>
        </Html>
      </group>

      <DepartmentPerformanceScatterPlot
        performances={performances}
        position={[1, -3, 3]}
        departmentName={department.name}
      />

      <Html
        position={[-13.5, 5.8, 0]}
        center
        style={{ width: '100px' }}
        transform
      >
        <button
          className="department-nav__add-btn"
          onClick={onAddPerformance}
          aria-label="Add performance"
        >
          + Add Performance
        </button>
      </Html>
    </group>
  );
});

export default function Departments({ position }: { position: [number, number, number] }) {
  const [globalDepartmentsData] = useAtom(departmentsDataAtom);
  const [appLoading] = useAtom(loadingAtom);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [hoveredDepartment, setHoveredDepartment] = useState<Department | null>(null);
  const [performances, setPerformances] = useState<DepartmentPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeptForm, setShowDeptForm] = useState(false);
  const [showPerfForm, setShowPerfForm] = useState(false);

  useEffect(() => {
    if (globalDepartmentsData.length > 0) {
      setDepartments(globalDepartmentsData);
      setLoading(false);
    } else {
      async function loadDepartments() {
        try {
          const data = await DepartmentService.getAllDepartments();
          setDepartments(data);
        } catch (err) {
          console.error("Failed to load departments", err);
        } finally {
          setLoading(false);
        }
      }
      loadDepartments();
    }
  }, [globalDepartmentsData]);

  useEffect(() => {
    if (selectedDepartment) {
      async function loadPerformances() {
        try {
          const data = await DepartmentService.getDepartmentPerformance(selectedDepartment!.id);
          setPerformances(data);
        } catch (err) {
          console.error("Failed to load performance data", err);
          setPerformances([]);
        }
      }
      loadPerformances();
    }
  }, [selectedDepartment]);

  const handleAddDepartment = async (department: Omit<Department, 'id'>) => {
    try {
      const newDept = await DepartmentService.createDepartment(department);
      setDepartments(prev => [...prev, newDept]);
      setShowDeptForm(false);
    } catch (err) {
      console.error("Failed to add department", err);
    }
  };

  const handleAddPerformance = async (performance: Omit<DepartmentPerformance, 'id' | 'department'> & { departmentId: number }) => {
    try {
      const newPerf = await DepartmentService.recordPerformance(performance.departmentId, performance);
      setPerformances(prev => [...prev, newPerf]);
      setShowPerfForm(false);
    } catch (err) {
      console.error("Failed to add performance", err);
    }
  };

  if (appLoading) {
    return (
      <group position={position}>
        <Text>Loading application data...</Text>
      </group>
    );
  }

  if (loading) {
    return (
      <group position={position}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.4}
          color={COLORS.PRIMARY}
          anchorX="center"
          anchorY="middle"
          font="/fonts/orbitron-medium.otf"
        >
          Loading departments...
        </Text>
      </group>
    );
  }

  return (
    <group position={position}>
      {showDeptForm && (
        <DepartmentForm
          position={[0, 0, 0]}
          onSubmit={handleAddDepartment}
        />
      )}

      {showPerfForm && selectedDepartment && (
        <DepartmentPerformanceForm
          position={[0, 0, 0]}
          onSubmit={handleAddPerformance}
          departmentId={selectedDepartment.id}
        />
      )}

      {!showDeptForm && !showPerfForm && (
        <>
          {selectedDepartment ? (
            <DepartmentDetail
              department={selectedDepartment}
              performances={performances}
              onAddPerformance={() => setShowPerfForm(true)}
            />
          ) : (
            <group position={[10, -0.41, 0]} rotation={[0, -0.15, 0]}>
              <Text
                position={[0, 8, 0]}
                fontSize={0.5}
                color={COLORS.PRIMARY}
                anchorX="center"
                anchorY="middle"
                font="/fonts/orbitron-medium.otf"
                letterSpacing={0.05}
                lineHeight={1}
              >
                DEPARTMENTS
              </Text>

              <group position={[0, 0, 0]}>
                {departments.length === 0 ? (
                  <Text
                    position={[0, 0, 0]}
                    fontSize={0.4}
                    color={COLORS.PRIMARY}
                    anchorX="center"
                    anchorY="middle"
                    font="/fonts/orbitron-medium.otf"
                  >
                    No departments found
                  </Text>
                ) : (
                  <>
                    <DepartmentList
                      departments={departments}
                      onSelect={() => {}}
                      onHover={setHoveredDepartment}
                    />
                    <group position={[0, -0.05, 0]}>
                    <Globe
                      departments={departments}
                      hoveredDepartment={hoveredDepartment}
                    />
                    </group>
                  </>
                )}
              </group>
            </group>
          )}
          {false && selectedDepartment === null &&
            <AddDepartmentButton onClick={() => setShowDeptForm(true)} />
          }
        </>
      )}
    </group>
  );
}
