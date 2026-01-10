import { useState, useMemo, useEffect } from 'react';
import { useUserData } from '../hooks/useFirestore';

// Professional Tax rates by state (monthly)
const PROFESSIONAL_TAX = {
  karnataka: { name: 'Karnataka', amount: 200, threshold: 15000 },
  maharashtra: { name: 'Maharashtra', amount: 200, threshold: 10000 },
  telangana: { name: 'Telangana', amount: 200, threshold: 15000 },
  andhra_pradesh: { name: 'Andhra Pradesh', amount: 200, threshold: 15000 },
  tamil_nadu: { name: 'Tamil Nadu', amount: 208, threshold: 21000 },
  west_bengal: { name: 'West Bengal', amount: 200, threshold: 10000 },
  gujarat: { name: 'Gujarat', amount: 200, threshold: 12000 },
  kerala: { name: 'Kerala', amount: 208, threshold: 15000 },
  madhya_pradesh: { name: 'Madhya Pradesh', amount: 208, threshold: 15000 },
  rajasthan: { name: 'Rajasthan', amount: 200, threshold: 15000 },
};

// Salary component explanations
const COMPONENT_INFO = {
  basic: {
    title: 'Basic Salary',
    description: 'The core component of your salary, typically 40-50% of CTC. Forms the base for calculating PF, gratuity, and other benefits. Higher basic means more retirement savings but also higher tax.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  hra: {
    title: 'House Rent Allowance (HRA)',
    description: 'Tax-exempt allowance for accommodation. Usually 40-50% of basic (50% for metro cities). Can claim tax exemption if paying rent and not living in own house.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  special: {
    title: 'Special Allowance',
    description: 'Flexible component to balance the salary structure. Fully taxable. Companies adjust this to accommodate other fixed components like PF and gratuity.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  pf_employee: {
    title: 'Employee PF Contribution',
    description: '12% of Basic Salary (max Rs.15,000 base). Your mandatory contribution to the Employee Provident Fund. Deducted from salary but grows with 8%+ interest, tax-free at maturity.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  pf_employer: {
    title: 'Employer PF Contribution',
    description: '12% of Basic Salary (max Rs.15,000 base). Your employer matches your PF contribution. Part of CTC but paid directly to your PF account. Split: 3.67% to EPF, 8.33% to EPS.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  professional_tax: {
    title: 'Professional Tax',
    description: 'State-level tax on profession/employment. Varies by state (Rs.200/month in most states). Deducted by employer and paid to state government. Max Rs.2,500/year.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
      </svg>
    ),
  },
  gratuity: {
    title: 'Gratuity',
    description: 'Retirement benefit paid after 5 years of service. Formula: (Basic x 15 x Years) / 26. Part of CTC, accrues annually. Tax-free up to Rs.20 lakh on receipt.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
      </svg>
    ),
  },
  insurance: {
    title: 'Insurance & Other Benefits',
    description: 'Group health insurance, life insurance, and other employer-provided benefits. Part of CTC but not paid as salary. Provides financial security to you and your family.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
};

