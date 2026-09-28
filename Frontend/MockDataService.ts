import type {
	BudgetAllocation,
		BudgetActual,
		BudgetVsActualResponse,
		Category,
} from './Budget/budget';

import type {
	CashFlowForecast,
		ForecastActual,
		RunwayDataPoint,
		RiskFactor,
		LiquidityEvent,
		ConfidenceDataPoint,
		Scenario,
} from './CashFlow/cashFlow';

import type {
	Department,
		DepartmentPerformance,
} from './Departments/department';

import type {
	ProfitLossStatement,
		PLLineItem,
} from './ProfitLoss/profitLoss';

import type {
	AccountsReceivable,
		Client,
} from './Receivables/receivable';

import type {
	Vendor,
		VendorContract,
		VendorInvoice,
		VendorContractVarianceResponse,
} from './Vendor/vendor';

import type {
	Account,
		JournalEntry,
		BankAccount,
		BankStatement,
		AccountingPeriod,
		TrialBalanceItem,
} from './GeneralLedger/generalLedger';

const randomId = () => Math.floor(Math.random() * 10000) + 1;

const randomDate = (start: Date, end: Date) =>
	new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const formatDate = (date: Date) => date.toISOString().split('T')[0];

const randomAmount = (min: number, max: number) =>
	Math.round((Math.random() * (max - min) + min) * 100) / 100;

const randomElement = <T,>(arr: T[]): T =>
	arr[Math.floor(Math.random() * arr.length)];

