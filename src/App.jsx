import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './components/Header';
import Games from './components/Games';
import Community from './components/Community';
import Profile from './components/Profile';
import Leaderboard from './components/Leaderboard';


const BottomNav = () => {
  const location = useLocation();
  const getTabClass = (path) => 
    `flex flex-col items-center text-sm sm:text-base font-orbitron transition-colors ${
      location.pathname === path ? 'text-[#3a86ff]' : 'text-gray-400 hover:text-[#ff006e]'
    }`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0A0A0A] border-t border-[#8338ec]/50 flex justify-around py-3 z-50 sm:hidden">
      <Link to="/games" className={getTabClass('/games')}>
        Games
      </Link>
      <Link to="/community" className={getTabClass('/community')}>
        Community
      </Link>
      <Link to="/profile" className={getTabClass('/profile')}>
        Profile
      </Link>
      <Link to="/leaderboard" className={getTabClass('/leaderboard')}>
        Leaderboard
      </Link>
    </nav>
  );
};

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    console.log('Playrush Portal initialized');
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if (mobileMenuToggle && navMenu) {
      mobileMenuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('nav-open');
      });
    }
    // Hide loader on load
    window.addEventListener('load', () => {
      const loader = document.querySelector('.loader');
      if (loader) {
        loader.style.display = 'none';
      }
    });
    // Cleanup event listeners
    return () => {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.removeEventListener('click', () => {});
      });
      if (mobileMenuToggle) {
        mobileMenuToggle.removeEventListener('click', () => {});
      }
      window.removeEventListener('load', () => {});
    };
  }, []);

  return (
    <Router>
      <div className="bg-[#0A0A0A] text-white min-h-screen relative font-orbitron">
        <Header />
        <div className="pb-16 sm:pb-0 pt-16">
          <Routes>
            <Route path="/" element={<Games />} />
            <Route path="/games" element={<Games />} />
            <Route path="/community" element={<Community />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
        </div>
        <BottomNav />
      </div>
    </Router>
  );
}
