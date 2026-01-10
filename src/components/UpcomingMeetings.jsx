import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function UpcomingMeetings() {
  const { user, getCalendarAccessToken, requestCalendarAccess } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [needsPermission, setNeedsPermission] = useState(false);

  const fetchMeetings = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const accessToken = await getCalendarAccessToken();

      if (!accessToken) {
        setNeedsPermission(true);
        setLoading(false);
        return;
      }

      // Get meetings for today and next 7 days
      const now = new Date();
      const weekLater = new Date();
      weekLater.setDate(weekLater.getDate() + 7);

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
        `timeMin=${now.toISOString()}&` +
        `timeMax=${weekLater.toISOString()}&` +
        `singleEvents=true&` +
        `orderBy=startTime&` +
        `maxResults=10`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 403) {
          setNeedsPermission(true);
          throw new Error('Calendar access not granted');
        }
        throw new Error('Failed to fetch calendar');
      }

      const data = await response.json();
      setMeetings(data.items || []);
      setNeedsPermission(false);
    } catch (err) {
      console.error('Error fetching meetings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
    // Refresh every 5 minutes
    const interval = setInterval(fetchMeetings, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  const formatTime = (dateTime, date) => {
    if (date) {
      // All-day event
      return 'All day';
    }
    return new Date(dateTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateTime, date) => {
    const eventDate = new Date(dateTime || date);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (eventDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (eventDate.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return eventDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const getEventColor = (event) => {
    // Google Calendar colors
    const colors = {
      '1': 'bg-blue-100 text-blue-700',
      '2': 'bg-green-100 text-green-700',
      '3': 'bg-purple-100 text-purple-700',
      '4': 'bg-rose-100 text-rose-700',
      '5': 'bg-yellow-100 text-yellow-700',
      '6': 'bg-orange-100 text-orange-700',
      '7': 'bg-cyan-100 text-cyan-700',
      '8': 'bg-gray-100 text-gray-700',
      '9': 'bg-indigo-100 text-indigo-700',
      '10': 'bg-emerald-100 text-emerald-700',
      '11': 'bg-red-100 text-red-700',
    };
    return colors[event.colorId] || 'bg-violet-100 text-violet-700';
  };

  const isHappeningNow = (event) => {
    if (!event.start?.dateTime) return false;
    const now = new Date();
    const start = new Date(event.start.dateTime);
    const end = new Date(event.end?.dateTime);
    return now >= start && now <= end;
  };

  const getTimeUntil = (event) => {
    if (!event.start?.dateTime) return null;
    const now = new Date();
    const start = new Date(event.start.dateTime);
    const diffMs = start - now;

    if (diffMs < 0) return null;

    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) {
      return `in ${diffMins} min`;
    } else if (diffMins < 1440) {
      const hours = Math.floor(diffMins / 60);
      return `in ${hours}h`;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="glass rounded-2xl p-5 shadow-xl shadow-purple-900/10 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-16 bg-slate-100 rounded-xl"></div>
          <div className="h-16 bg-slate-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl shadow-xl shadow-purple-900/10 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/25">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="font-semibold text-slate-800">Upcoming Meetings</h3>
        </div>
        <button
          onClick={fetchMeetings}
          className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
          title="Refresh"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-3">
        {needsPermission ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-amber-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m8-10V6a2 2 0 00-2-2H8a2 2 0 00-2 2v1m10 0v1m0-1a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2" />
              </svg>
            </div>
            <p className="text-sm text-slate-600 font-medium mb-1">Calendar Access Required</p>
            <p className="text-xs text-slate-400 mb-3">Grant access to see your meetings</p>
            <button
              onClick={async () => {
                await requestCalendarAccess();
                fetchMeetings();
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl hover:shadow-lg hover:shadow-violet-500/25 transition-all"
            >
              Grant Access
            </button>
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-rose-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm text-slate-500">{error}</p>
            <button
              onClick={fetchMeetings}
              className="mt-2 text-sm text-violet-500 hover:text-violet-600 font-medium"
            >
              Try again
            </button>
          </div>
        ) : meetings.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-slate-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-slate-400">No upcoming meetings</p>
            <p className="text-xs text-slate-300 mt-1">Next 7 days are clear!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {meetings.map((meeting) => {
              const happening = isHappeningNow(meeting);
              const timeUntil = getTimeUntil(meeting);

              return (
                <a
                  key={meeting.id}
                  href={meeting.htmlLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block p-3 rounded-xl transition-all hover:shadow-md ${
                    happening
                      ? 'bg-gradient-to-r from-emerald-50 to-green-50 ring-2 ring-emerald-200'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                      happening ? 'bg-emerald-500 animate-pulse' : 'bg-violet-400'
                    }`} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-slate-800 truncate">
                          {meeting.summary || '(No title)'}
                        </span>
                        {happening && (
                          <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium bg-emerald-500 text-white rounded-full">
                            Now
                          </span>
                        )}
                        {timeUntil && !happening && (
                          <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                            {timeUntil}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className={`px-1.5 py-0.5 rounded ${getEventColor(meeting)}`}>
                          {formatDate(meeting.start?.dateTime, meeting.start?.date)}
                        </span>
                        <span>
                          {formatTime(meeting.start?.dateTime, meeting.start?.date)}
                          {meeting.end?.dateTime && ` - ${formatTime(meeting.end?.dateTime)}`}
                        </span>
                      </div>

                      {meeting.location && (
                        <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-400">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="truncate">{meeting.location}</span>
                        </div>
                      )}

                      {meeting.conferenceData?.entryPoints?.[0] && (
                        <div className="flex items-center gap-1 mt-1.5 text-xs text-blue-500">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span>Join video call</span>
                        </div>
                      )}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
