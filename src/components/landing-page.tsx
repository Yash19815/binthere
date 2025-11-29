import Header from './header';
import TipsCarousel from './tips-carousel';
import { Button } from './ui/button';
import { toast } from 'sonner@2.0.3';

interface LandingPageProps {
  onNavigate: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  onLogout?: () => void;
  userName?: string;
  userEmail?: string;
}

export default function LandingPage({ 
  onNavigate, 
  isDarkMode = false,
  onToggleDarkMode = () => {},
  onLogout = () => {},
  userName,
  userEmail,
}: LandingPageProps) {
  const handleRefresh = async () => {
    // Simulate API refresh
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success('Dashboard data refreshed successfully');
  };

  // Empty notifications on landing page - they'll see notifications once they enter the dashboard
  const notifications: any[] = [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Header 
        onRefresh={handleRefresh} 
        notifications={notifications}
        isDarkMode={isDarkMode}
        onToggleDarkMode={onToggleDarkMode}
        onLogout={onLogout}
        userName={userName}
        userEmail={userEmail}
      />
      
      <main className="max-w-7xl mx-auto px-6">
        {/* Hero Section */}
        <section className="py-12 text-center">
          <h1 className="text-green-700 dark:text-green-500 mb-4">
            Welcome to BinThere Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Monitor your smart waste management system in real-time. Track dustbin fill levels, 
            waste classification, and optimize collection routes for a cleaner, more efficient city.
          </p>
        </section>

        {/* Tips Carousel Section */}
        <section className="py-8">
          <TipsCarousel />
        </section>

        {/* CTA Section */}
        <section className="py-8 pb-16 flex justify-center">
          <Button 
            onClick={onNavigate}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            View All Dustbins
          </Button>
        </section>
      </main>
    </div>
  );
}