export function SalaryCalculator() {
  const [salaryData, setSalaryData, loading] = useUserData('salaryStructure', null);

  const [inputMode, setInputMode] = useState('ctc'); // 'ctc' or 'monthly'
  const [inputValue, setInputValue] = useState('');
  const [basicPercent, setBasicPercent] = useState(40);
  const [hraPercent, setHraPercent] = useState(50); // 50% of basic for metros
  const [state, setState] = useState('karnataka');
  const [insuranceAmount, setInsuranceAmount] = useState('25000'); // Annual insurance
  const [pfOnFullBasic, setPfOnFullBasic] = useState(false); // PF on full basic or capped at 15000
  const [expandedInfo, setExpandedInfo] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Load saved data
  useEffect(() => {
    if (salaryData) {
      if (salaryData.inputMode) setInputMode(salaryData.inputMode);
      if (salaryData.inputValue) setInputValue(salaryData.inputValue);
      if (salaryData.basicPercent) setBasicPercent(salaryData.basicPercent);
      if (salaryData.hraPercent) setHraPercent(salaryData.hraPercent);
      if (salaryData.state) setState(salaryData.state);
      if (salaryData.insuranceAmount) setInsuranceAmount(salaryData.insuranceAmount);
      if (salaryData.pfOnFullBasic !== undefined) setPfOnFullBasic(salaryData.pfOnFullBasic);
    }
  }, [salaryData]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (amount) => {
    return new Intl.NumberFormat('en-IN').format(Math.round(amount));
  };

  const parseAmount = (value) => {
    const num = parseFloat(value.replace(/,/g, ''));
    return isNaN(num) ? 0 : num;
  };

  const calculations = useMemo(() => {
    const input = parseAmount(inputValue);
    if (input <= 0) return null;

    // Convert to annual CTC
    const annualCTC = inputMode === 'ctc' ? input : input * 12;
    const monthlyGross = inputMode === 'ctc' ? input / 12 : input;

    // Calculate components
    const annualBasic = (annualCTC * basicPercent) / 100;
    const monthlyBasic = annualBasic / 12;

    const annualHRA = (annualBasic * hraPercent) / 100;
    const monthlyHRA = annualHRA / 12;

    // PF calculation - 12% of basic, capped at 15000 monthly basic unless opted for full
    const pfBasicMonthly = pfOnFullBasic ? monthlyBasic : Math.min(monthlyBasic, 15000);
    const monthlyEmployeePF = pfBasicMonthly * 0.12;
    const monthlyEmployerPF = pfBasicMonthly * 0.12;
    const annualEmployeePF = monthlyEmployeePF * 12;
    const annualEmployerPF = monthlyEmployerPF * 12;

    // Gratuity - (Basic x 15 x 1) / 26 for 1 year
    const annualGratuity = (annualBasic * 15) / 26;
    const monthlyGratuity = annualGratuity / 12;

    // Insurance (part of CTC)
    const annualInsurance = parseAmount(insuranceAmount);
    const monthlyInsurance = annualInsurance / 12;

    // Professional Tax
    const ptInfo = PROFESSIONAL_TAX[state];
    const monthlyPT = monthlyGross >= ptInfo.threshold ? ptInfo.amount : 0;
    const annualPT = monthlyPT * 12;

    // Special Allowance = CTC - Basic - HRA - Employer PF - Gratuity - Insurance
    const annualSpecial = annualCTC - annualBasic - annualHRA - annualEmployerPF - annualGratuity - annualInsurance;
    const monthlySpecial = annualSpecial / 12;

    // Gross Salary = Basic + HRA + Special Allowance
    const annualGrossSalary = annualBasic + annualHRA + annualSpecial;
    const monthlyGrossSalary = annualGrossSalary / 12;

    // Total Deductions = Employee PF + Professional Tax
    const monthlyTotalDeductions = monthlyEmployeePF + monthlyPT;
    const annualTotalDeductions = monthlyTotalDeductions * 12;

    // Net/In-hand Salary = Gross - Deductions
    const monthlyInHand = monthlyGrossSalary - monthlyTotalDeductions;
    const annualInHand = monthlyInHand * 12;

    // Employer Cost (actual CTC breakdown)
    const annualEmployerCost = annualGrossSalary + annualEmployerPF + annualGratuity + annualInsurance;

    return {
      annual: {
        ctc: annualCTC,
        basic: annualBasic,
        hra: annualHRA,
        special: annualSpecial,
        gross: annualGrossSalary,
        employeePF: annualEmployeePF,
        employerPF: annualEmployerPF,
        totalPF: annualEmployeePF + annualEmployerPF,
        gratuity: annualGratuity,
        insurance: annualInsurance,
        professionalTax: annualPT,
        totalDeductions: annualTotalDeductions,
        inHand: annualInHand,
        employerCost: annualEmployerCost,
      },
      monthly: {
        ctc: annualCTC / 12,
        basic: monthlyBasic,
        hra: monthlyHRA,
        special: monthlySpecial,
        gross: monthlyGrossSalary,
        employeePF: monthlyEmployeePF,
        employerPF: monthlyEmployerPF,
        totalPF: monthlyEmployeePF + monthlyEmployerPF,
        gratuity: monthlyGratuity,
        insurance: monthlyInsurance,
        professionalTax: monthlyPT,
        totalDeductions: monthlyTotalDeductions,
        inHand: monthlyInHand,
        employerCost: annualEmployerCost / 12,
      },
      percentages: {
        basic: (annualBasic / annualCTC) * 100,
        hra: (annualHRA / annualCTC) * 100,
        special: (annualSpecial / annualCTC) * 100,
        employerPF: (annualEmployerPF / annualCTC) * 100,
        gratuity: (annualGratuity / annualCTC) * 100,
        insurance: (annualInsurance / annualCTC) * 100,
        inHandPercent: (annualInHand / annualCTC) * 100,
      },
    };
  }, [inputValue, inputMode, basicPercent, hraPercent, state, insuranceAmount, pfOnFullBasic]);

  const handleSave = () => {
    setSalaryData({
      inputMode,
      inputValue,
      basicPercent,
      hraPercent,
      state,
      insuranceAmount,
      pfOnFullBasic,
      calculations,
      savedAt: new Date().toISOString(),
    });
  };

  const ProgressBar = ({ percentage, color, label }) => (
    <div className="relative">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-slate-600">{label}</span>
        <span className="font-medium text-slate-700">{percentage.toFixed(1)}%</span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );

  const InfoCard = ({ componentKey, amount, isDeduction = false }) => {
    const info = COMPONENT_INFO[componentKey];
    const isExpanded = expandedInfo === componentKey;

    return (
      <div
        className={`p-4 rounded-xl border transition-all cursor-pointer ${
          isExpanded
            ? 'border-violet-300 bg-violet-50/50'
            : 'border-slate-100 hover:border-violet-200 hover:bg-slate-50'
        }`}
        onClick={() => setExpandedInfo(isExpanded ? null : componentKey)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isDeduction
                ? 'bg-rose-100 text-rose-600'
                : 'bg-violet-100 text-violet-600'
            }`}>
              {info.icon}
            </div>
            <div>
              <div className="font-medium text-slate-800">{info.title}</div>
              <div className="text-xs text-slate-400">Click to learn more</div>
            </div>
          </div>
          <div className={`text-lg font-bold ${isDeduction ? 'text-rose-600' : 'text-slate-800'}`}>
            {isDeduction ? '-' : ''}{formatCurrency(amount)}
          </div>
        </div>
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-200 animate-fade-in">
            <p className="text-sm text-slate-600 leading-relaxed">{info.description}</p>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <svg className="w-8 h-8 mx-auto mb-3 text-white/60 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-white/60">Loading salary data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header Card */}
      <div className="glass rounded-3xl shadow-xl shadow-purple-900/10 overflow-hidden mb-6">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Salary Calculator</h2>
                <p className="text-slate-400 text-sm">Indian Salary Breakdown</p>
              </div>
            </div>
            {calculations && (
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 text-violet-700 font-medium rounded-xl hover:bg-violet-200 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {/* Input Mode Toggle */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Input Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setInputMode('ctc')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  inputMode === 'ctc'
                    ? 'border-violet-500 bg-violet-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="font-semibold text-slate-800">Annual CTC</div>
                <p className="text-xs text-slate-500 mt-1">Cost to Company (yearly)</p>
              </button>
              <button
                onClick={() => setInputMode('monthly')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  inputMode === 'monthly'
                    ? 'border-violet-500 bg-violet-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="font-semibold text-slate-800">Monthly Gross</div>
                <p className="text-xs text-slate-500 mt-1">Gross salary per month</p>
              </button>
            </div>
          </div>

          {/* Salary Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {inputMode === 'ctc' ? 'Annual CTC' : 'Monthly Gross Salary'}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setInputValue(value ? formatNumber(parseInt(value)) : '');
                }}
                placeholder={inputMode === 'ctc' ? 'e.g., 12,00,000' : 'e.g., 80,000'}
                className="w-full pl-10 pr-4 py-4 text-xl rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
              />
            </div>
          </div>

          {/* Configuration Section */}
          <div className="mb-6">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-violet-600 font-medium text-sm hover:text-violet-700 transition-colors"
            >
              <svg
                className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
            </button>

            {showAdvanced && (
              <div className="mt-4 p-4 bg-slate-50 rounded-xl space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Basic Salary Percentage */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Basic Salary Percentage
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="30"
                        max="60"
                        value={basicPercent}
                        onChange={(e) => setBasicPercent(parseInt(e.target.value))}
                        className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-500"
                      />
                      <span className="w-12 text-center font-medium text-slate-700">{basicPercent}%</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Typically 40-50% of CTC</p>
                  </div>

                  {/* HRA Percentage */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      HRA (% of Basic)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="30"
                        max="60"
                        value={hraPercent}
                        onChange={(e) => setHraPercent(parseInt(e.target.value))}
                        className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-500"
                      />
                      <span className="w-12 text-center font-medium text-slate-700">{hraPercent}%</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">50% for metro, 40% for others</p>
                  </div>

                  {/* State Selection */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      State (for Professional Tax)
                    </label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 text-sm"
                    >
                      {Object.entries(PROFESSIONAL_TAX).map(([key, value]) => (
                        <option key={key} value={key}>{value.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Insurance Amount */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Annual Insurance (part of CTC)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                      <input
                        type="text"
                        value={insuranceAmount}
                        onChange={(e) => setInsuranceAmount(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="25000"
                        className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* PF Option */}
                <div className="flex items-center gap-3 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pfOnFullBasic}
                      onChange={(e) => setPfOnFullBasic(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                    />
                    <span className="text-sm text-slate-700">Calculate PF on full Basic (not capped at Rs.15,000)</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Section */}
      {calculations && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="glass rounded-2xl p-4 shadow-lg shadow-purple-900/10">
              <div className="text-xs text-slate-400 font-medium mb-1">Annual CTC</div>
              <div className="text-xl font-bold text-slate-800">{formatCurrency(calculations.annual.ctc)}</div>
              <div className="text-xs text-slate-400 mt-1">{formatCurrency(calculations.monthly.ctc)}/month</div>
            </div>
            <div className="glass rounded-2xl p-4 shadow-lg shadow-purple-900/10">
              <div className="text-xs text-slate-400 font-medium mb-1">Gross Salary</div>
              <div className="text-xl font-bold text-slate-800">{formatCurrency(calculations.annual.gross)}</div>
              <div className="text-xs text-slate-400 mt-1">{formatCurrency(calculations.monthly.gross)}/month</div>
            </div>
            <div className="glass rounded-2xl p-4 shadow-lg shadow-purple-900/10">
              <div className="text-xs text-slate-400 font-medium mb-1">Deductions</div>
              <div className="text-xl font-bold text-rose-600">{formatCurrency(calculations.annual.totalDeductions)}</div>
              <div className="text-xs text-slate-400 mt-1">{formatCurrency(calculations.monthly.totalDeductions)}/month</div>
            </div>
            <div className="glass rounded-2xl p-4 shadow-lg shadow-purple-900/10 bg-gradient-to-br from-emerald-50 to-green-50">
              <div className="text-xs text-emerald-600 font-medium mb-1">In-Hand Salary</div>
              <div className="text-xl font-bold text-emerald-700">{formatCurrency(calculations.annual.inHand)}</div>
              <div className="text-xs text-emerald-500 mt-1">{formatCurrency(calculations.monthly.inHand)}/month</div>
            </div>
          </div>

          {/* Visual Breakdown Chart */}
          <div className="glass rounded-3xl shadow-xl shadow-purple-900/10 overflow-hidden mb-6">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">CTC Breakdown</h3>
              <p className="text-sm text-slate-400">Visual representation of your salary components</p>
            </div>

            <div className="p-6">
              {/* Stacked Bar Chart */}
              <div className="mb-6">
                <div className="h-10 rounded-xl overflow-hidden flex">
                  <div
                    className="bg-violet-500 transition-all duration-500"
                    style={{ width: `${calculations.percentages.basic}%` }}
                    title={`Basic: ${calculations.percentages.basic.toFixed(1)}%`}
                  />
                  <div
                    className="bg-purple-500 transition-all duration-500"
                    style={{ width: `${calculations.percentages.hra}%` }}
                    title={`HRA: ${calculations.percentages.hra.toFixed(1)}%`}
                  />
                  <div
                    className="bg-indigo-400 transition-all duration-500"
                    style={{ width: `${calculations.percentages.special}%` }}
                    title={`Special Allowance: ${calculations.percentages.special.toFixed(1)}%`}
                  />
                  <div
                    className="bg-blue-400 transition-all duration-500"
                    style={{ width: `${calculations.percentages.employerPF}%` }}
                    title={`Employer PF: ${calculations.percentages.employerPF.toFixed(1)}%`}
                  />
                  <div
                    className="bg-cyan-400 transition-all duration-500"
                    style={{ width: `${calculations.percentages.gratuity}%` }}
                    title={`Gratuity: ${calculations.percentages.gratuity.toFixed(1)}%`}
                  />
                  <div
                    className="bg-teal-400 transition-all duration-500"
                    style={{ width: `${calculations.percentages.insurance}%` }}
                    title={`Insurance: ${calculations.percentages.insurance.toFixed(1)}%`}
                  />
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 mt-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-violet-500" />
                    <span className="text-slate-600">Basic ({calculations.percentages.basic.toFixed(1)}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-purple-500" />
                    <span className="text-slate-600">HRA ({calculations.percentages.hra.toFixed(1)}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-indigo-400" />
                    <span className="text-slate-600">Special ({calculations.percentages.special.toFixed(1)}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-blue-400" />
                    <span className="text-slate-600">Employer PF ({calculations.percentages.employerPF.toFixed(1)}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-cyan-400" />
                    <span className="text-slate-600">Gratuity ({calculations.percentages.gratuity.toFixed(1)}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-teal-400" />
                    <span className="text-slate-600">Insurance ({calculations.percentages.insurance.toFixed(1)}%)</span>
                  </div>
                </div>
              </div>

              {/* Individual Progress Bars */}
              <div className="space-y-3">
                <ProgressBar
                  percentage={calculations.percentages.basic}
                  color="bg-gradient-to-r from-violet-500 to-violet-400"
                  label="Basic Salary"
                />
                <ProgressBar
                  percentage={calculations.percentages.hra}
                  color="bg-gradient-to-r from-purple-500 to-purple-400"
                  label="HRA"
                />
                <ProgressBar
                  percentage={calculations.percentages.special}
                  color="bg-gradient-to-r from-indigo-400 to-indigo-300"
                  label="Special Allowance"
                />
                <ProgressBar
                  percentage={calculations.percentages.employerPF}
                  color="bg-gradient-to-r from-blue-400 to-blue-300"
                  label="Employer PF"
                />
                <ProgressBar
                  percentage={calculations.percentages.gratuity}
                  color="bg-gradient-to-r from-cyan-400 to-cyan-300"
                  label="Gratuity"
                />
                <ProgressBar
                  percentage={calculations.percentages.insurance}
                  color="bg-gradient-to-r from-teal-400 to-teal-300"
                  label="Insurance"
                />
              </div>
            </div>
          </div>

          {/* Detailed Breakdown - Earnings */}
          <div className="glass rounded-3xl shadow-xl shadow-purple-900/10 overflow-hidden mb-6">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800">Earnings</h3>
              </div>
              <p className="text-sm text-slate-400 mt-1">Click on any component to learn more</p>
            </div>

            <div className="p-6 space-y-3">
              <InfoCard componentKey="basic" amount={calculations.monthly.basic} />
              <InfoCard componentKey="hra" amount={calculations.monthly.hra} />
              <InfoCard componentKey="special" amount={calculations.monthly.special} />

              <div className="pt-3 mt-3 border-t border-slate-200">
                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl">
                  <span className="font-semibold text-emerald-800">Monthly Gross Salary</span>
                  <span className="text-xl font-bold text-emerald-700">{formatCurrency(calculations.monthly.gross)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Breakdown - Deductions */}
          <div className="glass rounded-3xl shadow-xl shadow-purple-900/10 overflow-hidden mb-6">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800">Deductions</h3>
              </div>
              <p className="text-sm text-slate-400 mt-1">Deducted from your gross salary</p>
            </div>

            <div className="p-6 space-y-3">
              <InfoCard componentKey="pf_employee" amount={calculations.monthly.employeePF} isDeduction />
              <InfoCard componentKey="professional_tax" amount={calculations.monthly.professionalTax} isDeduction />

              <div className="pt-3 mt-3 border-t border-slate-200">
                <div className="flex items-center justify-between p-4 bg-rose-50 rounded-xl">
                  <span className="font-semibold text-rose-800">Total Monthly Deductions</span>
                  <span className="text-xl font-bold text-rose-700">-{formatCurrency(calculations.monthly.totalDeductions)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Employer Contributions (Part of CTC) */}
          <div className="glass rounded-3xl shadow-xl shadow-purple-900/10 overflow-hidden mb-6">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800">Employer Contributions</h3>
              </div>
              <p className="text-sm text-slate-400 mt-1">Part of CTC but not paid as salary</p>
            </div>

            <div className="p-6 space-y-3">
              <InfoCard componentKey="pf_employer" amount={calculations.monthly.employerPF} />
              <InfoCard componentKey="gratuity" amount={calculations.monthly.gratuity} />
              <InfoCard componentKey="insurance" amount={calculations.monthly.insurance} />
            </div>
          </div>

          {/* Final In-Hand Calculation */}
          <div className="glass rounded-3xl shadow-xl shadow-purple-900/10 overflow-hidden mb-6 bg-gradient-to-br from-violet-50 to-purple-50">
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">In-Hand Salary Calculation</h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-600">Gross Salary</span>
                  <span className="font-medium text-slate-800">{formatCurrency(calculations.monthly.gross)}</span>
                </div>
                <div className="flex justify-between items-center py-2 text-rose-600">
                  <span>Less: Employee PF</span>
                  <span className="font-medium">- {formatCurrency(calculations.monthly.employeePF)}</span>
                </div>
                <div className="flex justify-between items-center py-2 text-rose-600">
                  <span>Less: Professional Tax</span>
                  <span className="font-medium">- {formatCurrency(calculations.monthly.professionalTax)}</span>
                </div>
                <div className="flex justify-between items-center py-4 border-t-2 border-violet-200">
                  <span className="text-lg font-bold text-slate-800">Monthly In-Hand</span>
                  <span className="text-2xl font-bold text-violet-700">{formatCurrency(calculations.monthly.inHand)}</span>
                </div>
              </div>

              {/* Annual Summary */}
              <div className="mt-6 p-4 bg-white/70 rounded-xl">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-slate-800">{formatCurrency(calculations.annual.inHand)}</div>
                    <div className="text-xs text-slate-500">Annual In-Hand</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-600">{formatCurrency(calculations.annual.totalPF)}</div>
                    <div className="text-xs text-slate-500">Annual PF Savings</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-violet-600">{calculations.percentages.inHandPercent.toFixed(1)}%</div>
                    <div className="text-xs text-slate-500">In-Hand % of CTC</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly vs Annual Comparison */}
          <div className="glass rounded-3xl shadow-xl shadow-purple-900/10 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Monthly vs Annual Comparison</h3>
            </div>

            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-2 font-semibold text-slate-700">Component</th>
                      <th className="text-right py-3 px-2 font-semibold text-slate-700">Monthly</th>
                      <th className="text-right py-3 px-2 font-semibold text-slate-700">Annual</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50">
                      <td className="py-3 px-2 text-slate-600">Basic Salary</td>
                      <td className="py-3 px-2 text-right font-medium">{formatCurrency(calculations.monthly.basic)}</td>
                      <td className="py-3 px-2 text-right font-medium">{formatCurrency(calculations.annual.basic)}</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-3 px-2 text-slate-600">HRA</td>
                      <td className="py-3 px-2 text-right font-medium">{formatCurrency(calculations.monthly.hra)}</td>
                      <td className="py-3 px-2 text-right font-medium">{formatCurrency(calculations.annual.hra)}</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-3 px-2 text-slate-600">Special Allowance</td>
                      <td className="py-3 px-2 text-right font-medium">{formatCurrency(calculations.monthly.special)}</td>
                      <td className="py-3 px-2 text-right font-medium">{formatCurrency(calculations.annual.special)}</td>
                    </tr>
                    <tr className="bg-emerald-50/50">
                      <td className="py-3 px-2 font-semibold text-emerald-700">Gross Salary</td>
                      <td className="py-3 px-2 text-right font-bold text-emerald-700">{formatCurrency(calculations.monthly.gross)}</td>
                      <td className="py-3 px-2 text-right font-bold text-emerald-700">{formatCurrency(calculations.annual.gross)}</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-3 px-2 text-rose-600">Employee PF</td>
                      <td className="py-3 px-2 text-right font-medium text-rose-600">-{formatCurrency(calculations.monthly.employeePF)}</td>
                      <td className="py-3 px-2 text-right font-medium text-rose-600">-{formatCurrency(calculations.annual.employeePF)}</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-3 px-2 text-rose-600">Professional Tax</td>
                      <td className="py-3 px-2 text-right font-medium text-rose-600">-{formatCurrency(calculations.monthly.professionalTax)}</td>
                      <td className="py-3 px-2 text-right font-medium text-rose-600">-{formatCurrency(calculations.annual.professionalTax)}</td>
                    </tr>
                    <tr className="bg-violet-50">
                      <td className="py-3 px-2 font-bold text-violet-800">In-Hand Salary</td>
                      <td className="py-3 px-2 text-right font-bold text-violet-700">{formatCurrency(calculations.monthly.inHand)}</td>
                      <td className="py-3 px-2 text-right font-bold text-violet-700">{formatCurrency(calculations.annual.inHand)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Additional Info */}
              <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-amber-800">Note</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      This calculation does not include Income Tax (TDS), which varies based on your tax regime, deductions, and investments.
                      Use the Tax Calculator to estimate your income tax liability and actual take-home salary after TDS.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {!calculations && (
        <div className="glass rounded-3xl p-12 text-center shadow-xl shadow-purple-900/10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-1">Enter Your Salary</h3>
          <p className="text-slate-400 text-sm">Input your CTC or monthly gross to see the detailed breakdown</p>
        </div>
      )}
    </div>
  );
}
