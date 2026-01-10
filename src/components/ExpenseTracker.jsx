import { useState, useMemo } from 'react';
import { useUserData } from '../hooks/useFirestore';

const EXPENSE_CATEGORIES = {
  travel: { label: 'Travel', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-blue-100 text-blue-700' },
  food: { label: 'Food', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z', color: 'bg-orange-100 text-orange-700' },
  accommodation: { label: 'Accommodation', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', color: 'bg-purple-100 text-purple-700' },
  transport: { label: 'Transport', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4', color: 'bg-emerald-100 text-emerald-700' },
  officeSupplies: { label: 'Office Supplies', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'bg-slate-100 text-slate-700' },
  communication: { label: 'Communication', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z', color: 'bg-cyan-100 text-cyan-700' },
  other: { label: 'Other', icon: 'M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z', color: 'bg-rose-100 text-rose-700' },
};

const RECEIPT_STATUS = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700' },
  received: { label: 'Received', color: 'bg-emerald-100 text-emerald-700' },
  notRequired: { label: 'Not Required', color: 'bg-slate-100 text-slate-500' },
};

export function ExpenseTracker() {
  const [expenseData, setExpenseData, loading] = useUserData('expenses', {
    expenses: [],
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [activeView, setActiveView] = useState('list');
  const [showExportModal, setShowExportModal] = useState(false);

  // Filter states
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: 'travel',
    description: '',
    receiptStatus: 'pending',
  });

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      amount: '',
      category: 'travel',
      description: '',
      receiptStatus: 'pending',
    });
    setEditingExpense(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (expense) => {
    setFormData({
      date: expense.date,
      amount: expense.amount.toString(),
      category: expense.category,
      description: expense.description,
      receiptStatus: expense.receiptStatus,
    });
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0 || !formData.date) return;

    const expenseEntry = {
      date: formData.date,
      amount: parseFloat(formData.amount),
      category: formData.category,
      description: formData.description.trim(),
      receiptStatus: formData.receiptStatus,
    };

    if (editingExpense) {
      const updatedExpenses = (expenseData.expenses || []).map((expense) =>
        expense.id === editingExpense.id
          ? { ...expense, ...expenseEntry, updatedAt: new Date().toISOString() }
          : expense
      );
      setExpenseData({ ...expenseData, expenses: updatedExpenses });
    } else {
      const newExpense = {
        id: Date.now().toString(),
        ...expenseEntry,
        createdAt: new Date().toISOString(),
      };
      setExpenseData({
        ...expenseData,
        expenses: [...(expenseData.expenses || []), newExpense],
      });
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = (expenseId) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    const updatedExpenses = (expenseData.expenses || []).filter(
      (expense) => expense.id !== expenseId
    );
    setExpenseData({ ...expenseData, expenses: updatedExpenses });
  };

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    let filtered = [...(expenseData?.expenses || [])];

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter((expense) => expense.category === filterCategory);
    }

    // Filter by date range
    if (filterDateFrom) {
      filtered = filtered.filter((expense) => expense.date >= filterDateFrom);
    }
    if (filterDateTo) {
      filtered = filtered.filter((expense) => expense.date <= filterDateTo);
    }

    // Sort by date descending
    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [expenseData?.expenses, filterCategory, filterDateFrom, filterDateTo]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const expenses = filteredExpenses;
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Category breakdown
    const byCategory = {};
    Object.keys(EXPENSE_CATEGORIES).forEach((cat) => {
      byCategory[cat] = expenses
        .filter((exp) => exp.category === cat)
        .reduce((sum, exp) => sum + exp.amount, 0);
    });

    // Monthly totals
    const byMonth = {};
    expenses.forEach((exp) => {
      const monthKey = exp.date.substring(0, 7); // YYYY-MM
      byMonth[monthKey] = (byMonth[monthKey] || 0) + exp.amount;
    });

    // Receipt status breakdown
    const byReceiptStatus = {
      pending: expenses.filter((exp) => exp.receiptStatus === 'pending').length,
      received: expenses.filter((exp) => exp.receiptStatus === 'received').length,
      notRequired: expenses.filter((exp) => exp.receiptStatus === 'notRequired').length,
    };

    return { total, byCategory, byMonth, byReceiptStatus, count: expenses.length };
  }, [filteredExpenses]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatMonthYear = (monthKey) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
  };

  const clearFilters = () => {
    setFilterCategory('all');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  const hasActiveFilters = filterCategory !== 'all' || filterDateFrom || filterDateTo;

  // Export functionality
  const generateExportData = () => {
    const exportExpenses = filteredExpenses.map((exp, index) => ({
      'S.No': index + 1,
      Date: formatDate(exp.date),
      Category: EXPENSE_CATEGORIES[exp.category]?.label || exp.category,
      Description: exp.description || '-',
      'Amount (INR)': exp.amount,
      'Receipt Status': RECEIPT_STATUS[exp.receiptStatus]?.label || exp.receiptStatus,
    }));

    return {
      expenses: exportExpenses,
      summary: {
        'Total Amount': formatCurrency(summaryStats.total),
        'Total Expenses': summaryStats.count,
        'Receipts Pending': summaryStats.byReceiptStatus.pending,
        'Receipts Received': summaryStats.byReceiptStatus.received,
        'Date Range': filterDateFrom || filterDateTo
          ? `${filterDateFrom || 'Start'} to ${filterDateTo || 'End'}`
          : 'All Time',
      },
    };
  };

  const exportToCSV = () => {
    const data = generateExportData();
    const headers = Object.keys(data.expenses[0] || {});
    const csvContent = [
      'EXPENSE REPORT',
      `Generated on: ${new Date().toLocaleDateString('en-IN')}`,
      `Total Amount: ${data.summary['Total Amount']}`,
      `Total Expenses: ${data.summary['Total Expenses']}`,
      '',
      headers.join(','),
      ...data.expenses.map((row) =>
        headers.map((header) => `"${row[header]}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `expense_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    setShowExportModal(false);
  };

  const copyToClipboard = () => {
    const data = generateExportData();
    const textContent = [
      '=== EXPENSE REPORT ===',
      `Generated: ${new Date().toLocaleDateString('en-IN')}`,
      `Total: ${data.summary['Total Amount']}`,
      `Expenses: ${data.summary['Total Expenses']}`,
      '',
      '--- DETAILS ---',
      ...data.expenses.map(
        (exp) =>
          `${exp['S.No']}. ${exp.Date} | ${exp.Category} | ${exp.Description} | INR ${exp['Amount (INR)']} | ${exp['Receipt Status']}`
      ),
    ].join('\n');

    navigator.clipboard.writeText(textContent);
    alert('Expense report copied to clipboard!');
    setShowExportModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <svg className="w-8 h-8 mx-auto mb-3 text-white/60 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-white/60">Loading expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Summary Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="glass rounded-2xl p-4 shadow-xl shadow-purple-900/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-xl font-bold text-slate-800">{formatCurrency(summaryStats.total)}</div>
              <div className="text-xs text-slate-400 font-medium">Total Expenses</div>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-4 shadow-xl shadow-purple-900/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{summaryStats.count}</div>
              <div className="text-xs text-slate-400 font-medium">Expenses</div>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-4 shadow-xl shadow-purple-900/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{summaryStats.byReceiptStatus.pending}</div>
              <div className="text-xs text-slate-400 font-medium">Receipts Pending</div>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-4 shadow-xl shadow-purple-900/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{summaryStats.byReceiptStatus.received}</div>
              <div className="text-xs text-slate-400 font-medium">Receipts Ready</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="glass rounded-3xl shadow-xl shadow-purple-900/10 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Expense Tracker</h2>
              <p className="text-slate-400 text-sm mt-1">Track and manage your expenses for reimbursement</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowExportModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-slate-600 font-medium bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                disabled={filteredExpenses.length === 0}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Export
              </button>
              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 hover:-translate-y-0.5 transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Expense
              </button>
            </div>
          </div>

          {/* View Toggle */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setActiveView('list')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeView === 'list'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                List View
              </button>
              <button
                onClick={() => setActiveView('summary')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeView === 'summary'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Summary
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
              >
                <option value="all">All Categories</option>
                {Object.entries(EXPENSE_CATEGORIES).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                placeholder="From"
                className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
              />
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                placeholder="To"
                className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
              />
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeView === 'list' ? (
            <>
              {filteredExpenses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-1">
                    {hasActiveFilters ? 'No matching expenses' : 'No expenses yet'}
                  </h3>
                  <p className="text-slate-400 text-sm mb-4">
                    {hasActiveFilters
                      ? 'Try adjusting your filters'
                      : 'Start tracking your expenses by adding one'}
                  </p>
                  {!hasActiveFilters && (
                    <button
                      onClick={openAddModal}
                      className="inline-flex items-center gap-2 px-4 py-2 text-violet-600 font-medium hover:bg-violet-50 rounded-xl transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add your first expense
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredExpenses.map((expense) => {
                    const category = EXPENSE_CATEGORIES[expense.category] || EXPENSE_CATEGORIES.other;
                    const receiptStatus = RECEIPT_STATUS[expense.receiptStatus] || RECEIPT_STATUS.pending;

                    return (
                      <div
                        key={expense.id}
                        className="flex items-start gap-4 p-4 border border-slate-100 rounded-xl hover:border-slate-200 transition-colors group"
                      >
                        {/* Category Icon */}
                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${category.color} flex items-center justify-center`}>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={category.icon} />
                          </svg>
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-slate-800">{formatCurrency(expense.amount)}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${category.color}`}>
                              {category.label}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${receiptStatus.color}`}>
                              {receiptStatus.label}
                            </span>
                          </div>
                          {expense.description && (
                            <p className="text-sm text-slate-600 mb-1 truncate">{expense.description}</p>
                          )}
                          <p className="text-xs text-slate-400">{formatDate(expense.date)}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditModal(expense)}
                            className="p-2 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(expense.id)}
                            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            /* Summary View */
            <div className="space-y-6">
              {/* Category Breakdown */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Expenses by Category</h3>
                <div className="space-y-3">
                  {Object.entries(EXPENSE_CATEGORIES).map(([key, category]) => {
                    const amount = summaryStats.byCategory[key] || 0;
                    const percentage = summaryStats.total > 0 ? (amount / summaryStats.total) * 100 : 0;

                    if (amount === 0) return null;

                    return (
                      <div key={key} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                        <div className={`w-10 h-10 rounded-xl ${category.color} flex items-center justify-center flex-shrink-0`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={category.icon} />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-slate-700">{category.label}</span>
                            <span className="text-sm font-semibold text-slate-800">{formatCurrency(amount)}</span>
                          </div>
                          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-600 transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm text-slate-400 w-12 text-right">{percentage.toFixed(0)}%</span>
                      </div>
                    );
                  })}
                  {Object.values(summaryStats.byCategory).every((v) => v === 0) && (
                    <div className="text-center py-8 text-slate-400 text-sm">
                      No expense data to display
                    </div>
                  )}
                </div>
              </div>

              {/* Monthly Breakdown */}
              {Object.keys(summaryStats.byMonth).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Monthly Totals</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {Object.entries(summaryStats.byMonth)
                      .sort(([a], [b]) => b.localeCompare(a))
                      .slice(0, 8)
                      .map(([month, amount]) => (
                        <div key={month} className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl">
                          <div className="text-xs font-medium text-violet-500 mb-1">{formatMonthYear(month)}</div>
                          <div className="text-lg font-bold text-violet-700">{formatCurrency(amount)}</div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Receipt Status Summary */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Receipt Status</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-amber-50 rounded-xl text-center">
                    <div className="text-2xl font-bold text-amber-600">{summaryStats.byReceiptStatus.pending}</div>
                    <div className="text-xs text-amber-500 font-medium">Pending</div>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-xl text-center">
                    <div className="text-2xl font-bold text-emerald-600">{summaryStats.byReceiptStatus.received}</div>
                    <div className="text-xs text-emerald-500 font-medium">Received</div>
                  </div>
                  <div className="p-4 bg-slate-100 rounded-xl text-center">
                    <div className="text-2xl font-bold text-slate-600">{summaryStats.byReceiptStatus.notRequired}</div>
                    <div className="text-xs text-slate-500 font-medium">Not Required</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setIsModalOpen(false);
              resetForm();
            }}
          />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">
                {editingExpense ? 'Edit Expense' : 'Add Expense'}
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                {editingExpense ? 'Update the expense details' : 'Enter the expense details'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount (INR) *</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category *</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(EXPENSE_CATEGORIES).map(([key, category]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: key })}
                      className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium transition-all ${
                        formData.category === key
                          ? category.color + ' ring-2 ring-offset-1 ring-current'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={category.icon} />
                      </svg>
                      <span>{category.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter expense details..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Receipt Status</label>
                <div className="flex gap-2">
                  {Object.entries(RECEIPT_STATUS).map(([key, status]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFormData({ ...formData, receiptStatus: key })}
                      className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        formData.receiptStatus === key
                          ? status.color + ' ring-2 ring-offset-1 ring-current'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-3 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 transition-all"
                >
                  {editingExpense ? 'Update' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowExportModal(false)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl animate-scale-in">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">Export Expenses</h3>
              <p className="text-sm text-slate-400 mt-1">
                Export {filteredExpenses.length} expense(s) totaling {formatCurrency(summaryStats.total)}
              </p>
            </div>

            <div className="p-6 space-y-3">
              <button
                onClick={exportToCSV}
                className="w-full flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:border-violet-200 hover:bg-violet-50 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-slate-800">Download CSV</div>
                  <div className="text-xs text-slate-400">Excel-compatible spreadsheet</div>
                </div>
              </button>

              <button
                onClick={copyToClipboard}
                className="w-full flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:border-violet-200 hover:bg-violet-50 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-slate-800">Copy to Clipboard</div>
                  <div className="text-xs text-slate-400">Plain text format</div>
                </div>
              </button>
            </div>

            <div className="p-6 border-t border-slate-100">
              <button
                onClick={() => setShowExportModal(false)}
                className="w-full px-4 py-3 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
