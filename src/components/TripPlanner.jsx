import { useState } from 'react';
import { useUserData } from '../hooks/useFirestore';

const TRIP_STATUSES = {
  planning: { label: 'Planning', color: 'bg-amber-100 text-amber-700', icon: '📋' },
  booked: { label: 'Booked', color: 'bg-blue-100 text-blue-700', icon: '✈️' },
  ongoing: { label: 'Ongoing', color: 'bg-emerald-100 text-emerald-700', icon: '🌍' },
  completed: { label: 'Completed', color: 'bg-slate-100 text-slate-600', icon: '✅' },
  cancelled: { label: 'Cancelled', color: 'bg-rose-100 text-rose-600', icon: '❌' },
};

const TRIP_PURPOSES = [
  'Business Meeting',
  'Conference',
  'Client Visit',
  'Training',
  'Team Offsite',
  'Personal',
  'Other',
];

export function TripPlanner() {
  const [trips, setTrips, loading] = useUserData('trips', { items: [] });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [activeView, setActiveView] = useState('upcoming');
  const [expandedTrip, setExpandedTrip] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    startDate: '',
    endDate: '',
    purpose: 'Business Meeting',
    budget: '',
    notes: '',
    status: 'planning',
  });

  const resetForm = () => {
    setFormData({
      title: '',
      destination: '',
      startDate: '',
      endDate: '',
      purpose: 'Business Meeting',
      budget: '',
      notes: '',
      status: 'planning',
    });
    setEditingTrip(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (trip) => {
    setFormData({
      title: trip.title,
      destination: trip.destination,
      startDate: trip.startDate,
      endDate: trip.endDate,
      purpose: trip.purpose,
      budget: trip.budget || '',
      notes: trip.notes || '',
      status: trip.status,
    });
    setEditingTrip(trip);
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.destination.trim() || !formData.startDate) return;

    const tripData = {
      ...formData,
      title: formData.title.trim(),
      destination: formData.destination.trim(),
      budget: formData.budget ? parseFloat(formData.budget) : null,
      notes: formData.notes.trim(),
    };

    if (editingTrip) {
      // Update existing trip
      const updatedItems = trips.items.map((trip) =>
        trip.id === editingTrip.id ? { ...trip, ...tripData, updatedAt: new Date().toISOString() } : trip
      );
      setTrips({ items: updatedItems });
    } else {
      // Add new trip
      const newTrip = {
        id: Date.now().toString(),
        ...tripData,
        createdAt: new Date().toISOString(),
      };
      setTrips({ items: [...(trips?.items || []), newTrip] });
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = (tripId) => {
    if (!confirm('Are you sure you want to delete this trip?')) return;
    const updatedItems = trips.items.filter((trip) => trip.id !== tripId);
    setTrips({ items: updatedItems });
    setExpandedTrip(null);
  };

  const updateStatus = (tripId, newStatus) => {
    const updatedItems = trips.items.map((trip) =>
      trip.id === tripId ? { ...trip, status: newStatus, updatedAt: new Date().toISOString() } : trip
    );
    setTrips({ items: updatedItems });
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateRange = (start, end) => {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : null;

    if (!endDate || start === end) {
      return formatDate(start);
    }

    if (startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()) {
      return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.getDate()}, ${endDate.getFullYear()}`;
    }

    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  const getDaysUntil = (dateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tripDate = new Date(dateStr);
    tripDate.setHours(0, 0, 0, 0);
    const diffTime = tripDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTripDuration = (start, end) => {
    if (!end) return '1 day';
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = endDate - startDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  };

  // Filter and sort trips
  const allTrips = trips?.items || [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingTrips = allTrips
    .filter((trip) => {
      const endDate = new Date(trip.endDate || trip.startDate);
      return endDate >= today && trip.status !== 'completed' && trip.status !== 'cancelled';
    })
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  const pastTrips = allTrips
    .filter((trip) => {
      const endDate = new Date(trip.endDate || trip.startDate);
      return endDate < today || trip.status === 'completed' || trip.status === 'cancelled';
    })
    .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

  const displayTrips = activeView === 'upcoming' ? upcomingTrips : pastTrips;

  // Stats
  const totalBudget = upcomingTrips.reduce((sum, trip) => sum + (trip.budget || 0), 0);
  const bookedTrips = upcomingTrips.filter((t) => t.status === 'booked').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <svg className="w-8 h-8 mx-auto mb-3 text-white/60 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-white/60">Loading trips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="glass rounded-2xl p-4 shadow-xl shadow-purple-900/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-lg">
              ✈️
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{upcomingTrips.length}</div>
              <div className="text-xs text-slate-400 font-medium">Upcoming</div>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-4 shadow-xl shadow-purple-900/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-lg">
              📅
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{bookedTrips}</div>
              <div className="text-xs text-slate-400 font-medium">Booked</div>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-4 shadow-xl shadow-purple-900/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center text-white text-lg">
              ✅
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{pastTrips.filter((t) => t.status === 'completed').length}</div>
              <div className="text-xs text-slate-400 font-medium">Completed</div>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-4 shadow-xl shadow-purple-900/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-lg">
              💰
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">
                ${totalBudget.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400 font-medium">Budget</div>
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
              <h2 className="text-2xl font-bold text-slate-800">Trip Planner</h2>
              <p className="text-slate-400 text-sm mt-1">Plan and manage your business trips</p>
            </div>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 hover:-translate-y-0.5 transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Trip
            </button>
          </div>

          {/* View Toggle */}
          <div className="mt-4 inline-flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setActiveView('upcoming')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeView === 'upcoming'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Upcoming ({upcomingTrips.length})
            </button>
            <button
              onClick={() => setActiveView('past')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeView === 'past'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Past ({pastTrips.length})
            </button>
          </div>
        </div>

        {/* Trip List */}
        <div className="p-6">
          {displayTrips.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
                <span className="text-3xl">{activeView === 'upcoming' ? '✈️' : '📁'}</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">
                {activeView === 'upcoming' ? 'No upcoming trips' : 'No past trips'}
              </h3>
              <p className="text-slate-400 text-sm mb-4">
                {activeView === 'upcoming'
                  ? 'Start planning your next adventure!'
                  : 'Your completed trips will appear here'}
              </p>
              {activeView === 'upcoming' && (
                <button
                  onClick={openAddModal}
                  className="inline-flex items-center gap-2 px-4 py-2 text-violet-600 font-medium hover:bg-violet-50 rounded-xl transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Plan a trip
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {displayTrips.map((trip) => {
                const daysUntil = getDaysUntil(trip.startDate);
                const isExpanded = expandedTrip === trip.id;
                const status = TRIP_STATUSES[trip.status];

                return (
                  <div
                    key={trip.id}
                    className={`border rounded-2xl transition-all duration-300 ${
                      isExpanded ? 'border-violet-200 bg-violet-50/30' : 'border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    {/* Trip Summary */}
                    <div
                      onClick={() => setExpandedTrip(isExpanded ? null : trip.id)}
                      className="p-4 cursor-pointer"
                    >
                      <div className="flex items-start gap-4">
                        {/* Date Badge */}
                        <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex flex-col items-center justify-center text-white shadow-lg shadow-violet-500/20">
                          <span className="text-xs font-medium uppercase">
                            {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                          <span className="text-xl font-bold leading-none">
                            {new Date(trip.startDate).getDate()}
                          </span>
                        </div>

                        {/* Trip Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-800 truncate">{trip.title}</h3>
                            <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                              {status.icon} {status.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="truncate">{trip.destination}</span>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                            <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
                            <span>•</span>
                            <span>{getTripDuration(trip.startDate, trip.endDate)}</span>
                            {trip.budget && (
                              <>
                                <span>•</span>
                                <span>${trip.budget.toLocaleString()}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Days Badge */}
                        {activeView === 'upcoming' && daysUntil >= 0 && (
                          <div className="flex-shrink-0 text-right">
                            {daysUntil === 0 ? (
                              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                                Today!
                              </span>
                            ) : daysUntil === 1 ? (
                              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                                Tomorrow
                              </span>
                            ) : daysUntil <= 7 ? (
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                In {daysUntil} days
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">
                                In {daysUntil} days
                              </span>
                            )}
                          </div>
                        )}

                        {/* Expand Icon */}
                        <svg
                          className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-slate-100 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Purpose</label>
                            <p className="text-sm text-slate-700 mt-1">{trip.purpose}</p>
                          </div>
                          {trip.budget && (
                            <div>
                              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Budget</label>
                              <p className="text-sm text-slate-700 mt-1">${trip.budget.toLocaleString()}</p>
                            </div>
                          )}
                        </div>

                        {trip.notes && (
                          <div className="mb-4">
                            <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Notes</label>
                            <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{trip.notes}</p>
                          </div>
                        )}

                        {/* Status Update */}
                        <div className="mb-4">
                          <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 block">
                            Update Status
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(TRIP_STATUSES).map(([key, value]) => (
                              <button
                                key={key}
                                onClick={() => updateStatus(trip.id, key)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                  trip.status === key
                                    ? value.color + ' ring-2 ring-offset-1 ring-current'
                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                }`}
                              >
                                {value.icon} {value.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => openEditModal(trip)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(trip.id)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
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
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">
                {editingTrip ? 'Edit Trip' : 'Plan New Trip'}
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                {editingTrip ? 'Update your trip details' : 'Fill in the details for your trip'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Trip Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Client Meeting in NYC"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Destination *</label>
                <input
                  type="text"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  placeholder="e.g., New York, NY"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    min={formData.startDate}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Purpose</label>
                  <select
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
                  >
                    {TRIP_PURPOSES.map((purpose) => (
                      <option key={purpose} value={purpose}>
                        {purpose}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Budget ($)</label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(TRIP_STATUSES).map(([key, value]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFormData({ ...formData, status: key })}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        formData.status === key
                          ? value.color + ' ring-2 ring-offset-1 ring-current'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {value.icon} {value.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Flight details, hotel info, meeting agenda..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all resize-none"
                />
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
                  {editingTrip ? 'Update Trip' : 'Add Trip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
