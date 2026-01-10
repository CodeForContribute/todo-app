import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTodos, useAttendance, useUserData } from '../../hooks/useFirestore';
import { processQuery } from '../../utils/chatProcessor';

export function ChatBot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "Hi! I'm your workspace assistant. Ask me about your leaves, attendance, tasks, salary, or anything else!",
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch all data for the chatbot
  const [todos] = useTodos();
  const [attendance] = useAttendance();
  const [leaveData] = useUserData('leaves', { quotas: {}, leaves: [] });
  const [pomodoroStats] = useUserData('pomodoroStats', {});
  const [expenseData] = useUserData('expenses', { expenses: [] });
  const [tripData] = useUserData('trips', { items: [] });
  const [salaryData] = useUserData('salaryStructure', null);
  const [gamificationData] = useUserData('gamification', { xp: 0, streaks: {}, achievements: { earned: [] } });
  const [notesData] = useUserData('notes', { items: [] });
  const [linksData] = useUserData('quickLinks', { items: [] });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate typing delay
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500));

    // Process the query
    const response = processQuery(input, {
      todos,
      attendance,
      leaveData,
      pomodoroStats,
      expenseData,
      tripData,
      salaryData,
      gamificationData,
      notesData,
      linksData,
      userName: user?.displayName,
    });

    const botMessage = {
      id: Date.now() + 1,
      type: 'bot',
      text: response,
    };

    setMessages((prev) => [...prev, botMessage]);
    setIsTyping(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Format message text with markdown-like syntax
  const formatMessage = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br />');
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed bottom-20 lg:bottom-6 right-6 z-50
          w-14 h-14 rounded-full shadow-lg
          flex items-center justify-center
          transition-all duration-300 transform
          ${isOpen
            ? 'bg-slate-700 rotate-0'
            : 'bg-gradient-to-r from-violet-500 to-purple-600 hover:scale-110'
          }
        `}
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-36 lg:bottom-24 right-6 z-50 w-80 sm:w-96 animate-scale-in">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold">Workspace Assistant</h3>
                  <p className="text-white/70 text-xs">Ask me anything about your data</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-3 bg-slate-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`
                      max-w-[85%] px-4 py-2 rounded-2xl text-sm
                      ${message.type === 'user'
                        ? 'bg-violet-500 text-white rounded-br-md'
                        : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-bl-md'
                      }
                    `}
                    dangerouslySetInnerHTML={{ __html: formatMessage(message.text) }}
                  />
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white text-slate-500 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-slate-100">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-200 bg-white">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about leaves, tasks..."
                  className="flex-1 px-4 py-2 bg-slate-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="p-2 rounded-full bg-violet-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-violet-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-1 mt-2">
                {['Summary', 'Leave balance', 'My salary', 'Help'].map((action) => (
                  <button
                    key={action}
                    onClick={() => {
                      setInput(action);
                      setTimeout(handleSend, 100);
                    }}
                    className="px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
