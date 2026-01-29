import { useState, useEffect } from 'react';
import { getCurrentIP, getCurrentLocation } from '../utils/networkUtils';

export function OfficeSettings({ config, onSave, onClose }) {
  const [activeMethod, setActiveMethod] = useState(config?.method || 'ip');
  const [ips, setIps] = useState(config?.ips?.join('\n') || '');
  const [location, setLocation] = useState(config?.location || null);
  const [radius, setRadius] = useState(config?.location?.radius || 100);
  const [currentIP, setCurrentIP] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch current IP on mount
    getCurrentIP().then(ip => setCurrentIP(ip));
  }, []);

  const detectCurrentIP = async () => {
    setLoading(true);
    setError(null);
    try {
      const ip = await getCurrentIP();
      if (ip) {
        setCurrentIP(ip);
        // Add to IPs if not already there
        const currentIps = ips.split('\n').filter(i => i.trim());
        if (!currentIps.includes(ip)) {
          setIps(prev => prev ? `${prev}\n${ip}` : ip);
        }
      } else {
        setError('Could not detect IP address');
      }
    } catch {
      setError('Failed to detect IP');
    }
    setLoading(false);
  };

  const detectCurrentLocation = async () => {
    setLoading(true);
    setError(null);
    try {
      const loc = await getCurrentLocation();
      setLocation({
        latitude: loc.latitude,
        longitude: loc.longitude,
        radius: radius
      });
    } catch {
      setError('Failed to get location. Please enable location permissions.');
    }
    setLoading(false);
  };

  const handleSave = () => {
    const newConfig = {
      method: activeMethod,
      enabled: true,
      ips: activeMethod === 'ip' ? ips.split('\n').map(ip => ip.trim()).filter(Boolean) : [],
      location: activeMethod === 'location' ? { ...location, radius } : null
    };
    onSave(newConfig);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white p-6 pb-4 border-b border-slate-100 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Office Network Settings</h2>
                <p className="text-sm text-slate-400">Configure auto check-in detection</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Detection Method Tabs */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl mb-6">
            <button
              onClick={() => setActiveMethod('ip')}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeMethod === 'ip'
                  ? 'bg-white text-slate-800 shadow-md'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              IP Address
            </button>
            <button
              onClick={() => setActiveMethod('location')}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeMethod === 'location'
                  ? 'bg-white text-slate-800 shadow-md'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Location
            </button>
          </div>

          {/* IP Address Method */}
          {activeMethod === 'ip' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">How it works</p>
                    <p className="text-blue-600">When you open this app, it checks your public IP address. If it matches your office IP, you'll be automatically checked in.</p>
                  </div>
                </div>
              </div>

              {/* Current IP Display */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-slate-500 mb-1">Your Current IP</div>
                    <div className="text-lg font-semibold text-slate-800 font-mono">
                      {currentIP || 'Detecting...'}
                    </div>
                  </div>
                  <button
                    onClick={detectCurrentIP}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-violet-600 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Detecting...' : 'Add This IP'}
                  </button>
                </div>
              </div>

              {/* IP List */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Office IP Addresses
                </label>
                <textarea
                  value={ips}
                  onChange={(e) => setIps(e.target.value)}
                  placeholder="Enter IP addresses (one per line)&#10;e.g., 203.0.113.50&#10;or range: 192.168.1.*"
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-slate-700 placeholder-slate-400 font-mono text-sm focus:outline-none focus:border-violet-300 focus:bg-white transition-all duration-200 resize-none"
                  rows={4}
                />
                <p className="mt-2 text-xs text-slate-400">
                  Supports exact IPs, wildcards (192.168.1.*), and CIDR notation (10.0.0.0/24)
                </p>
              </div>
            </div>
          )}

          {/* Location Method */}
          {activeMethod === 'location' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">How it works</p>
                    <p className="text-blue-600">Uses your device's GPS to check if you're within the office radius. Requires location permission.</p>
                  </div>
                </div>
              </div>

              {/* Current Location */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-slate-500 mb-1">Office Location</div>
                    {location ? (
                      <div className="text-sm font-medium text-slate-800 font-mono">
                        {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                      </div>
                    ) : (
                      <div className="text-sm text-slate-400">Not set</div>
                    )}
                  </div>
                  <button
                    onClick={detectCurrentLocation}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-violet-600 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Getting Location...' : 'Use Current Location'}
                  </button>
                </div>
              </div>

              {/* Radius */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Detection Radius: {radius}m
                </label>
                <input
                  type="range"
                  min="50"
                  max="500"
                  step="50"
                  value={radius}
                  onChange={(e) => setRadius(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-500"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>50m</span>
                  <span>500m</span>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-100 text-sm text-rose-600">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-5 py-3 rounded-xl font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-5 py-3 rounded-xl font-medium bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md shadow-purple-500/25 hover:shadow-lg hover:shadow-purple-500/30 transition-all"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
