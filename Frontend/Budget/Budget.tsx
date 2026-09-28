import { Html, Text } from '@react-three/drei';
import { useEffect,  useState } from 'react';
import { COLORS } from '../colors';
import type {
  BudgetVsActualResponse,
    BudgetAllocationRequest,
    BudgetActualRequest,
    Category
} from './budget';
import { BudgetService } from './BudgetService';
import './Budget.scss';
import BudgetList from './components/BudgetList';
import BudgetVisualization from './components/BudgetVisualization';
import BudgetForm, { type BudgetFormState } from './components/BudgetForm';
import type { Department } from '../Departments/department';
import { DepartmentService } from "../Departments/DepartmentService.ts";
import type { BudgetAllocation } from './budget';
import { ThreeDSelect } from "../common_components/ThreeDSelect";
import { useAtom } from 'jotai';
import { budgetsDataAtom, loadingAtom, departmentsDataAtom } from '../atoms/dataAtoms';

export default function Budgets({ position }: { position: [number, number, number] }) {
  const [allBudgetsData] = useAtom(budgetsDataAtom);
  const [allDepartmentsData] = useAtom(departmentsDataAtom);
  const [appLoading] = useAtom(loadingAtom);

  const [vsActualData, setVsActualData] = useState<BudgetVsActualResponse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState<BudgetFormState | null>(null);
  const [fiscalYear, setFiscalYear] = useState(new Date().getFullYear());
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);

  const netVariance = vsActualData.reduce((sum, item) => sum + item.variance, 0);

  useEffect(() => {
    if (allDepartmentsData.length > 0) {
      setDepartments(allDepartmentsData);
    } else {
      DepartmentService.getAllDepartments()
        .then(depts => setDepartments(depts))
        .catch(error => console.error('Error loading departments:', error));
    }
  }, [allDepartmentsData]);

  useEffect(() => {
  async function loadData() {
    try {
      setLoading(true);

      if (allBudgetsData.length > 0 && allBudgetsData[0] && 'actualAmount' in allBudgetsData[0]) {
        let filteredData = (allBudgetsData as BudgetVsActualResponse[])
          .filter(item => {
            const matchesDept = selectedDepartmentId === null || item.departmentId === selectedDepartmentId;
            const matchesYear = item.fiscalYear === fiscalYear;
            return matchesYear && matchesDept;
          });
        setVsActualData(filteredData);
      } else {
        const vsActual = await BudgetService.getBudgetVsActual(selectedDepartmentId, fiscalYear);
        setVsActualData(vsActual);
      }

      const categoriesData = await BudgetService.getAllCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading budget data:', error);
    } finally {
      setLoading(false);
    }
  }
  loadData();
}, [fiscalYear, selectedDepartmentId, allBudgetsData]);

  const handleAddAllocation = async (data: BudgetAllocationRequest) => {
    try {
      const allocationData: Omit<BudgetAllocation, 'id'> = {
        departmentId: data.departmentId,
        categoryId: data.categoryId,
        fiscalYear: data.fiscalYear,
        quarter: data.quarter,
        budgetedAmount: data.budgetedAmount,
        isCurrent: true,
        version: 1,
        createdAt: new Date().toISOString()
      };

      await BudgetService.createAllocation(allocationData);
      refreshData();
    } catch (error) {
      console.error('Error creating allocation:', error);
    }
  };

  const handleAddActual = async (data: BudgetActualRequest) => {
    try {
      await BudgetService.createActual(data);
      refreshData();
    } catch (error) {
      console.error('Error recording actual:', error);
    }
  };

  const refreshData = async () => {
    const data = await BudgetService.getBudgetVsActual(selectedDepartmentId!, fiscalYear);
    setVsActualData(data);
    setShowForm(null);
  };

  const handleSave = (data: BudgetAllocationRequest | BudgetActualRequest) => {
    if ('departmentId' in data) {
      handleAddAllocation(data);
    } else {
      handleAddActual(data);
    }
  };

  const selectedItem = vsActualData.find(item => item.allocationId === selectedId) || null;

  if (appLoading) {
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
          Loading application data...
        </Text>
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
          Loading budget data...
        </Text>
      </group>
    );
  }

  console.log("Render Check - vsActualData length:", vsActualData.length, "loading:", loading);

  return (
    <group position={position}>
      {showForm && (
        <BudgetForm
          initialState={showForm}
          onSave={handleSave}
          onCancel={() => setShowForm(null)}
          categories={categories}
        />
      )}

      {!showForm && (
        <group position={[8.9, 0, 0]} rotation={[0, 0, 0]}>
          <Text
            position={[0.4, 7, 0]}
            fontSize={0.5}
            color={COLORS.PRIMARY}
            anchorX="center"
            anchorY="middle"
            font="/fonts/orbitron-medium.otf"
            letterSpacing={0.05}
            lineHeight={1}
          >
            {selectedDepartmentId
              ? `${departments.find(d => d.id === selectedDepartmentId)?.name.toUpperCase()} BUDGETS`
              : 'ALL DEPARTMENTS'} (FY {fiscalYear})
          </Text>

          <Html
            position={[0, -0.4, 0]}
            center
            style={{ width: '400px' }}
            transform
          >
            <div className="budget-container">
              <div className="budget-selectors">
                <div className="budget-selector__group">
                  <ThreeDSelect
                    options={[
                      { value: '', label: 'All Departments' },
                      ...departments.map(dept => ({ value: dept.id, label: dept.name }))
                    ]}
                    value={selectedDepartmentId || ''}
                    onChange={(value) => setSelectedDepartmentId(Number(value) || null)}
                  />
                </div>

                <div className="budget-selector__group">
                  <div className="budget-year-selector">
                    <button
                      onClick={() => setFiscalYear(prev => prev - 1)}
                      aria-label="Previous year"
                      className="budget-year-selector__button"
                    >
                      &lt;
                    </button>
                    <span className="budget-year-selector__value">{fiscalYear}</span>
                    <button
                      onClick={() => setFiscalYear(prev => prev + 1)}
                      aria-label="Next year"
                      className="budget-year-selector__button"
                    >
                      &gt;
                    </button>
                  </div>
                </div>
              </div>

              <div className="budget-content">
                {vsActualData.length === 0 ? (
                  <div className="budget-empty">
                    {loading ? 'Loading...' : `No budget data found for ${selectedDepartmentId ? departments.find(d => d.id === selectedDepartmentId)?.name : 'selected filters'}`}
                  </div>
                ) : (
                  <>
                    <div className="budget-list__scroll-container">
                      <BudgetList
                        items={vsActualData}
                        onSelect={setSelectedId}
                        selectedId={selectedId}
                      />
                    </div>

                    <div className="budget-summary">
                      <div className="budget-summary__stat">
                        <span>Total Budget:</span>
                        <span>${vsActualData.reduce((sum, item) => sum + item.budgetedAmount, 0).toLocaleString()}</span>
                      </div>
                      <div className="budget-summary__stat">
                        <span>Total Actual:</span>
                        <span>${vsActualData.reduce((sum, item) => sum + item.actualAmount, 0).toLocaleString()}</span>
                      </div>
                      <div className="budget-summary__stat">
                        <span>Net Variance:</span>
                        <span style={{
                          color: netVariance < 0 ? COLORS.EXPENSE : COLORS.INCOME
                        }}>
                          ${Math.abs(netVariance).toLocaleString()}
                          {netVariance >= 0 ? ' over' : ' under'}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Html>
        </group>
      )}

      {!showForm && false && (
        <>
          <Html
            position={[1.6, 6.6, 0]}
            center
            distanceFactor={10}
            style={{ width: '100px' }}
            transform
          >
            <button
              className="budget-nav__add-btn"
              onClick={() => setShowForm({ type: 'allocation' })}
              aria-label="Add budget allocation"
            >
              + Budget
            </button>
          </Html>
          <Html
            position={[1.6, 5.4, 0]}
            center
            distanceFactor={10}
            style={{ width: '100px' }}
            transform
          >
            <button
              className="budget-nav__add-btn"
              onClick={() => setShowForm({ type: 'actual' })}
              aria-label="Add actual spending"
            >
              + Actual
            </button>
          </Html>
        </>
      )}

      {selectedItem && !showForm && (
        <group position={[-5, 0, 0]} scale={1.4}>
          <BudgetVisualization item={selectedItem} />
        </group>
      )}
    </group>
  );
}
