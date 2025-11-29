import { useState, useEffect } from 'react';
import LoginPage from './components/login-page';
import DustbinsOverview from './components/dustbins-overview';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  // Check for saved auth state on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('binthere_auth');
    const savedDarkMode = localStorage.getItem('binthere_darkMode');
    
    if (savedAuth === 'true') {
      const savedUser = localStorage.getItem('binthere_user');
      const savedEmail = localStorage.getItem('binthere_email');
      if (savedUser) setUserName(savedUser);
      if (savedEmail) setUserEmail(savedEmail);
      setIsAuthenticated(true);
    }
    
    if (savedDarkMode === 'true') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleLogin = (email: string, password: string, rememberMe: boolean) => {
    // Mock authentication - in production, validate against backend
    if (email && password) {
      setIsAuthenticated(true);
      setUserEmail(email);
      setUserName('Admin User');
      
      if (rememberMe) {
        localStorage.setItem('binthere_auth', 'true');
        localStorage.setItem('binthere_user', 'Admin User');
        localStorage.setItem('binthere_email', email);
      }
      
      toast.success('Login successful! Welcome to BinThere Dashboard.');
    } else {
      toast.error('Invalid credentials. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('binthere_auth');
    localStorage.removeItem('binthere_user');
    localStorage.removeItem('binthere_email');
    toast.success('Logged out successfully.');
  };

  const handleToggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('binthere_darkMode', (!isDarkMode).toString());
    
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      toast.success('Dark mode enabled');
    } else {
      document.documentElement.classList.remove('dark');
      toast.success('Light mode enabled');
    }
  };

  // If not authenticated, show login page
  if (!isAuthenticated) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <DustbinsOverview 
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onLogout={handleLogout}
        userName={userName}
        userEmail={userEmail}
      />
      <Toaster />
    </div>
  );
}
