'use client';

import React, { useState, useEffect, useRef } from 'react';

// =============================================================================
// SMILE COUNTER - Track the joy we're spreading!
// =============================================================================
// This connects to Supabase for a global smile counter.
// See BACKEND_SETUP.md for setup instructions.

// CONFIGURATION - Your Supabase credentials
const SUPABASE_URL = 'https://ssrczrdihcxfqxscqmkw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzcmN6cmRpaGN4ZnF4c2NxbWt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMzEzNDQsImV4cCI6MjA4MDcwNzM0NH0.rrf2OQqfpZnCWmcos7JO3TE0uwUvdNic-Xnjk3Xf_G4';
const BASE_SMILE_COUNT = 47832; // Fallback if API fails

// Simple Supabase client (no npm package needed for basic ops)
const supabaseRequest = async (endpoint, options = {}) => {
  if (SUPABASE_URL === 'YOUR_SUPABASE_URL') {
    // Not configured yet, use localStorage fallback
    return null;
  }
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
      ...options,
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': options.prefer || 'return=representation',
        ...options.headers,
      },
    });
    return response.json();
  } catch (error) {
    console.error('Supabase request failed:', error);
    return null;
  }
};

// Get smile count from Supabase (or localStorage fallback)
const getSmileCount = async () => {
  // Try Supabase first
  const data = await supabaseRequest('smile_counter?id=eq.1&select=count');
  if (data && data[0]) {
    return data[0].count;
  }
  
  // Fallback to localStorage
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('dadJokesSmileCount');
    return stored ? parseInt(stored, 10) : BASE_SMILE_COUNT;
  }
  return BASE_SMILE_COUNT;
};

// Increment smile count (Supabase RPC or localStorage fallback)
const incrementSmileCount = async (amount = 1) => {
  // Try Supabase RPC
  if (SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/increment_smiles`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });
      const newCount = await response.json();
      if (typeof newCount === 'number') {
        return newCount;
      }
    } catch (error) {
      console.error('Failed to increment via Supabase:', error);
    }
  }
  
  // Fallback to localStorage
  if (typeof window !== 'undefined') {
    const current = parseInt(localStorage.getItem('dadJokesSmileCount') || BASE_SMILE_COUNT, 10);
    const newCount = current + amount;
    localStorage.setItem('dadJokesSmileCount', newCount.toString());
    return newCount;
  }
  return BASE_SMILE_COUNT;
};

// Submit a joke to Supabase
const submitJokeToBackend = async (joke) => {
  if (SUPABASE_URL === 'YOUR_SUPABASE_URL') {
    // Not configured, just simulate success
    console.log('Joke submission (backend not configured):', joke);
    return { success: true, simulated: true };
  }
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/joke_submissions`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        name: joke.name,
        setup: joke.setup,
        punchline: joke.punchline,
        category: joke.category,
      }),
    });
    
    if (response.ok) {
      return { success: true };
    } else {
      return { success: false, error: 'Submission failed' };
    }
  } catch (error) {
    console.error('Failed to submit joke:', error);
    return { success: false, error };
  }
};

// =============================================================================
// SMILE COUNTER COMPONENT
// =============================================================================

