import { useState, useMemo } from 'react';

// Tax slabs for FY 2024-25 (AY 2025-26)
const NEW_REGIME_SLABS = [
  { min: 0, max: 300000, rate: 0 },
  { min: 300000, max: 700000, rate: 5 },
  { min: 700000, max: 1000000, rate: 10 },
  { min: 1000000, max: 1200000, rate: 15 },
  { min: 1200000, max: 1500000, rate: 20 },
  { min: 1500000, max: Infinity, rate: 30 },
];

const OLD_REGIME_SLABS = [
  { min: 0, max: 250000, rate: 0 },
  { min: 250000, max: 500000, rate: 5 },
  { min: 500000, max: 1000000, rate: 20 },
  { min: 1000000, max: Infinity, rate: 30 },
];

const STANDARD_DEDUCTION_NEW = 75000;
const STANDARD_DEDUCTION_OLD = 50000;

export function TaxCalculator() {
  const [grossIncome, setGrossIncome] = useState('');
  const [regime, setRegime] = useState('new');
  const [showDeductions, setShowDeductions] = useState(false);

  // Old regime deductions
  const [deductions, setDeductions] = useState({
    section80C: '', // Max 1.5L (PPF, ELSS, LIC, etc.)
    section80D: '', // Health insurance (25k/50k/75k/100k)
    section80CCD: '', // NPS additional (50k)
    hra: '', // HRA exemption
    lta: '', // Leave Travel Allowance
    homeLoanInterest: '', // Max 2L for self-occupied
    otherDeductions: '',
  });

  const parseAmount = (value) => {
    const num = parseFloat(value.replace(/,/g, ''));
    return isNaN(num) ? 0 : num;
  };

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

  const calculateTax = (taxableIncome, slabs) => {
    let tax = 0;
    let breakdown = [];

    for (const slab of slabs) {
      if (taxableIncome > slab.min) {
        const taxableInSlab = Math.min(taxableIncome, slab.max) - slab.min;
        const taxInSlab = (taxableInSlab * slab.rate) / 100;
        tax += taxInSlab;

        if (taxInSlab > 0) {
          breakdown.push({
            range: slab.max === Infinity
              ? `Above ${formatCurrency(slab.min)}`
              : `${formatCurrency(slab.min)} - ${formatCurrency(slab.max)}`,
            rate: slab.rate,
            amount: taxableInSlab,
            tax: taxInSlab,
          });
        }
      }
    }

    return { tax, breakdown };
  };

  const calculations = useMemo(() => {
    const income = parseAmount(grossIncome);
    if (income <= 0) return null;

    // Calculate total deductions for old regime
    const totalOldDeductions =
      Math.min(parseAmount(deductions.section80C), 150000) +
      Math.min(parseAmount(deductions.section80D), 100000) +
      Math.min(parseAmount(deductions.section80CCD), 50000) +
      parseAmount(deductions.hra) +
      parseAmount(deductions.lta) +
      Math.min(parseAmount(deductions.homeLoanInterest), 200000) +
      parseAmount(deductions.otherDeductions) +
      STANDARD_DEDUCTION_OLD;

    // New regime calculation
    const taxableIncomeNew = Math.max(0, income - STANDARD_DEDUCTION_NEW);
    const newRegimeResult = calculateTax(taxableIncomeNew, NEW_REGIME_SLABS);

    // Rebate u/s 87A for new regime (if taxable income <= 7L)
    let newTax = newRegimeResult.tax;
    let newRebate = 0;
    if (taxableIncomeNew <= 700000) {
      newRebate = Math.min(newTax, 25000);
      newTax = Math.max(0, newTax - newRebate);
    }

    // Old regime calculation
    const taxableIncomeOld = Math.max(0, income - totalOldDeductions);
    const oldRegimeResult = calculateTax(taxableIncomeOld, OLD_REGIME_SLABS);

    // Rebate u/s 87A for old regime (if taxable income <= 5L)
    let oldTax = oldRegimeResult.tax;
    let oldRebate = 0;
    if (taxableIncomeOld <= 500000) {
      oldRebate = Math.min(oldTax, 12500);
      oldTax = Math.max(0, oldTax - oldRebate);
    }

    // Add cess (4%)
    const newCess = newTax * 0.04;
    const oldCess = oldTax * 0.04;
    const newTotalTax = newTax + newCess;
    const oldTotalTax = oldTax + oldCess;

    return {
      grossIncome: income,
      new: {
        standardDeduction: STANDARD_DEDUCTION_NEW,
        taxableIncome: taxableIncomeNew,
        breakdown: newRegimeResult.breakdown,
        taxBeforeRebate: newRegimeResult.tax,
        rebate: newRebate,
        taxAfterRebate: newTax,
        cess: newCess,
        totalTax: newTotalTax,
        takeHome: income - newTotalTax,
        effectiveRate: (newTotalTax / income) * 100,
      },
      old: {
        totalDeductions: totalOldDeductions,
        taxableIncome: taxableIncomeOld,
        breakdown: oldRegimeResult.breakdown,
        taxBeforeRebate: oldRegimeResult.tax,
        rebate: oldRebate,
        taxAfterRebate: oldTax,
        cess: oldCess,
        totalTax: oldTotalTax,
        takeHome: income - oldTotalTax,
        effectiveRate: (oldTotalTax / income) * 100,
      },
      savings: Math.abs(newTotalTax - oldTotalTax),
      betterRegime: newTotalTax <= oldTotalTax ? 'new' : 'old',
    };
  }, [grossIncome, deductions]);

  const currentRegimeData = calculations ? calculations[regime] : null;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header Card */}
      <div className="glass rounded-3xl shadow-xl shadow-purple-900/10 overflow-hidden mb-6">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">India Tax Calculator</h2>
              <p className="text-slate-400 text-sm">FY 2024-25 (AY 2025-26)</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Income Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Annual Gross Income
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
              <input
                type="text"
                value={grossIncome}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setGrossIncome(value ? formatNumber(parseInt(value)) : '');
                }}
                placeholder="Enter your annual income"
                className="w-full pl-10 pr-4 py-4 text-xl rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
              />
            </div>
          </div>

          {/* Regime Toggle */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tax Regime
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setRegime('new')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  regime === 'new'
                    ? 'border-violet-500 bg-violet-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-800">New Regime</span>
                  {calculations?.betterRegime === 'new' && (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 text-left">Lower rates, no deductions except standard deduction of ₹75,000</p>
              </button>
              <button
                onClick={() => setRegime('old')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  regime === 'old'
                    ? 'border-violet-500 bg-violet-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-800">Old Regime</span>
                  {calculations?.betterRegime === 'old' && (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 text-left">Higher rates, but allows deductions (80C, 80D, HRA, etc.)</p>
              </button>
            </div>
          </div>

          {/* Deductions for Old Regime */}
          {regime === 'old' && (
            <div className="mb-6">
              <button
                onClick={() => setShowDeductions(!showDeductions)}
                className="flex items-center gap-2 text-violet-600 font-medium text-sm hover:text-violet-700 transition-colors"
              >
                <svg
                  className={`w-4 h-4 transition-transform ${showDeductions ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                {showDeductions ? 'Hide' : 'Add'} Deductions
              </button>

              {showDeductions && (
                <div className="mt-4 p-4 bg-slate-50 rounded-xl space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Section 80C (Max ₹1.5L)
                        <span className="text-slate-400 ml-1">PPF, ELSS, LIC, etc.</span>
                      </label>
                      <input
                        type="text"
                        value={deductions.section80C}
                        onChange={(e) => setDeductions({ ...deductions, section80C: e.target.value.replace(/[^0-9]/g, '') })}
                        placeholder="0"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Section 80D (Max ₹1L)
                        <span className="text-slate-400 ml-1">Health Insurance</span>
                      </label>
                      <input
                        type="text"
                        value={deductions.section80D}
                        onChange={(e) => setDeductions({ ...deductions, section80D: e.target.value.replace(/[^0-9]/g, '') })}
                        placeholder="0"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Section 80CCD(1B) (Max ₹50K)
                        <span className="text-slate-400 ml-1">NPS</span>
                      </label>
                      <input
                        type="text"
                        value={deductions.section80CCD}
                        onChange={(e) => setDeductions({ ...deductions, section80CCD: e.target.value.replace(/[^0-9]/g, '') })}
                        placeholder="0"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        HRA Exemption
                      </label>
                      <input
                        type="text"
                        value={deductions.hra}
                        onChange={(e) => setDeductions({ ...deductions, hra: e.target.value.replace(/[^0-9]/g, '') })}
                        placeholder="0"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Home Loan Interest (Max ₹2L)
                      </label>
                      <input
                        type="text"
                        value={deductions.homeLoanInterest}
                        onChange={(e) => setDeductions({ ...deductions, homeLoanInterest: e.target.value.replace(/[^0-9]/g, '') })}
                        placeholder="0"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Other Deductions
                      </label>
                      <input
                        type="text"
                        value={deductions.otherDeductions}
                        onChange={(e) => setDeductions({ ...deductions, otherDeductions: e.target.value.replace(/[^0-9]/g, '') })}
                        placeholder="0"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {calculations && currentRegimeData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="glass rounded-2xl p-4 shadow-lg shadow-purple-900/10">
              <div className="text-xs text-slate-400 font-medium mb-1">Gross Income</div>
              <div className="text-xl font-bold text-slate-800">{formatCurrency(calculations.grossIncome)}</div>
            </div>
            <div className="glass rounded-2xl p-4 shadow-lg shadow-purple-900/10">
              <div className="text-xs text-slate-400 font-medium mb-1">Taxable Income</div>
              <div className="text-xl font-bold text-slate-800">{formatCurrency(currentRegimeData.taxableIncome)}</div>
            </div>
            <div className="glass rounded-2xl p-4 shadow-lg shadow-purple-900/10">
              <div className="text-xs text-slate-400 font-medium mb-1">Total Tax</div>
              <div className="text-xl font-bold text-rose-600">{formatCurrency(currentRegimeData.totalTax)}</div>
            </div>
            <div className="glass rounded-2xl p-4 shadow-lg shadow-purple-900/10">
              <div className="text-xs text-slate-400 font-medium mb-1">Take Home</div>
              <div className="text-xl font-bold text-emerald-600">{formatCurrency(currentRegimeData.takeHome)}</div>
            </div>
          </div>

          {/* Comparison Banner */}
          {calculations.savings > 0 && (
            <div className={`mb-6 p-4 rounded-2xl ${
              calculations.betterRegime === regime
                ? 'bg-emerald-50 border border-emerald-200'
                : 'bg-amber-50 border border-amber-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  calculations.betterRegime === regime
                    ? 'bg-emerald-100'
                    : 'bg-amber-100'
                }`}>
                  {calculations.betterRegime === regime ? (
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <div>
                  {calculations.betterRegime === regime ? (
                    <p className="text-emerald-800 font-medium">
                      Great choice! You save {formatCurrency(calculations.savings)} with the {regime === 'new' ? 'New' : 'Old'} Regime
                    </p>
                  ) : (
                    <p className="text-amber-800 font-medium">
                      Switch to {calculations.betterRegime === 'new' ? 'New' : 'Old'} Regime to save {formatCurrency(calculations.savings)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Detailed Breakdown */}
          <div className="glass rounded-3xl shadow-xl shadow-purple-900/10 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Tax Breakdown - {regime === 'new' ? 'New' : 'Old'} Regime</h3>
            </div>

            <div className="p-6">
              {/* Income & Deductions */}
              <div className="mb-6 pb-6 border-b border-slate-100">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Gross Income</span>
                    <span className="font-medium text-slate-800">{formatCurrency(calculations.grossIncome)}</span>
                  </div>
                  <div className="flex justify-between text-rose-600">
                    <span>Less: {regime === 'new' ? 'Standard Deduction' : 'Total Deductions'}</span>
                    <span className="font-medium">- {formatCurrency(regime === 'new' ? STANDARD_DEDUCTION_NEW : currentRegimeData.totalDeductions)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-dashed border-slate-200">
                    <span className="font-medium text-slate-800">Taxable Income</span>
                    <span className="font-bold text-slate-800">{formatCurrency(currentRegimeData.taxableIncome)}</span>
                  </div>
                </div>
              </div>

              {/* Tax Slabs */}
              <div className="mb-6 pb-6 border-b border-slate-100">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Tax Slab Breakdown</h4>
                <div className="space-y-2">
                  {currentRegimeData.breakdown.length > 0 ? (
                    currentRegimeData.breakdown.map((slab, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div>
                          <span className="text-sm text-slate-600">{slab.range}</span>
                          <span className="ml-2 px-2 py-0.5 bg-violet-100 text-violet-700 text-xs font-medium rounded-full">
                            {slab.rate}%
                          </span>
                        </div>
                        <span className="font-medium text-slate-800">{formatCurrency(slab.tax)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700 text-sm">
                      No tax applicable - income within exemption limit
                    </div>
                  )}
                </div>
              </div>

              {/* Tax Calculation */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Tax (before rebate)</span>
                  <span className="font-medium text-slate-800">{formatCurrency(currentRegimeData.taxBeforeRebate)}</span>
                </div>
                {currentRegimeData.rebate > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Less: Rebate u/s 87A</span>
                    <span className="font-medium">- {formatCurrency(currentRegimeData.rebate)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-600">Tax (after rebate)</span>
                  <span className="font-medium text-slate-800">{formatCurrency(currentRegimeData.taxAfterRebate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Add: Health & Education Cess (4%)</span>
                  <span className="font-medium text-slate-800">{formatCurrency(currentRegimeData.cess)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t-2 border-slate-200">
                  <span className="font-bold text-slate-800">Total Tax Payable</span>
                  <span className="font-bold text-xl text-rose-600">{formatCurrency(currentRegimeData.totalTax)}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-slate-600">Effective Tax Rate</span>
                  <span className="font-medium text-slate-800">{currentRegimeData.effectiveRate.toFixed(2)}%</span>
                </div>
              </div>

              {/* Monthly Breakdown */}
              <div className="mt-6 p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Monthly Breakdown</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-slate-800">{formatCurrency(calculations.grossIncome / 12)}</div>
                    <div className="text-xs text-slate-500">Monthly Income</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-rose-600">{formatCurrency(currentRegimeData.totalTax / 12)}</div>
                    <div className="text-xs text-slate-500">Monthly Tax</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-emerald-600">{formatCurrency(currentRegimeData.takeHome / 12)}</div>
                    <div className="text-xs text-slate-500">Monthly Take Home</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tax Slabs Reference */}
          <div className="mt-6 glass rounded-2xl p-6 shadow-lg shadow-purple-900/10">
            <h4 className="text-sm font-semibold text-slate-700 mb-4">Tax Slabs Reference (FY 2024-25)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-xs font-medium text-violet-600 uppercase tracking-wide mb-2">New Regime</h5>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">₹0 - ₹3L</span><span className="text-slate-700">0%</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">₹3L - ₹7L</span><span className="text-slate-700">5%</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">₹7L - ₹10L</span><span className="text-slate-700">10%</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">₹10L - ₹12L</span><span className="text-slate-700">15%</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">₹12L - ₹15L</span><span className="text-slate-700">20%</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Above ₹15L</span><span className="text-slate-700">30%</span></div>
                </div>
              </div>
              <div>
                <h5 className="text-xs font-medium text-amber-600 uppercase tracking-wide mb-2">Old Regime</h5>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">₹0 - ₹2.5L</span><span className="text-slate-700">0%</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">₹2.5L - ₹5L</span><span className="text-slate-700">5%</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">₹5L - ₹10L</span><span className="text-slate-700">20%</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Above ₹10L</span><span className="text-slate-700">30%</span></div>
                </div>
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-400">
              * Additional 4% Health & Education Cess on tax amount. Rebate u/s 87A applicable for income up to ₹7L (New) / ₹5L (Old).
            </p>
          </div>
        </>
      )}

      {/* Empty State */}
      {!calculations && (
        <div className="glass rounded-3xl p-12 text-center shadow-xl shadow-purple-900/10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-1">Enter Your Income</h3>
          <p className="text-slate-400 text-sm">Input your annual gross income to calculate tax</p>
        </div>
      )}
    </div>
  );
}
