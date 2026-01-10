import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';

export function MeetingsWidget({ onNavigate }) {
  const { calendarAccessToken, requestCalendarAccess } = useAuth();
  const [nextMeeting, setNextMeeting] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (calendarAccessToken) {
      fetchNextMeeting();
    }
  }, [calendarAccessToken]);

  const fetchNextMeeting = async () => {
    if (!calendarAccessToken) return;

    setLoading(true);
    try {
      const now = new Date().toISOString();
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
        `timeMin=${now}&maxResults=1&singleEvents=true&orderBy=startTime`,
        {
          headers: {
            Authorization: `Bearer ${calendarAccessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.items?.length > 0) {
          setNextMeeting(data.items[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching meeting:', error);
    }
    setLoading(false);
  };

  const formatMeetingTime = (meeting) => {
    if (!meeting?.start) return '';
    const startTime = meeting.start.dateTime || meeting.start.date;
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = start - now;
    const diffMins = Math.round(diffMs / 60000);

    if (diffMins < 0) return 'Now';
    if (diffMins < 60) return `in ${diffMins} min`;
    if (diffMins < 1440) return `in ${Math.round(diffMins / 60)}h`;
    return start.toLocaleDateString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' });
  };

  return (
    <button
      onClick={() => onNavigate('meetings')}
      className="glass rounded-2xl p-5 shadow-xl shadow-purple-900/10 text-left transition-all duration-200 hover:scale-[1.01] hover:shadow-2xl group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl bg-purple-100">
          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        {nextMeeting && (
          <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs font-medium rounded-full">
            {formatMeetingTime(nextMeeting)}
          </span>
        )}
      </div>

      <h3 className="font-semibold text-slate-800 mb-1">Upcoming Meeting</h3>

      {!calendarAccessToken ? (
        <div className="space-y-3">
          <p className="text-sm text-slate-500">Connect your calendar to see meetings</p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              requestCalendarAccess();
            }}
            className="text-sm text-violet-600 font-medium hover:text-violet-700"
          >
            Connect Calendar →
          </button>
        </div>
      ) : loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : nextMeeting ? (
        <div>
          <p className="text-sm text-slate-700 font-medium truncate mb-1">
            {nextMeeting.summary || 'Untitled meeting'}
          </p>
          <p className="text-xs text-slate-400">
            {new Date(nextMeeting.start?.dateTime || nextMeeting.start?.date).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            })}
            {nextMeeting.location && ` • ${nextMeeting.location}`}
          </p>
        </div>
      ) : (
        <p className="text-sm text-slate-500">No upcoming meetings</p>
      )}

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-400">View all meetings</span>
        <svg className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}