const SmileCounter = ({ count, justIncremented }) => {
  const formattedCount = count.toLocaleString();
  
  return (
    <div className={`smile-counter ${justIncremented ? 'celebrating' : ''}`}>
      <div className="smile-counter-inner">
        <span className="smile-icon">😊</span>
        <div className="smile-stats">
          <span className="smile-number">{formattedCount}</span>
          <span className="smile-label">smiles brought into the world</span>
        </div>
      </div>
      {justIncremented && (
        <div className="smile-celebration">
          <span>+1 😄</span>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// JOKE DATABASE - ADD YOUR JOKES HERE!
// =============================================================================
// 
// HOW TO PRELOAD JOKES:
// 1. Add jokes with future dates - they'll automatically appear on that day
// 2. Jokes are sorted by date, newest first
// 3. Future jokes stay hidden until their scheduled date
// 4. You can add jokes weeks or months in advance!
//
// FORMAT:
// { id: [unique number], date: 'YYYY-MM-DD', setup: "Question?", punchline: "Answer!", category: "Category" }
//
// CATEGORIES: Science, Food, Classic, Animals, Nature, Movies, Work, Sports, Tech, Holiday
// =============================================================================

const jokesDatabase = [
  // ===== FUTURE JOKES (will appear on their scheduled date) =====
  { id: 101, date: '2025-12-25', setup: "What do you call an obnoxious reindeer?", punchline: "Rude-olph!", category: "Holiday", submittedBy: "Sarah M." },
  { id: 102, date: '2025-12-24', setup: "Why was the snowman looking through the carrots?", punchline: "He was picking his nose!", category: "Holiday" },
  { id: 103, date: '2025-12-23', setup: "What do elves learn in school?", punchline: "The elf-abet!", category: "Holiday", submittedBy: "Mike D." },
  { id: 100, date: '2025-12-15', setup: "Why do fathers take an extra pair of socks when they go golfing?", punchline: "In case they get a hole in one!", category: "Sports" },
  { id: 99, date: '2025-12-14', setup: "What do you call a dinosaur that crashes their car?", punchline: "Tyrannosaurus Wrecks!", category: "Classic", submittedBy: "Emma T." },
  { id: 98, date: '2025-12-13', setup: "Why don't oysters donate to charity?", punchline: "Because they're shellfish!", category: "Animals" },
  { id: 97, date: '2025-12-12', setup: "What do you call a factory that makes okay products?", punchline: "A satisfactory!", category: "Work" },
  { id: 96, date: '2025-12-11', setup: "Why did the coffee file a police report?", punchline: "It got mugged!", category: "Food", submittedBy: "James K." },
  { id: 95, date: '2025-12-10', setup: "What do you call a sleeping dinosaur?", punchline: "A dino-snore!", category: "Animals" },
  { id: 94, date: '2025-12-09', setup: "Why don't scientists trust stairs?", punchline: "Because they're always up to something!", category: "Science" },
  { id: 93, date: '2025-12-08', setup: "What did the buffalo say when his son left for college?", punchline: "Bison!", category: "Animals", submittedBy: "Lisa R." },
  
  // ===== TODAY AND PAST JOKES =====
  { id: 1, date: '2025-12-07', setup: "Why don't scientists trust atoms?", punchline: "Because they make up everything!", category: "Science" },
  { id: 2, date: '2025-12-06', setup: "What do you call a fake noodle?", punchline: "An impasta!", category: "Food", submittedBy: "Tom B." },
  { id: 3, date: '2025-12-05', setup: "Why did the scarecrow win an award?", punchline: "He was outstanding in his field!", category: "Classic" },
  { id: 4, date: '2025-12-04', setup: "What do you call a bear with no teeth?", punchline: "A gummy bear!", category: "Animals" },
  { id: 5, date: '2025-12-03', setup: "Why don't eggs tell jokes?", punchline: "They'd crack each other up!", category: "Food" },
  { id: 6, date: '2025-12-02', setup: "What did the ocean say to the beach?", punchline: "Nothing, it just waved.", category: "Nature", submittedBy: "Amy S." },
  { id: 7, date: '2025-12-01', setup: "Why did the bicycle fall over?", punchline: "Because it was two-tired!", category: "Classic" },
  { id: 8, date: '2025-11-30', setup: "What do you call a fish without eyes?", punchline: "A fsh!", category: "Animals" },
  { id: 9, date: '2025-11-29', setup: "Why can't you give Elsa a balloon?", punchline: "Because she'll let it go!", category: "Movies" },
  { id: 10, date: '2025-11-28', setup: "What do you call a lazy kangaroo?", punchline: "A pouch potato!", category: "Animals", submittedBy: "Chris P." },
  { id: 11, date: '2025-11-27', setup: "Why don't skeletons fight each other?", punchline: "They don't have the guts!", category: "Classic" },
  { id: 12, date: '2025-11-26', setup: "What did the grape do when it got stepped on?", punchline: "Nothing, it just let out a little wine.", category: "Food" },
];

// =============================================================================
// DATE HELPER FUNCTIONS
// =============================================================================

// Get today's date in YYYY-MM-DD format (in user's timezone)
const getTodayString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Filter and sort jokes - only show today and past, sorted newest first
const getVisibleJokes = (jokes) => {
  const today = getTodayString();
  return jokes
    .filter(joke => joke.date <= today)  // Only today and past
    .sort((a, b) => b.date.localeCompare(a.date));  // Newest first
};

// Get today's joke specifically
const getTodaysJoke = (jokes) => {
  const today = getTodayString();
  const todayJoke = jokes.find(joke => joke.date === today);
  if (todayJoke) return todayJoke;
  
  // Fallback: if no joke scheduled for today, show most recent past joke
  const visible = getVisibleJokes(jokes);
  return visible[0] || null;
};

// Get past jokes (everything except today's)
const getPastJokes = (jokes) => {
  const todaysJoke = getTodaysJoke(jokes);
  const visible = getVisibleJokes(jokes);
  return visible.filter(joke => joke.id !== todaysJoke?.id);
};

// Count scheduled future jokes (for admin info)
const getFutureJokesCount = (jokes) => {
  const today = getTodayString();
  return jokes.filter(joke => joke.date > today).length;
};

// Ad Placeholder Component
const AdPlaceholder = ({ size = 'banner', className = '' }) => {
  const sizes = {
    banner: { width: '728px', height: '90px', label: 'Banner Ad (728x90)' },
    sidebar: { width: '300px', height: '250px', label: 'Sidebar Ad (300x250)' },
    mobile: { width: '320px', height: '100px', label: 'Mobile Ad (320x100)' },
  };
  
  const { width, height, label } = sizes[size];
  
  return (
    <div 
      className={`ad-placeholder ${className}`}
      style={{ 
        width, 
        height, 
        maxWidth: '100%',
        background: 'linear-gradient(135deg, #f0e6d3 0%, #e8dcc8 100%)',
        border: '2px dashed #c4a77d',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#8b7355',
        fontFamily: "'DM Mono', monospace",
        fontSize: '12px',
        margin: '0 auto',
      }}
    >
      {label}
    </div>
  );
};

// Joke Card Component
const JokeCard = ({ joke, isToday = false, isRevealed = true, onReveal, onSmile }) => {
  const [showPunchline, setShowPunchline] = useState(isRevealed);
  
  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleReveal = () => {
    setShowPunchline(true);
    onReveal?.();
    onSmile?.(); // Count the smile!
  };

  const handleShare = (type) => {
    onSmile?.(); // Sharing spreads smiles!
    
    if (type === 'copy') {
      navigator.clipboard?.writeText(`${joke.setup} ${joke.punchline} 😄 — Share a smile at dadjokeaday.com`);
      alert('Joke copied! Go spread some smiles 😊');
    } else if (type === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${joke.setup} ${joke.punchline} 😄 Share more smiles at`)}&url=${encodeURIComponent('https://dadjokeaday.com')}`, '_blank');
    }
  };

  return (
    <div className={`joke-card ${isToday ? 'today' : ''}`}>
      <div className="joke-meta">
        <span className="joke-date">{formatDate(joke.date)}</span>
        <span className="joke-category">{joke.category}</span>
      </div>
      <div className="joke-content">
        <p className="joke-setup">{joke.setup}</p>
        {showPunchline ? (
          <>
            <p className="joke-punchline">{joke.punchline}</p>
            {joke.submittedBy && (
              <p className="joke-credit">😊 Submitted by <strong>{joke.submittedBy}</strong></p>
            )}
          </>
        ) : (
          <button 
            className="reveal-btn"
            onClick={handleReveal}
          >
            🥁 Ready to Smile?
          </button>
        )}
      </div>
      {isToday && showPunchline && (
        <div className="share-section">
          <button className="share-btn" onClick={() => handleShare('copy')}>
            📋 Copy & Share
          </button>
          <button className="share-btn" onClick={() => handleShare('twitter')}>
            𝕏 Spread Joy
          </button>
        </div>
      )}
    </div>
  );
};

// Submit Joke Form Component
const SubmitJokeForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    setup: '',
    punchline: '',
    category: 'Classic',
    confirmed: false,
    // Honeypot field - bots will fill this, humans won't see it
    website: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [turnstileToken, setTurnstileToken] = useState(null);
  const turnstileRef = useRef(null);

  // Cloudflare Turnstile site key - get yours at https://dash.cloudflare.com/turnstile
  // Set to null to disable Turnstile (honeypot will still work)
  const TURNSTILE_SITE_KEY = null; // Replace with: 'your-site-key-here'

  const categories = ['Classic', 'Food', 'Animals', 'Science', 'Nature', 'Movies', 'Work', 'Sports', 'Tech', 'Holiday'];

  // Load Turnstile script
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    
    // Check if already loaded
    if (window.turnstile) return;
    
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
    
    script.onload = () => {
      if (turnstileRef.current && window.turnstile) {
        window.turnstile.render(turnstileRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (token) => setTurnstileToken(token),
          'error-callback': () => setError('Verification failed. Please try again.'),
        });
      }
    };
    
    return () => {
      // Cleanup if needed
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Honeypot check - if filled, it's a bot
    if (formData.website) {
      // Silently "succeed" to not alert the bot
      setSubmitted(true);
      return;
    }
    
    if (!formData.confirmed) {
      setError('Please confirm that your joke is original or common knowledge');
      return;
    }
    
    // Turnstile check (if enabled)
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setError('Please complete the verification');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    const result = await submitJokeToBackend({
      name: formData.name,
      setup: formData.setup,
      punchline: formData.punchline,
      category: formData.category,
      turnstileToken: turnstileToken, // Send to backend for verification
    });
    
    setSubmitting(false);
    
    if (result.success) {
      setSubmitted(true);
    } else {
      setError('Something went wrong. Please try again!');
      // Reset Turnstile on error
      if (window.turnstile && turnstileRef.current) {
        window.turnstile.reset(turnstileRef.current);
      }
    }
  };

  if (submitted) {
    return (
      <div className="submit-form-container">
        <div className="submit-success">
          <span className="success-emoji">🎉</span>
          <h3>Thanks for sharing the joy!</h3>
          <p>We'll review your joke and if it makes us smile, it'll appear on the site with your name!</p>
          <button className="submit-btn" onClick={onClose}>
            Back to Jokes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="submit-form-container">
      <div className="submit-header">
        <h2>✨ Share Your Best Dad Joke</h2>
        <p>Got a joke that makes everyone smile? We'd love to feature it — with your name in lights!</p>
        <div className="clean-humor-note">
          <span>🌟</span>
          <span>All jokes are reviewed to ensure they're clean, family-friendly, and spread pure joy</span>
        </div>
      </div>
      
      <form className="submit-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Your Name (how you'd like to be credited)</label>
          <input
            type="text"
            id="name"
            placeholder="e.g., Sarah M."
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="setup">The Setup</label>
          <input
            type="text"
            id="setup"
            placeholder="Why did the chicken cross the road?"
            value={formData.setup}
            onChange={(e) => setFormData({...formData, setup: e.target.value})}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="punchline">The Punchline</label>
          <input
            type="text"
            id="punchline"
            placeholder="To get to the other side!"
            value={formData.punchline}
            onChange={(e) => setFormData({...formData, punchline: e.target.value})}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        {/* Honeypot field - hidden from humans, bots will fill it */}
        <div className="form-group" style={{ 
          position: 'absolute', 
          left: '-9999px',
          opacity: 0,
          height: 0,
          overflow: 'hidden',
        }} aria-hidden="true">
          <label htmlFor="website">Website (leave blank)</label>
          <input
            type="text"
            id="website"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={formData.website}
            onChange={(e) => setFormData({...formData, website: e.target.value})}
          />
        </div>
        
        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.confirmed}
              onChange={(e) => setFormData({...formData, confirmed: e.target.checked})}
            />
            <span className="checkmark"></span>
            <span className="checkbox-text">
              I confirm this joke is my own creation or common knowledge, and is appropriate for all ages
            </span>
          </label>
        </div>
        
        {/* Cloudflare Turnstile widget */}
        {TURNSTILE_SITE_KEY && (
          <div className="turnstile-container">
            <div ref={turnstileRef}></div>
          </div>
        )}
        
        {error && (
          <div className="form-error">
            ⚠️ {error}
          </div>
        )}
        
        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit My Joke 😊'}
          </button>
        </div>
      </form>
    </div>
  );
};

// Main App Component
export default function DadJokesSite() {
  const [currentView, setCurrentView] = useState('home');
  const [todayRevealed, setTodayRevealed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Smile counter state
  const [smileCount, setSmileCount] = useState(BASE_SMILE_COUNT);
  const [justSmiled, setJustSmiled] = useState(false);
  
  // Load smile count on mount
  useEffect(() => {
    const loadSmileCount = async () => {
      const count = await getSmileCount();
      setSmileCount(count);
    };
    loadSmileCount();
  }, []);
  
  // Handle a new smile (punchline reveal or share)
  const handleSmile = async () => {
    setJustSmiled(true);
    const newCount = await incrementSmileCount(1);
    if (newCount) {
      setSmileCount(newCount);
    }
    setTimeout(() => setJustSmiled(false), 2000);
  };

  // Get today's joke and past jokes using date-aware functions
  const todaysJoke = getTodaysJoke(jokesDatabase);
  const pastJokes = getPastJokes(jokesDatabase);
  const futureCount = getFutureJokesCount(jokesDatabase);
  
  // Get unique categories from visible jokes only
  const visibleJokes = getVisibleJokes(jokesDatabase);
  const categories = ['All', ...new Set(visibleJokes.map(j => j.category))];
  
  // Filter past jokes
  const filteredJokes = selectedCategory === 'All' 
    ? pastJokes 
    : pastJokes.filter(j => j.category === selectedCategory);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=DM+Mono:wght@400;500&family=Fraunces:opsz,wght@9..144,400;9..144,700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        :root {
          --cream: #faf6f0;
          --mustard: #e8a838;
          --rust: #c45d3a;
          --forest: #2d5a47;
          --navy: #1e3a5f;
          --charcoal: #2c2c2c;
          --warm-white: #fffef9;
        }
        
        body {
          background: var(--cream);
          min-height: 100vh;
        }
        
        .app-container {
          min-height: 100vh;
          background: var(--cream);
          background-image: 
            radial-gradient(circle at 20% 80%, rgba(232, 168, 56, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(196, 93, 58, 0.08) 0%, transparent 50%);
        }
        
        /* Header */
        .header {
          background: var(--charcoal);
          padding: 1rem 2rem;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        
        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .logo {
          font-family: 'Archivo Black', sans-serif;
          font-size: 1.5rem;
          color: var(--warm-white);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          text-decoration: none;
        }
        
        .logo-emoji {
          font-size: 2rem;
          animation: wobble 2s ease-in-out infinite;
        }
        
        @keyframes wobble {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        
        .nav {
          display: flex;
          gap: 0.5rem;
        }
        
        .nav-btn {
          font-family: 'DM Mono', monospace;
          font-size: 0.9rem;
          padding: 0.6rem 1.2rem;
          border: none;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: transparent;
          color: var(--warm-white);
        }
        
        .nav-btn:hover {
          background: rgba(255,255,255,0.1);
        }
        
        .nav-btn.active {
          background: var(--mustard);
          color: var(--charcoal);
        }
        
        /* Hero Section */
        .hero {
          padding: 4rem 2rem 2rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        
        .hero::before {
          content: '😂 🤣 😆 🙃 😄 😁';
          position: absolute;
          top: 1rem;
          left: 0;
          right: 0;
          font-size: 3rem;
          opacity: 0.1;
          letter-spacing: 2rem;
          animation: float 20s linear infinite;
        }
        
        @keyframes float {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .hero h1 {
          font-family: 'Archivo Black', sans-serif;
          font-size: clamp(2.5rem, 8vw, 5rem);
          color: var(--charcoal);
          line-height: 1.1;
          margin-bottom: 1rem;
        }
        
        .hero h1 span {
          color: var(--rust);
          position: relative;
        }
        
        .hero h1 span::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 0.2em;
          background: var(--mustard);
          transform: rotate(-1deg);
          z-index: -1;
        }
        
        .hero-subtitle {
          font-family: 'DM Mono', monospace;
          font-size: 1.1rem;
          color: var(--forest);
          max-width: 500px;
          margin: 0 auto 2rem;
        }
        
        .streak-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--forest);
          color: var(--warm-white);
          padding: 0.5rem 1rem;
          border-radius: 50px;
          font-family: 'DM Mono', monospace;
          font-size: 0.85rem;
        }
        
        /* Smile Counter */
        .smile-counter {
          display: inline-block;
          position: relative;
          background: linear-gradient(135deg, var(--forest) 0%, #1e4a3a 100%);
          border-radius: 20px;
          padding: 1.2rem 2rem;
          box-shadow: 0 4px 20px rgba(45, 90, 71, 0.3);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .smile-counter:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(45, 90, 71, 0.4);
        }
        
        .smile-counter.celebrating {
          animation: celebrate 0.6s ease-out;
        }
        
        @keyframes celebrate {
          0% { transform: scale(1); }
          30% { transform: scale(1.05); }
          60% { transform: scale(0.98); }
          100% { transform: scale(1); }
        }
        
        .smile-counter-inner {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .smile-icon {
          font-size: 2.5rem;
          animation: gentle-bounce 2s ease-in-out infinite;
        }
        
        @keyframes gentle-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        .smile-stats {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        
        .smile-number {
          font-family: 'Archivo Black', sans-serif;
          font-size: 1.8rem;
          color: var(--warm-white);
          line-height: 1;
        }
        
        .smile-label {
          font-family: 'DM Mono', monospace;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.8);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .smile-celebration {
          position: absolute;
          top: -10px;
          right: -10px;
          background: var(--mustard);
          color: var(--charcoal);
          padding: 0.3rem 0.6rem;
          border-radius: 50px;
          font-family: 'Archivo Black', sans-serif;
          font-size: 0.8rem;
          animation: pop-in 0.4s ease-out;
        }
        
        @keyframes pop-in {
          0% { 
            opacity: 0; 
            transform: scale(0) rotate(-20deg);
          }
          50% { 
            transform: scale(1.2) rotate(5deg);
          }
          100% { 
            opacity: 1; 
            transform: scale(1) rotate(0);
          }
        }
        
        /* Clean Promise Badge */
        .clean-promise {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(45, 90, 71, 0.1);
          color: var(--forest);
          padding: 0.6rem 1.2rem;
          border-radius: 50px;
          font-family: 'DM Mono', monospace;
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
          border: 1px solid rgba(45, 90, 71, 0.2);
        }
        
        /* Joke Credit */
        .joke-credit {
          font-family: 'DM Mono', monospace;
          font-size: 0.85rem;
          color: var(--forest);
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px dashed #ddd;
        }
        
        .joke-credit strong {
          color: var(--rust);
        }
        
        /* Submit Nav Button */
        .nav-btn.submit-nav {
          background: var(--rust);
          color: var(--warm-white);
        }
        
        .nav-btn.submit-nav:hover {
          background: #b54d2e;
        }
        
        .nav-btn.submit-nav.active {
          background: var(--mustard);
          color: var(--charcoal);
        }
        
        /* Submit Form */
        .submit-form-container {
          max-width: 600px;
          margin: 0 auto;
          background: var(--warm-white);
          border-radius: 20px;
          padding: 2.5rem;
          box-shadow: 
            0 4px 6px rgba(0,0,0,0.05),
            0 10px 40px rgba(0,0,0,0.08);
        }
        
        .submit-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .submit-header h2 {
          font-family: 'Archivo Black', sans-serif;
          font-size: 1.8rem;
          color: var(--charcoal);
          margin-bottom: 0.5rem;
        }
        
        .submit-header p {
          font-family: 'DM Mono', monospace;
          color: #666;
          font-size: 0.95rem;
        }
        
        .clean-humor-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: rgba(45, 90, 71, 0.1);
          color: var(--forest);
          padding: 0.8rem 1rem;
          border-radius: 10px;
          font-family: 'DM Mono', monospace;
          font-size: 0.8rem;
          margin-top: 1rem;
          border: 1px solid rgba(45, 90, 71, 0.2);
        }
        
        .submit-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .form-group label {
          font-family: 'DM Mono', monospace;
          font-size: 0.85rem;
          color: var(--charcoal);
          font-weight: 500;
        }
        
        .form-group input,
        .form-group select {
          padding: 1rem;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          font-family: 'Fraunces', serif;
          font-size: 1rem;
          transition: border-color 0.2s ease;
        }
        
        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: var(--forest);
        }
        
        .form-group input::placeholder {
          color: #aaa;
          font-style: italic;
        }
        
        /* Checkbox Group */
        .checkbox-group {
          margin-top: 0.5rem;
        }
        
        .checkbox-label {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          cursor: pointer;
          font-weight: normal !important;
        }
        
        .checkbox-label input[type="checkbox"] {
          width: 20px;
          height: 20px;
          margin-top: 2px;
          cursor: pointer;
          accent-color: var(--forest);
        }
        
        .checkbox-text {
          font-family: 'DM Mono', monospace;
          font-size: 0.85rem;
          color: #555;
          line-height: 1.4;
        }
        
        /* Form Error */
        .form-error {
          background: #fff3f3;
          border: 1px solid #ffcccc;
          color: #cc4444;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-family: 'DM Mono', monospace;
          font-size: 0.85rem;
        }
        
        /* Turnstile Container */
        .turnstile-container {
          display: flex;
          justify-content: center;
          margin: 0.5rem 0;
        }
        
        /* Disabled Submit Button */
        .submit-btn:disabled {
          background: #999;
          cursor: not-allowed;
          transform: none;
        }
        
        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1rem;
        }
        
        .cancel-btn {
          font-family: 'DM Mono', monospace;
          padding: 1rem 1.5rem;
          background: transparent;
          color: #666;
          border: 2px solid #ddd;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .cancel-btn:hover {
          border-color: #999;
          color: #333;
        }
        
        .submit-btn {
          font-family: 'Archivo Black', sans-serif;
          padding: 1rem 2rem;
          background: var(--forest);
          color: var(--warm-white);
          border: none;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .submit-btn:hover {
          background: #1e4a3a;
          transform: translateY(-2px);
        }
        
        /* Submit Success */
        .submit-success {
          text-align: center;
          padding: 2rem;
        }
        
        .success-emoji {
          font-size: 4rem;
          display: block;
          margin-bottom: 1rem;
          animation: bounce-in 0.6s ease-out;
        }
        
        @keyframes bounce-in {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        
        .submit-success h3 {
          font-family: 'Archivo Black', sans-serif;
          font-size: 1.5rem;
          color: var(--charcoal);
          margin-bottom: 0.5rem;
        }
        
        .submit-success p {
          font-family: 'DM Mono', monospace;
          color: #666;
          margin-bottom: 1.5rem;
        }
        
        /* Main Content */
        .main-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        /* Today's Joke Section */
        .todays-section {
          margin-bottom: 3rem;
        }
        
        .section-label {
          font-family: 'DM Mono', monospace;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: var(--rust);
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .section-label::before,
        .section-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, var(--rust), transparent);
        }
        
        .section-label::after {
          background: linear-gradient(90deg, transparent, var(--rust));
        }
        
        /* Joke Cards */
        .joke-card {
          background: var(--warm-white);
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 
            0 4px 6px rgba(0,0,0,0.05),
            0 10px 40px rgba(0,0,0,0.08);
          margin-bottom: 1.5rem;
          position: relative;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .joke-card:hover {
          transform: translateY(-2px);
          box-shadow: 
            0 6px 12px rgba(0,0,0,0.08),
            0 15px 50px rgba(0,0,0,0.12);
        }
        
        .joke-card.today {
          border: 3px solid var(--mustard);
          background: linear-gradient(135deg, var(--warm-white) 0%, #fff9e6 100%);
        }
        
        .joke-card.today::before {
          content: '⭐ TODAY';
          position: absolute;
          top: 1rem;
          right: -2rem;
          background: var(--mustard);
          color: var(--charcoal);
          padding: 0.3rem 3rem;
          font-family: 'DM Mono', monospace;
          font-size: 0.7rem;
          font-weight: 500;
          transform: rotate(45deg);
        }
        
        .joke-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        .joke-date {
          font-family: 'DM Mono', monospace;
          font-size: 0.85rem;
          color: #888;
        }
        
        .joke-category {
          background: var(--forest);
          color: var(--warm-white);
          padding: 0.3rem 0.8rem;
          border-radius: 50px;
          font-family: 'DM Mono', monospace;
          font-size: 0.75rem;
        }
        
        .joke-content {
          text-align: center;
        }
        
        .joke-setup {
          font-family: 'Fraunces', serif;
          font-size: clamp(1.3rem, 4vw, 1.8rem);
          color: var(--charcoal);
          margin-bottom: 1.5rem;
          line-height: 1.4;
        }
        
        .joke-punchline {
          font-family: 'Archivo Black', sans-serif;
          font-size: clamp(1.4rem, 4vw, 2rem);
          color: var(--rust);
          animation: punchline-reveal 0.5s ease-out;
        }
        
        @keyframes punchline-reveal {
          0% { 
            opacity: 0; 
            transform: scale(0.8) rotate(-2deg);
          }
          50% { 
            transform: scale(1.05) rotate(1deg);
          }
          100% { 
            opacity: 1; 
            transform: scale(1) rotate(0);
          }
        }
        
        .reveal-btn {
          font-family: 'Archivo Black', sans-serif;
          font-size: 1.1rem;
          padding: 1rem 2rem;
          background: var(--mustard);
          color: var(--charcoal);
          border: none;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(232, 168, 56, 0.4);
        }
        
        .reveal-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 25px rgba(232, 168, 56, 0.6);
        }
        
        .share-section {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px dashed #ddd;
        }
        
        .share-btn {
          font-family: 'DM Mono', monospace;
          font-size: 0.85rem;
          padding: 0.6rem 1.2rem;
          background: var(--charcoal);
          color: var(--warm-white);
          border: none;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .share-btn:hover {
          background: var(--navy);
          transform: translateY(-2px);
        }
        
        /* Archive Section */
        .archive-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .archive-title {
          font-family: 'Archivo Black', sans-serif;
          font-size: 2rem;
          color: var(--charcoal);
        }
        
        .filter-bar {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        
        .filter-btn {
          font-family: 'DM Mono', monospace;
          font-size: 0.8rem;
          padding: 0.5rem 1rem;
          background: var(--warm-white);
          color: var(--charcoal);
          border: 2px solid #ddd;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .filter-btn:hover {
          border-color: var(--forest);
        }
        
        .filter-btn.active {
          background: var(--forest);
          color: var(--warm-white);
          border-color: var(--forest);
        }
        
        .jokes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }
        
        /* Ad Sections */
        .ad-section {
          margin: 2rem 0;
          text-align: center;
        }
        
        /* Footer */
        .footer {
          background: var(--charcoal);
          padding: 2rem;
          text-align: center;
          margin-top: 4rem;
        }
        
        .footer-content {
          max-width: 800px;
          margin: 0 auto;
        }
        
        .footer p {
          font-family: 'DM Mono', monospace;
          color: #888;
          font-size: 0.85rem;
        }
        
        .footer-promise {
          color: var(--mustard) !important;
          margin-top: 0.5rem;
          font-size: 0.8rem !important;
        }
        
        .footer-links {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-top: 1rem;
        }
        
        .footer-links a {
          color: var(--mustard);
          text-decoration: none;
          font-family: 'DM Mono', monospace;
          font-size: 0.85rem;
        }
        
        .footer-links a:hover {
          text-decoration: underline;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .header {
            padding: 1rem;
          }
          
          .logo {
            font-size: 1.2rem;
          }
          
          .nav-btn {
            padding: 0.5rem 0.8rem;
            font-size: 0.8rem;
          }
          
          .hero {
            padding: 2rem 1rem;
          }
          
          .main-content {
            padding: 1rem;
          }
          
          .joke-card {
            padding: 1.5rem;
          }
          
          .jokes-grid {
            grid-template-columns: 1fr;
          }
          
          .archive-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .submit-form-container {
            padding: 1.5rem;
            margin: 0 -0.5rem;
          }
          
          .submit-header h2 {
            font-size: 1.4rem;
          }
          
          .form-actions {
            flex-direction: column;
          }
          
          .cancel-btn,
          .submit-btn {
            width: 100%;
            text-align: center;
          }
          
          .nav-btn.submit-nav {
            font-size: 0.7rem;
            padding: 0.5rem 0.6rem;
          }
          
          .clean-promise {
            font-size: 0.75rem;
            padding: 0.5rem 0.8rem;
          }
        }
      `}</style>
      
      <div className="app-container">
        {/* Header */}
        <header className="header">
          <div className="header-content">
            <div className="logo" onClick={() => setCurrentView('home')}>
              <span className="logo-emoji">🥸</span>
              Dad Joke a Day
            </div>
            <nav className="nav">
              <button 
                className={`nav-btn ${currentView === 'home' ? 'active' : ''}`}
                onClick={() => setCurrentView('home')}
              >
                Today
              </button>
              <button 
                className={`nav-btn ${currentView === 'archive' ? 'active' : ''}`}
                onClick={() => setCurrentView('archive')}
              >
                Archive
              </button>
              <button 
                className={`nav-btn submit-nav ${currentView === 'submit' ? 'active' : ''}`}
                onClick={() => setCurrentView('submit')}
              >
                Submit a Joke
              </button>
            </nav>
          </div>
        </header>
        
        {/* Hero Section - Home Only */}
        {currentView === 'home' && (
          <section className="hero">
            <h1>One <span>Dad Joke</span><br/>Every Day</h1>
            <p className="hero-subtitle">
              Your daily dose of wholesome humor. 
              Because everyone deserves a smile before noon.
            </p>
            <div className="clean-promise">
              <span>✨</span> Always clean, always family-friendly, always smile-worthy
            </div>
            <SmileCounter count={smileCount} justIncremented={justSmiled} />
          </section>
        )}
        
        {/* Main Content */}
        <main className="main-content">
          {/* Top Ad Banner */}
          <div className="ad-section">
            <AdPlaceholder size="banner" />
          </div>
          
          {currentView === 'home' ? (
            <>
              {/* Today's Joke */}
              <section className="todays-section">
                <div className="section-label">Your Smile for Today</div>
                <JokeCard 
                  joke={todaysJoke} 
                  isToday={true}
                  isRevealed={todayRevealed}
                  onReveal={() => setTodayRevealed(true)}
                  onSmile={handleSmile}
                />
              </section>
              
              {/* Middle Ad */}
              <div className="ad-section">
                <AdPlaceholder size="sidebar" />
              </div>
              
              {/* Recent Jokes Preview */}
              <section>
                <div className="section-label">More Smiles From This Week</div>
                {pastJokes.slice(0, 3).map(joke => (
                  <JokeCard key={joke.id} joke={joke} onSmile={handleSmile} />
                ))}
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <button 
                    className="reveal-btn"
                    onClick={() => setCurrentView('archive')}
                    style={{ background: 'var(--forest)' }}
                  >
                    See All {visibleJokes.length} Smiles →
                  </button>
                </div>
              </section>
            </>
          ) : currentView === 'archive' ? (
            /* Archive View */
            <section>
              <div className="archive-header">
                <h2 className="archive-title">😊 The Smile Collection</h2>
                <div className="filter-bar">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="jokes-grid">
                {filteredJokes.map(joke => (
                  <JokeCard key={joke.id} joke={joke} onSmile={handleSmile} />
                ))}
              </div>
              
              {filteredJokes.length === 0 && (
                <p style={{ textAlign: 'center', color: '#888', padding: '3rem' }}>
                  More smiles coming soon to this category! 😊
                </p>
              )}
            </section>
          ) : (
            /* Submit View */
            <SubmitJokeForm onClose={() => setCurrentView('home')} />
          )}
          
          {/* Bottom Ad */}
          <div className="ad-section">
            <AdPlaceholder size="banner" />
          </div>
        </main>
        
        {/* Footer */}
        <footer className="footer">
          <div className="footer-content">
            <p>© 2025 Dad Joke a Day • Spreading smiles, one pun at a time</p>
            <p className="footer-promise">Always clean. Always family-friendly. Always free.</p>
            <div className="footer-links">
              <a href="#">About</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView('submit'); }}>Submit a Joke</a>
              <a href="#">Contact</a>
              <a href="#">Privacy Policy</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