export const MockDataService = {
	async getBudgetAllocations(): Promise<BudgetAllocation[]> {
		const categories = await this.getCategories();
		const allocations: BudgetAllocation[] = [];

		for (let i = 1; i <= 20; i++) {
			const category = randomElement(categories);
			allocations.push({
				id: i,
				departmentId: Math.floor(Math.random() * 5) + 1,
				categoryId: category.id,
				fiscalYear: 2026,
				quarter: randomElement(['Q1', 'Q2', 'Q3', 'Q4']),
				budgetedAmount: randomAmount(10000, 500000),
				isCurrent: true,
				version: 1,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			});
		}

		return allocations;
	},

	async getBudgetActuals(): Promise<BudgetActual[]> {
		const allocations = await this.getBudgetAllocations();
		return allocations.map((alloc) => ({
			id: randomId(),
			allocationId: alloc.id,
			recordedDate: formatDate(new Date()),
			actualAmount: alloc.budgetedAmount * randomAmount(0.7, 1.3),
			variance: alloc.budgetedAmount * randomAmount(-0.3, 0.3),
			notes: 'Mock actual record',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		}));
	},

	async getBudgetVsActual(
  _departmentId: number | null,
  _fiscalYear: number
): Promise<BudgetVsActualResponse[]> {
  const allocations = await this.getBudgetAllocations();
  const actuals = await this.getBudgetActuals(); 
  const categories = await this.getCategories();

  return allocations.map((alloc) => {
    const actual = actuals.find((a) => a.allocationId === alloc.id);
    const category = categories.find((c) => c.id === alloc.categoryId);
    const budgetedAmount = alloc.budgetedAmount;
    const actualAmount = actual?.actualAmount || budgetedAmount * randomAmount(0.7, 1.3); 

    return {
      allocationId: alloc.id,
      categoryId: alloc.categoryId,
      categoryName: category?.name || 'Unknown',
      budgetedAmount,
      actualAmount,
      variance: budgetedAmount - actualAmount,
      quarter: alloc.quarter,
      fiscalYear: alloc.fiscalYear,
      departmentId: alloc.departmentId,
    };
  });
},

	async getCategories(): Promise<Category[]> {
		return [
			{ id: 1, name: 'Revenue', type: 'INCOME', createdAt: new Date().toISOString() },
			{ id: 2, name: 'Cost of Goods Sold', type: 'EXPENSE', createdAt: new Date().toISOString() },
			{ id: 3, name: 'Operating Expenses', type: 'EXPENSE', createdAt: new Date().toISOString() },
			{ id: 4, name: 'Marketing', type: 'EXPENSE', createdAt: new Date().toISOString() },
			{ id: 5, name: 'R&D', type: 'EXPENSE', createdAt: new Date().toISOString() },
			{ id: 6, name: 'Administrative', type: 'EXPENSE', createdAt: new Date().toISOString() },
		];
	},

	async getCashFlowForecasts(): Promise<CashFlowForecast[]> {
		const forecasts: CashFlowForecast[] = [];
		const scenarios: Array<'BEST_CASE' | 'BASE_CASE' | 'WORST_CASE'> = [
			'BEST_CASE',
			'BASE_CASE',
			'WORST_CASE',
		];

		for (let i = 1; i <= 12; i++) {
			const scenario = randomElement(scenarios);
			const startDate = new Date(2026, 0, 1);
			startDate.setMonth(startDate.getMonth() + (i - 1) * 3);

			forecasts.push({
				id: i,
				scenario,
				forecastDate: formatDate(new Date()),
				periodStart: formatDate(startDate),
				periodEnd: formatDate(new Date(startDate.getFullYear(), startDate.getMonth() + 3, 0)),
				projectedAmount: randomAmount(100000, 1000000),
				confidenceInterval: randomAmount(0.7, 0.95),
				burnRate: randomAmount(50000, 200000),
				assumptions: {
					marketGrowth: randomAmount(0.05, 0.15),
					customerAcquisition: randomAmount(100, 500),
				},
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			});
		}

		return forecasts;
	},

	async getForecastActuals(): Promise<ForecastActual[]> {
		const forecasts = await this.getCashFlowForecasts();
		return forecasts.map((f) => ({
			forecastId: f.id,
			actualDate: f.periodStart,
			actualAmount: f.projectedAmount * randomAmount(0.8, 1.2),
			variance: f.projectedAmount * randomAmount(-0.2, 0.2),
			variancePercentage: randomAmount(-20, 20),
		}));
	},

	async getRunwayData(): Promise<RunwayDataPoint[]> {
		const data: RunwayDataPoint[] = [];
		const startDate = new Date(2026, 0, 1);

		for (let i = 0; i < 24; i++) {
			const date = new Date(startDate);
			date.setMonth(date.getMonth() + i);

			data.push({
				date,
				cashBalance: randomAmount(500000, 5000000),
				burnRate: randomAmount(50000, 200000),
				runwayMonths: randomAmount(6, 36),
				fundingEvents:
				Math.random() > 0.8
				? [
					{
						date,
						amount: randomAmount(1000000, 5000000),
						name: `Series ${randomElement(['A', 'B', 'C'])} Funding`,
					},
				]
				: [],
			});
		}

		return data;
	},

	async getRiskFactors(): Promise<RiskFactor[]> {
		const risks: RiskFactor[] = [
			{ id: '1', name: 'Market Volatility', likelihood: 4, impact: 5, velocity: 3 },
			{ id: '2', name: 'Customer Churn', likelihood: 3, impact: 4, velocity: 4 },
			{ id: '3', name: 'Supply Chain Disruption', likelihood: 2, impact: 5, velocity: 2 },
			{ id: '4', name: 'Regulatory Changes', likelihood: 3, impact: 3, velocity: 2 },
			{ id: '5', name: 'Technology Failure', likelihood: 2, impact: 4, velocity: 5 },
			{ id: '6', name: 'Competitor Action', likelihood: 4, impact: 3, velocity: 4 },
			{ id: '7', name: 'Economic Downturn', likelihood: 3, impact: 5, velocity: 2 },
			{ id: '8', name: 'Talent Retention', likelihood: 4, impact: 3, velocity: 3 },
		];

		return risks.map((r) => ({
			...r,
			mitigation: `Mitigation strategy for ${r.name}`,
		}));
	},

	async getLiquidityData(): Promise<LiquidityEvent[]> {
		const data: LiquidityEvent[] = [];
		const startDate = new Date(2026, 0, 1);

		for (let i = 0; i < 12; i++) {
			const date = new Date(startDate);
			date.setMonth(date.getMonth() + i);

			const cashIn = randomAmount(100000, 500000);
			const cashOut = randomAmount(80000, 450000);

			data.push({
				date,
				cashIn,
				cashOut,
				netFlow: cashIn - cashOut,
				balance: randomAmount(1000000, 5000000),
				criticalAccounts: [
					{
						name: 'Operating Account',
						balance: randomAmount(100000, 500000),
						minThreshold: 100000,
					},
					{
						name: 'Reserve Account',
						balance: randomAmount(500000, 2000000),
						minThreshold: 500000,
					},
				],
			});
		}

		return data;
	},

	async getConfidenceData(): Promise<ConfidenceDataPoint[]> {
		const data: ConfidenceDataPoint[] = [];
		const startDate = new Date(2026, 0, 1);

		for (let i = 0; i < 12; i++) {
			const date = new Date(startDate);
			date.setMonth(date.getMonth() + i);

			const projectedAmount = randomAmount(100000, 1000000);
			const confidenceLevel = randomAmount(0.6, 0.95);
			const variance = projectedAmount * (1 - confidenceLevel);

			data.push({
				date,
				lowerBound: projectedAmount - variance,
				upperBound: projectedAmount + variance,
				projectedAmount,
				confidenceLevel,
				scenario: randomElement(['BEST_CASE', 'BASE_CASE', 'WORST_CASE']),
				contributingFactors: [
					{
						factor: 'Market Conditions',
						impact: randomAmount(-0.5, 0.5),
						confidence: randomAmount(0.6, 0.9),
					},
					{
						factor: 'Sales Pipeline',
						impact: randomAmount(-0.3, 0.7),
						confidence: randomAmount(0.7, 0.95),
					},
					{
						factor: 'Economic Indicators',
						impact: randomAmount(-0.4, 0.4),
						confidence: randomAmount(0.5, 0.8),
					},
				],
			});
		}

		return data;
	},

	async getScenarioPlans(): Promise<Scenario[]> {
		return [
			{
				name: 'Base Scenario',
				probability: 0.6,
				expectedValue: 5000000,
				nodes: [
					{
						id: '1',
						type: 'input',
						position: { x: 100, y: 100 },
						data: { label: 'Start', amount: 0, impact: 'neutral' },
					},
					{
						id: '2',
						type: 'default',
						position: { x: 300, y: 100 },
						data: { label: 'Growth Phase', amount: 2000000, impact: 'positive' },
					},
					{
						id: '3',
						type: 'output',
						position: { x: 500, y: 100 },
						data: { label: 'End', amount: 5000000, impact: 'positive' },
					},
				],
				edges: [
					{ id: '1', source: '1', target: '2', label: 'Q1-Q2' },
					{ id: '2', source: '2', target: '3', label: 'Q3-Q4' },
				],
			},
			{
				name: 'Optimistic Scenario',
				probability: 0.25,
				expectedValue: 8000000,
				nodes: [
					{
						id: '1',
						type: 'input',
						position: { x: 100, y: 100 },
						data: { label: 'Start', amount: 0, impact: 'neutral' },
					},
					{
						id: '2',
						type: 'default',
						position: { x: 300, y: 100 },
						data: { label: 'Rapid Growth', amount: 4000000, impact: 'positive' },
					},
					{
						id: '3',
						type: 'output',
						position: { x: 500, y: 100 },
						data: { label: 'End', amount: 8000000, impact: 'positive' },
					},
				],
				edges: [
					{ id: '1', source: '1', target: '2', label: 'Q1-Q2' },
					{ id: '2', source: '2', target: '3', label: 'Q3-Q4' },
				],
			},
			{
				name: 'Conservative Scenario',
				probability: 0.15,
				expectedValue: 3000000,
				nodes: [
					{
						id: '1',
						type: 'input',
						position: { x: 100, y: 100 },
						data: { label: 'Start', amount: 0, impact: 'neutral' },
					},
					{
						id: '2',
						type: 'default',
						position: { x: 300, y: 100 },
						data: { label: 'Slow Growth', amount: 1000000, impact: 'neutral' },
					},
					{
						id: '3',
						type: 'output',
						position: { x: 500, y: 100 },
						data: { label: 'End', amount: 3000000, impact: 'positive' },
					},
				],
				edges: [
					{ id: '1', source: '1', target: '2', label: 'Q1-Q2' },
					{ id: '2', source: '2', target: '3', label: 'Q3-Q4' },
				],
			},
		];
	},

	async getDepartments(): Promise<Department[]> {
  return [
    {
      id: 1,
      name: 'Engineering',
      headcount: 45,
      currentEfficiency: 87,
      currentBudget: 2500000,
      fiscalYear: 2026,
      latitude: 35.6762, // Tokyo, Japan
      longitude: 139.6503,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 2,
      name: 'Marketing',
      headcount: 22,
      currentEfficiency: 82,
      currentBudget: 1200000,
      fiscalYear: 2026,
      latitude: 55.7558, // Moscow, Russia
      longitude: 37.6173,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 3,
      name: 'Sales',
      headcount: 35,
      currentEfficiency: 91,
      currentBudget: 1800000,
      fiscalYear: 2026,
      latitude: -34.6037, // Buenos Aires, Argentina
      longitude: -58.3816,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 4,
      name: 'Operations',
      headcount: 28,
      currentEfficiency: 79,
      currentBudget: 950000,
      fiscalYear: 2027,
      latitude: 50.0755, // Prague, Czech Republic
      longitude: 14.4378,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 5,
      name: 'Finance',
      headcount: 15,
      currentEfficiency: 94,
      currentBudget: 750000,
      fiscalYear: 2025,
      latitude: 41.0082, // Istanbul, Turkey
      longitude: 28.9784,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 6,
      name: 'Customer Support',
      headcount: 32,
      currentEfficiency: 88,
      currentBudget: 1100000,
      fiscalYear: 2026,
      latitude: -26.2041, // Johannesburg, South Africa
      longitude: 28.0473,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 7,
      name: 'Business Development',
      headcount: 18,
      currentEfficiency: 85,
      currentBudget: 1350000,
      fiscalYear: 2026,
      latitude: 24.7136, // Riyadh, Saudi Arabia
      longitude: 46.6753,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 8,
      name: 'Product Management',
      headcount: 24,
      currentEfficiency: 92,
      currentBudget: 1650000,
      fiscalYear: 2026,
      latitude: 41.9973, // Skopje, North Macedonia
      longitude: 21.4280,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 9,
      name: 'Legal',
      headcount: 12,
      currentEfficiency: 96,
      currentBudget: 850000,
      fiscalYear: 2026,
      latitude: 44.7866, // Belgrade, Serbia
      longitude: 20.4489,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 10,
      name: 'Research & Development',
      headcount: 38,
      currentEfficiency: 89,
      currentBudget: 2100000,
      fiscalYear: 2026,
      latitude: 51.5074, // London, United Kingdom
      longitude: -0.1278,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 11,
      name: 'Executive Leadership',
      headcount: 8,
      currentEfficiency: 98,
      currentBudget: 3200000,
      fiscalYear: 2026,
      latitude: 40.7128, // New York, USA
      longitude: -74.0060,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
},

	async getDepartmentPerformance(departmentId: number): Promise<DepartmentPerformance[]> {
		const performance: DepartmentPerformance[] = [];
		const startDate = new Date(2026, 0, 1);

		for (let i = 0; i < 12; i++) {
			const date = new Date(startDate);
			date.setMonth(date.getMonth() + i);

			performance.push({
				id: randomId(),
				departmentId,
				recordedDate: formatDate(date),
				spend: randomAmount(50000, 200000),
				revenue: randomAmount(100000, 500000),
				efficiency: randomAmount(70, 95),
				isCurrent: i === 11,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			});
		}

		return performance;
	},

	async getProfitLossStatements(): Promise<ProfitLossStatement[]> {
		const statements: ProfitLossStatement[] = [];
		const startDate = new Date(2026, 0, 1);

		for (let i = 0; i < 8; i++) {
			const date = new Date(startDate);
			date.setMonth(date.getMonth() + i * 3);
			const quarter = Math.floor(i / 3) + 1;
			const year = date.getFullYear();

			const revenue = randomAmount(1000000, 5000000);
			const cogs = revenue * randomAmount(0.3, 0.5);
			const operatingExpenses = revenue * randomAmount(0.2, 0.4);
			const grossProfit = revenue - cogs;
			const netIncome = grossProfit - operatingExpenses;
			const marginPercentage = (netIncome / revenue) * 100;

			statements.push({
				id: i + 1,
				departmentId: randomElement([1, 2, 3, 4, 5]),
				periodName: `Q${quarter}-${year}`,
				periodStart: formatDate(date),
				periodEnd: formatDate(new Date(date.getFullYear(), date.getMonth() + 3, 0)),
				revenue: revenue.toString(),
				cogs: cogs.toString(),
				grossProfit: grossProfit.toString(),
				operatingExpenses: operatingExpenses.toString(),
				netIncome: netIncome.toString(),
				marginPercentage: marginPercentage.toFixed(2),
				isForecast: i >= 6,
				version: 1,
				createdAt: new Date().toISOString(),
				lineItems: [
					{
						id: { statementId: i + 1 },
						category: { id: 1, name: 'Product Revenue' },
						amount: (revenue * 0.7).toString(),
					},
					{
						id: { statementId: i + 1 },
						category: { id: 2, name: 'Service Revenue' },
						amount: (revenue * 0.3).toString(),
					},
					{
						id: { statementId: i + 1 },
						category: { id: 3, name: 'Salaries' },
						amount: (operatingExpenses * 0.5).toString(),
					},
					{
						id: { statementId: i + 1 },
						category: { id: 4, name: 'Marketing' },
						amount: (operatingExpenses * 0.2).toString(),
					},
					{
						id: { statementId: i + 1 },
						category: { id: 5, name: 'R&D' },
						amount: (operatingExpenses * 0.3).toString(),
					},
				] as PLLineItem[],
			});
		}

		return statements;
	},

	async getClients(): Promise<Client[]> {
		return [
			{ id: 1, name: 'Acme Corp', creditRating: 'A', paymentTerms: 30, createdAt: new Date().toISOString() },
			{ id: 2, name: 'TechStart Inc', creditRating: 'B', paymentTerms: 45, createdAt: new Date().toISOString() },
			{ id: 3, name: 'Global Industries', creditRating: 'A+', paymentTerms: 30, createdAt: new Date().toISOString() },
			{ id: 4, name: 'Small Biz LLC', creditRating: 'C', paymentTerms: 60, createdAt: new Date().toISOString() },
			{ id: 5, name: 'Enterprise Co', creditRating: 'AA', paymentTerms: 30, createdAt: new Date().toISOString() },
		];
	},

	async getReceivables(): Promise<AccountsReceivable[]> {
		const clients = await this.getClients();
		const receivables: AccountsReceivable[] = [];

		for (let i = 1; i <= 30; i++) {
			const client = randomElement(clients);
			const issuedDate = randomDate(new Date(2026, 0, 1), new Date());
			const dueDate = new Date(issuedDate);
			dueDate.setDate(dueDate.getDate() + client.paymentTerms);
			const daysLate = Math.max(0, Math.floor((new Date().getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));

			receivables.push({
				id: i,
				client,
				invoiceNumber: `INV-${String(i).padStart(5, '0')}`,
				amount: randomAmount(1000, 100000),
				issuedDate: formatDate(issuedDate),
				dueDate: formatDate(dueDate),
				daysLate: daysLate > 0 ? daysLate : null,
				status: daysLate > 90 ? 'DISPUTED' : daysLate > 30 ? 'PENDING' : 'PAID',
				collectionStage: daysLate > 90 ? 'COLLECTIONS' : daysLate > 60 ? 'FINAL_NOTICE' : daysLate > 30 ? 'REMINDER_SENT' : 'PENDING',
				probabilityOfPayment: Math.max(0.3, 1 - daysLate / 200),
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			});
		}

		return receivables;
	},

	async getVendors(): Promise<Vendor[]> {
		return [
			{ id: 1, legalName: 'Cloud Services Inc', industryClassification: 'Technology', marketRateReference: '$150/hr (Industry Avg)', createdAt: new Date().toISOString() },
			{ id: 2, legalName: 'Office Supplies Co', industryClassification: 'Retail', marketRateReference: '$45/unit (Market Rate)', createdAt: new Date().toISOString() },
			{ id: 3, legalName: 'Consulting Partners', industryClassification: 'Professional Services', marketRateReference: '$200/hr (Senior)', createdAt: new Date().toISOString() },
			{ id: 4, legalName: 'Manufacturing Ltd', industryClassification: 'Manufacturing', marketRateReference: '$85/hr (Standard)', createdAt: new Date().toISOString() },
			{ id: 5, legalName: 'Logistics Corp', industryClassification: 'Transportation', marketRateReference: '$2.50/mile (Fuel Adj)', createdAt: new Date().toISOString() },
		];
	},

	async getVendorContracts(): Promise<VendorContract[]> {
		const vendors = await this.getVendors();
		const contracts: VendorContract[] = [];

		vendors.forEach((vendor) => {
			const now = new Date();
			const endDate = new Date(now);
			if (Math.random() < 0.7) {
				endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 30) + 1);
			} else {
				endDate.setFullYear(endDate.getFullYear() + 2);
			}

			contracts.push({
				id: randomId(),
				vendorId: vendor.id,
				serviceDescription: `${vendor.legalName} - Annual Contract ${now.getFullYear()}`,
				contractedRate: randomAmount(5000, 50000).toFixed(2),
				contractStart: formatDate(now),
				contractEnd: formatDate(endDate),
				autoRenew: Math.random() > 0.5,
				isActive: true,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			});
		});

		return contracts;
	},

	async getVendorInvoices(): Promise<VendorInvoice[]> {
		const contracts = await this.getVendorContracts();
		return contracts.map((contract) => ({
			id: randomId(),
			contractId: contract.id,
			invoiceDate: formatDate(new Date()),
			amount: contract.contractedRate,
			paymentStatus: randomElement(['PENDING', 'PARTIAL', 'PAID']),
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		}));
	},

	async getVarianceAnalysis(): Promise<VendorContractVarianceResponse[]> {
		const contracts = await this.getVendorContracts();
		return contracts.map((contract) => ({
			contractId: contract.id,
			vendorId: contract.vendorId,
			serviceDescription: contract.serviceDescription,
			contractedRate: contract.contractedRate,
			marketRate: (parseFloat(contract.contractedRate) * randomAmount(0.9, 1.1)).toString(),
			varianceAmount: (parseFloat(contract.contractedRate) * randomAmount(-0.1, 0.1)).toString(),
			variancePercentage: randomAmount(-10, 10),
		}));
	},

	async getGLAccounts(): Promise<Account[]> {
		return [
			{ id: 1, code: '1000', name: 'Cash', type: 'ASSET', normalBalance: 'DEBIT', isActive: true, parentCode: null, createdAt: new Date().toISOString() },
			{ id: 2, code: '1100', name: 'Accounts Receivable', type: 'ASSET', normalBalance: 'DEBIT', isActive: true, parentCode: null, createdAt: new Date().toISOString() },
			{ id: 3, code: '2000', name: 'Accounts Payable', type: 'LIABILITY', normalBalance: 'CREDIT', isActive: true, parentCode: null, createdAt: new Date().toISOString() },
			{ id: 4, code: '3000', name: 'Equity', type: 'EQUITY', normalBalance: 'CREDIT', isActive: true, parentCode: null, createdAt: new Date().toISOString() },
			{ id: 5, code: '4000', name: 'Revenue', type: 'REVENUE', normalBalance: 'CREDIT', isActive: true, parentCode: null, createdAt: new Date().toISOString() },
			{ id: 6, code: '5000', name: 'Expenses', type: 'EXPENSE', normalBalance: 'DEBIT', isActive: true, parentCode: null, createdAt: new Date().toISOString() },
		];
	},

	async getJournalEntries(): Promise<JournalEntry[]> {
		const accounts = await this.getGLAccounts();
		const entries: JournalEntry[] = [];

		for (let i = 1; i <= 50; i++) {
			const account = randomElement(accounts);
			const date = randomDate(new Date(2026, 0, 1), new Date());
			const amount = randomAmount(100, 50000);

			entries.push({
				id: i,
				journalEntryNumber: `JE-${String(i).padStart(5, '0')}`,
				date: formatDate(date),
				accountCode: account.code,
				description: `Transaction ${i}`,
				debitAmount: account.normalBalance === 'DEBIT' ? amount : 0,
				creditAmount: account.normalBalance === 'CREDIT' ? amount : 0,
				referenceNumber: `REF-${i}`,
				status: randomElement(['DRAFT', 'POSTED', 'POSTED', 'POSTED']),
				reconciled: Math.random() > 0.3,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			});
		}

		return entries;
	},

	async getBankAccounts(): Promise<BankAccount[]> {
  const now = new Date().toISOString();
  return [
    {
      id: 1,
      name: 'Operating Account',
      bankName: 'First National Bank',
      accountNumber: '****1234',
      routingNumber: '021000021',
      accountType: 'CHECKING',
      currency: 'USD',
      openingBalance: 1000000,
      currentBalance: randomAmount(500000, 2000000),
      lastReconciledDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 2,
      name: 'Reserve Account',
      bankName: 'First National Bank',
      accountNumber: '****5678',
      routingNumber: '021000021',
      accountType: 'SAVINGS',
      currency: 'USD',
      openingBalance: 2000000,
      currentBalance: randomAmount(1500000, 5000000),
      lastReconciledDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ];
},

	async getBankStatements(bankAccountId?: number): Promise<BankStatement[]> {
  const now = new Date().toISOString();
  const statements: BankStatement[] = [];

  const bankAccounts = await this.getBankAccounts();

  bankAccounts.forEach(account => {
    for (let i = 0; i < 3; i++) {
      const statementDate = new Date();
      statementDate.setMonth(statementDate.getMonth() - i);

      const periodStart = new Date(statementDate);
      periodStart.setDate(1);

      const periodEnd = new Date(statementDate);
      periodEnd.setMonth(periodEnd.getMonth() + 1);
      periodEnd.setDate(0);

      const openingBalance = account.openingBalance + (i * 5000);
      const closingBalance = openingBalance + (Math.random() * 10000 - 5000);

      statements.push({
        id: statements.length + 1,
        bankAccountId: account.id,
        statementDate: statementDate.toISOString().split('T')[0],
        periodStart: periodStart.toISOString().split('T')[0],
        periodEnd: periodEnd.toISOString().split('T')[0],
        openingBalance,
        closingBalance,
        totalDeposits: closingBalance > openingBalance ? closingBalance - openingBalance : 0,
        totalWithdrawals: closingBalance < openingBalance ? openingBalance - closingBalance : 0,
        status: i === 0 ? 'PENDING' : i === 1 ? 'PROCESSING' : 'RECONCILED',
        importedBy: 'system',
        createdAt: now,
        updatedAt: now
      });
    }
  });

  if (bankAccountId) {
    return statements.filter(s => s.bankAccountId === bankAccountId);
  }

  return statements;
},

	async getAccountingPeriods(): Promise<AccountingPeriod[]> {
  const now = new Date().toISOString();

  return [
    {
      id: 1,
      periodName: 'Q1-2026',
      periodStart: '2026-01-01',
      periodEnd: '2026-03-31',
      periodType: 'QUARTERLY',
      status: 'CLOSED',
      closedBy: 'John Smith',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 2,
      periodName: 'Q2-2026',
      periodStart: '2026-04-01',
      periodEnd: '2026-06-30',
      periodType: 'QUARTERLY',
      status: 'CLOSED',
      closedBy: 'Jane Doe',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 3,
      periodName: 'Q3-2026',
      periodStart: '2026-07-01',
      periodEnd: '2026-09-30',
      periodType: 'QUARTERLY',
      status: 'LOCKED',
      closedBy: 'John Smith',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 4,
      periodName: 'Q4-2026',
      periodStart: '2026-10-01',
      periodEnd: '2026-12-31',
      periodType: 'QUARTERLY',
      status: 'OPEN',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 5,
      periodName: 'Q1-2027',
      periodStart: '2027-01-01',
      periodEnd: '2027-03-31',
      periodType: 'QUARTERLY',
      status: 'OPEN',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 6,
      periodName: 'Q2-2027',
      periodStart: '2027-04-01',
      periodEnd: '2027-06-30',
      periodType: 'QUARTERLY',
      status: 'OPEN',
      createdAt: now,
      updatedAt: now
    },
  ];
},

	async getTrialBalance(): Promise<TrialBalanceItem[]> {
		const accounts = await this.getGLAccounts();
		return accounts.map((account) => ({
			accountCode: account.code,
			accountName: account.name,
			type: account.type,
			totalDebits: randomAmount(100000, 1000000),
			totalCredits: randomAmount(100000, 1000000),
			balance: randomAmount(-500000, 500000),
		}));
	},

};
