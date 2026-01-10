import { useState, useEffect } from 'react';

const quotes = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "Your limitation—it's only your imagination.", author: "Unknown" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
  { text: "Great things never come from comfort zones.", author: "Unknown" },
  { text: "Dream it. Wish it. Do it.", author: "Unknown" },
  { text: "Success doesn't just find you. You have to go out and get it.", author: "Unknown" },
  { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown" },
  { text: "Don't stop when you're tired. Stop when you're done.", author: "Unknown" },
  { text: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown" },
  { text: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery" },
  { text: "Little things make big days.", author: "Unknown" },
  { text: "It's going to be hard, but hard does not mean impossible.", author: "Unknown" },
  { text: "Don't wait for opportunity. Create it.", author: "Unknown" },
  { text: "Sometimes we're tested not to show our weaknesses, but to discover our strengths.", author: "Unknown" },
  { text: "The key to success is to focus on goals, not obstacles.", author: "Unknown" },
  { text: "Dream bigger. Do bigger.", author: "Unknown" },
  { text: "Work hard in silence, let your success be the noise.", author: "Frank Ocean" },
  { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "Don't be afraid to give up the good to go for the great.", author: "John D. Rockefeller" },
  { text: "I find that the harder I work, the more luck I seem to have.", author: "Thomas Jefferson" },
  { text: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau" },
  { text: "Opportunities don't happen. You create them.", author: "Chris Grosser" },
  { text: "Don't be distracted by criticism. Remember, the only taste of success some people get is to take a bite out of you.", author: "Zig Ziglar" },
  { text: "I never dreamed about success, I worked for it.", author: "Estée Lauder" },
  { text: "Success is walking from failure to failure with no loss of enthusiasm.", author: "Winston Churchill" },
  { text: "Just when the caterpillar thought the world was ending, he turned into a butterfly.", author: "Proverb" },
  { text: "Successful entrepreneurs are givers and not takers of positive energy.", author: "Unknown" },
  { text: "Whenever you see a successful person, you only see the public glories, never the private sacrifices to reach them.", author: "Vaibhav Shah" },
  { text: "If you are not willing to risk the usual, you will have to settle for the ordinary.", author: "Jim Rohn" },
  { text: "Stop chasing the money and start chasing the passion.", author: "Tony Hsieh" },
  { text: "All progress takes place outside the comfort zone.", author: "Michael John Bobak" },
  { text: "People who succeed have momentum. The more they succeed, the more they want to succeed.", author: "Tony Robbins" },
  { text: "Don't let yesterday take up too much of today.", author: "Will Rogers" },
  { text: "You learn more from failure than from success. Don't let it stop you.", author: "Unknown" },
  { text: "It's not whether you get knocked down, it's whether you get up.", author: "Vince Lombardi" },
  { text: "People often say that motivation doesn't last. Well, neither does bathing. That's why we recommend it daily.", author: "Zig Ziglar" },
  { text: "We generate fears while we sit. We overcome them by action.", author: "Dr. Henry Link" },
  { text: "The ones who are crazy enough to think they can change the world are the ones who do.", author: "Steve Jobs" },
  { text: "Knowing is not enough; we must apply. Wishing is not enough; we must do.", author: "Johann Wolfgang Von Goethe" },
  { text: "We may encounter many defeats but we must not be defeated.", author: "Maya Angelou" },
  { text: "Whether you think you can or think you can't, you're right.", author: "Henry Ford" },
  { text: "Security is mostly a superstition. Life is either a daring adventure or nothing.", author: "Helen Keller" },
  { text: "The man who has confidence in himself gains the confidence of others.", author: "Hasidic Proverb" },
  { text: "Creativity is intelligence having fun.", author: "Albert Einstein" },
  { text: "What you lack in talent can be made up with desire, hustle and giving 110% all the time.", author: "Don Zimmer" },
  { text: "Do what you can with all you have, wherever you are.", author: "Theodore Roosevelt" },
  { text: "Develop an attitude of gratitude. Say thank you to everyone you meet for everything they do for you.", author: "Brian Tracy" },
  { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
  { text: "To see what is right and not do it is a lack of courage.", author: "Confucius" },
  { text: "Reading is to the mind, as exercise is to the body.", author: "Brian Tracy" },
  { text: "Fake it until you make it! Act as if you had all the confidence you require until it becomes your reality.", author: "Brian Tracy" },
  { text: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson" },
  { text: "Go where you are celebrated, not tolerated.", author: "Unknown" },
  { text: "The battles that count aren't the ones for gold medals.", author: "Jesse Owens" },
  { text: "The mind is everything. What you think you become.", author: "Buddha" },
  { text: "Strive not to be a success, but rather to be of value.", author: "Albert Einstein" },
  { text: "A person who never made a mistake never tried anything new.", author: "Albert Einstein" },
  { text: "Two roads diverged in a wood, and I took the one less traveled by, and that has made all the difference.", author: "Robert Frost" },
  { text: "There is only one way to avoid criticism: do nothing, say nothing, and be nothing.", author: "Aristotle" },
  { text: "Ask and it will be given to you; search, and you will find; knock and the door will be opened for you.", author: "Jesus" },
  { text: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "When everything seems to be going against you, remember that the airplane takes off against the wind, not with it.", author: "Henry Ford" },
  { text: "Too many of us are not living our dreams because we are living our fears.", author: "Les Brown" },
  { text: "I have learned over the years that when one's mind is made up, this diminishes fear.", author: "Rosa Parks" },
  { text: "Limitations live only in our minds. But if we use our imaginations, our possibilities become limitless.", author: "Jamie Paolinetti" },
  { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
  { text: "Life is 10% what happens to us and 90% how we react to it.", author: "Charles R. Swindoll" },
  { text: "The most common way people give up their power is by thinking they don't have any.", author: "Alice Walker" },
  { text: "The best revenge is massive success.", author: "Frank Sinatra" },
  { text: "Education costs money. But then so does ignorance.", author: "Sir Claus Moser" },
  { text: "An unexamined life is not worth living.", author: "Socrates" },
  { text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs" },
  { text: "Winning isn't everything, but wanting to win is.", author: "Vince Lombardi" },
  { text: "I am not a product of my circumstances. I am a product of my decisions.", author: "Stephen Covey" },
  { text: "Every child is an artist. The problem is how to remain an artist once he grows up.", author: "Pablo Picasso" },
  { text: "You can never cross the ocean until you have the courage to lose sight of the shore.", author: "Christopher Columbus" },
  { text: "Either you run the day, or the day runs you.", author: "Jim Rohn" },
  { text: "Life shrinks or expands in proportion to one's courage.", author: "Anaïs Nin" },
  { text: "If you hear a voice within you say 'you cannot paint,' then by all means paint and that voice will be silenced.", author: "Vincent Van Gogh" },
  { text: "There is only one happiness in this life, to love and be loved.", author: "George Sand" },
  { text: "Remember that not getting what you want is sometimes a wonderful stroke of luck.", author: "Dalai Lama" },
  { text: "You can't use up creativity. The more you use, the more you have.", author: "Maya Angelou" },
  { text: "Nothing is impossible, the word itself says 'I'm possible'!", author: "Audrey Hepburn" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
  { text: "When I let go of what I am, I become what I might be.", author: "Lao Tzu" },
  { text: "Happiness is not something readymade. It comes from your own actions.", author: "Dalai Lama" },
  { text: "If you want to lift yourself up, lift up someone else.", author: "Booker T. Washington" },
];

// Get a consistent quote for each day
function getDailyQuote() {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 0);
  const diff = today - startOfYear;
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  // Use day of year to pick a quote (cycles through all quotes over the year)
  const quoteIndex = dayOfYear % quotes.length;
  return quotes[quoteIndex];
}

export function DailyQuote() {
  const [quote, setQuote] = useState(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setQuote(getDailyQuote());
  }, []);

  if (!quote || !isVisible) return null;

  return (
    <div className="glass rounded-2xl p-5 shadow-xl shadow-purple-900/10 animate-fade-in relative overflow-hidden">
      {/* Decorative quote mark */}
      <div className="absolute -top-2 -left-2 text-8xl text-violet-200/30 font-serif leading-none select-none">
        "
      </div>

      <div className="relative">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-slate-700 text-sm sm:text-base font-medium leading-relaxed mb-2">
              "{quote.text}"
            </p>
            <p className="text-slate-400 text-xs sm:text-sm font-medium">
              — {quote.author}
            </p>
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="flex-shrink-0 p-1.5 rounded-lg text-slate-300 hover:text-slate-500 hover:bg-slate-100 transition-colors"
            title="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">
            Daily Inspiration
          </span>
          <div className="flex items-center gap-1 text-xs text-amber-500 font-medium">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            Quote of the Day
          </div>
        </div>
      </div>
    </div>
  );
}
