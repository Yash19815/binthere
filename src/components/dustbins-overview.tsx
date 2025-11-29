import { useState } from 'react';
import { Search } from 'lucide-react';
import Header from './header';
import DustbinCard, { DustbinData } from './dustbin-card';
import AnalyticsGraph from './analytics-graph';
import ManageDustbinDialog from './manage-dustbin-dialog';
import TipsCarousel from './tips-carousel';
import { Input } from './ui/input';
import { toast } from 'sonner@2.0.3';

interface DustbinsOverviewProps {
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  onLogout?: () => void;
  userName?: string;
  userEmail?: string;
}

// Mock data for dustbins - this would come from a real-time database
// Timestamps represent when the dustbin became critically full (>= 80%)
const now = Date.now();
const mockDustbins: DustbinData[] = [
  {
    id: '001',
    name: 'Dustbin #001',
    location: 'Central Park North',
    overallFillLevel: 85,
    wetWasteFillLevel: 78,
    dryWasteFillLevel: 92,
    lastUpdated: '5 mins ago',
    criticalTimestamp: now - 5 * 60 * 1000, // 5 mins ago
    batteryLevel: 85,
    lastMaintenance: '3 days ago'
  },
  {
    id: '002',
    name: 'Dustbin #002',
    location: 'Market District',
    overallFillLevel: 65,
    wetWasteFillLevel: 68,
    dryWasteFillLevel: 62,
    lastUpdated: '12 mins ago',
    batteryLevel: 92,
    lastMaintenance: '1 week ago'
  },
  {
    id: '003',
    name: 'Dustbin #003',
    location: 'Residential Zone A',
    overallFillLevel: 45,
    wetWasteFillLevel: 42,
    dryWasteFillLevel: 48,
    lastUpdated: '8 mins ago',
    batteryLevel: 78,
    lastMaintenance: '5 days ago'
  },
  {
    id: '004',
    name: 'Dustbin #004',
    location: 'Shopping Mall',
    overallFillLevel: 92,
    wetWasteFillLevel: 95,
    dryWasteFillLevel: 89,
    lastUpdated: '2 mins ago',
    criticalTimestamp: now - 2 * 60 * 1000, // 2 mins ago (most recent)
    batteryLevel: 15,
    lastMaintenance: '2 days ago'
  },
  {
    id: '005',
    name: 'Dustbin #005',
    location: 'Industrial Area',
    overallFillLevel: 73,
    wetWasteFillLevel: 58,
    dryWasteFillLevel: 88,
    lastUpdated: '15 mins ago',
    criticalTimestamp: now - 15 * 60 * 1000, // 15 mins ago
    batteryLevel: 68,
    lastMaintenance: '1 day ago'
  },
  {
    id: '006',
    name: 'Dustbin #006',
    location: 'School Campus',
    overallFillLevel: 55,
    wetWasteFillLevel: 61,
    dryWasteFillLevel: 49,
    lastUpdated: '20 mins ago',
    batteryLevel: 95,
    lastMaintenance: '6 days ago'
  },
  {
    id: '007',
    name: 'Dustbin #007',
    location: 'Hospital Quarter',
    overallFillLevel: 38,
    wetWasteFillLevel: 35,
    dryWasteFillLevel: 41,
    lastUpdated: '10 mins ago',
    batteryLevel: 38,
    lastMaintenance: '4 days ago'
  },
  {
    id: '008',
    name: 'Dustbin #008',
    location: 'Tech Park',
    overallFillLevel: 81,
    wetWasteFillLevel: 76,
    dryWasteFillLevel: 86,
    lastUpdated: '7 mins ago',
    criticalTimestamp: now - 7 * 60 * 1000, // 7 mins ago
    batteryLevel: 55,
    lastMaintenance: '2 weeks ago'
  }
];

export default function DustbinsOverview({ 
  isDarkMode = false,
  onToggleDarkMode = () => {},
  onLogout = () => {},
  userName,
  userEmail,
}: DustbinsOverviewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGraphDustbinId, setSelectedGraphDustbinId] = useState<string | null>(null);
  const [selectedGraphDustbinName, setSelectedGraphDustbinName] = useState<string>('');
  const [dustbins, setDustbins] = useState<DustbinData[]>(mockDustbins);
  const [manageDialogMode, setManageDialogMode] = useState<'add' | 'remove' | 'edit' | null>(null);
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(new Set());

  const filteredDustbins = dustbins.filter(dustbin => 
    dustbin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dustbin.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dustbin.id.includes(searchQuery)
  );

  const [selectedWetWasteFillLevel, setSelectedWetWasteFillLevel] = useState<number | undefined>(undefined);
  const [selectedDryWasteFillLevel, setSelectedDryWasteFillLevel] = useState<number | undefined>(undefined);

  // Generate notifications for critically full dustbins (>= 80%)
  // Dynamically updates when dustbins state changes
  // Filter out dismissed notifications
  const notifications = dustbins
    .filter(dustbin => dustbin.overallFillLevel >= 80 && !dismissedNotifications.has(dustbin.id))
    .map(dustbin => ({
      id: dustbin.id,
      dustbinName: dustbin.name,
      dustbinLocation: dustbin.location,
      fillLevel: dustbin.overallFillLevel,
      timestamp: dustbin.lastUpdated,
      timeAgo: dustbin.lastUpdated,
      criticalTimestamp: dustbin.criticalTimestamp || Date.now()
    }))
    .sort((a, b) => {
      // Sort by timestamp descending (most recent/latest first, oldest last)
      return b.criticalTimestamp - a.criticalTimestamp;
    });

  const handleCardClick = (dustbin: DustbinData) => {
    // Update graph to show this dustbin's data
    setSelectedGraphDustbinId(dustbin.id);
    setSelectedGraphDustbinName(dustbin.name);
    setSelectedWetWasteFillLevel(dustbin.wetWasteFillLevel);
    setSelectedDryWasteFillLevel(dustbin.dryWasteFillLevel);
  };

  const handleClearGraphSelection = () => {
    setSelectedGraphDustbinId(null);
    setSelectedGraphDustbinName('');
    setSelectedWetWasteFillLevel(undefined);
    setSelectedDryWasteFillLevel(undefined);
  };

  const handleAddDustbin = (location: string) => {
    // Generate next ID by finding the highest current ID and incrementing
    const maxId = Math.max(...dustbins.map(d => parseInt(d.id)));
    const newId = String(maxId + 1).padStart(3, '0');
    
    const newDustbin: DustbinData = {
      id: newId,
      name: `Dustbin #${newId}`,
      location: location,
      overallFillLevel: 0,
      wetWasteFillLevel: 0,
      dryWasteFillLevel: 0,
      lastUpdated: 'Just now'
    };

    setDustbins([...dustbins, newDustbin]);
    toast.success(`Dustbin #${newId} added successfully at ${location}`);
  };

  const handleRemoveDustbin = (dustbinIds: string[]) => {
    const removedNames = dustbinIds.map(id => dustbins.find(d => d.id === id)?.name).filter(Boolean);
    
    // Filter out removed dustbins
    const remainingDustbins = dustbins.filter(d => !dustbinIds.includes(d.id));
    
    // Renumber all dustbins sequentially
    const renumberedDustbins = remainingDustbins.map((dustbin, index) => {
      const newId = String(index + 1).padStart(3, '0');
      return {
        ...dustbin,
        id: newId,
        name: `Dustbin #${newId}`
      };
    });
    
    setDustbins(renumberedDustbins);
    
    if (dustbinIds.length === 1) {
      toast.success(`${removedNames[0]} removed successfully. Remaining dustbins renumbered.`);
    } else {
      toast.success(`${dustbinIds.length} dustbins removed successfully. Remaining dustbins renumbered.`);
    }
    
    // Clear selection if any removed dustbin was selected
    if (dustbinIds.includes(selectedGraphDustbinId || '')) {
      handleClearGraphSelection();
    }
  };

  const handleEditDustbin = (dustbinId: string, newLocation: string) => {
    setDustbins(dustbins.map(d => 
      d.id === dustbinId 
        ? { ...d, location: newLocation }
        : d
    ));
    
    const dustbin = dustbins.find(d => d.id === dustbinId);
    if (dustbin) {
      toast.success(`${dustbin.name} location updated to ${newLocation}`);
    }
  };

  const openManageDialog = (mode: 'add' | 'remove' | 'edit') => {
    setManageDialogMode(mode);
    setManageDialogOpen(true);
  };

  const handleClearAllNotifications = () => {
    const allCriticalIds = dustbins
      .filter(dustbin => dustbin.overallFillLevel >= 80)
      .map(dustbin => dustbin.id);
    
    setDismissedNotifications(new Set(allCriticalIds));
    toast.success('All notifications cleared');
  };

  const handleRemoveNotification = (notificationId: string) => {
    setDismissedNotifications(prev => new Set([...prev, notificationId]));
    const dustbin = dustbins.find(d => d.id === notificationId);
    if (dustbin) {
      toast.success(`Notification for ${dustbin.name} dismissed`);
    }
  };

  const handleRefresh = async () => {
    // Simulate API refresh
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const currentTime = Date.now();
    
    // Update all dustbins with "Just now" timestamp
    // Simulate dynamic changes: randomly update some fill levels
    setDustbins(prevDustbins => 
      prevDustbins.map(dustbin => {
        // Randomly increase some fill levels slightly (simulating real-time updates)
        const randomChange = Math.random() > 0.7 ? Math.floor(Math.random() * 3) : 0;
        const newFillLevel = Math.min(100, dustbin.overallFillLevel + randomChange);
        const wasCritical = dustbin.overallFillLevel >= 80;
        const isCritical = newFillLevel >= 80;
        
        return {
          ...dustbin,
          overallFillLevel: newFillLevel,
          lastUpdated: 'Just now',
          // Update critical timestamp if it just became critical
          criticalTimestamp: !wasCritical && isCritical ? currentTime : dustbin.criticalTimestamp
        };
      })
    );
    
    // Clear dismissed notifications for dustbins that are no longer critical
    setDismissedNotifications(prev => {
      const newDismissed = new Set(prev);
      prev.forEach(id => {
        const dustbin = dustbins.find(d => d.id === id);
        if (dustbin && dustbin.overallFillLevel < 80) {
          newDismissed.delete(id);
        }
      });
      return newDismissed;
    });
    
    toast.success('Dustbin data refreshed successfully');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Header 
        onRefresh={handleRefresh} 
        notifications={notifications}
        onClearAllNotifications={handleClearAllNotifications}
        onRemoveNotification={handleRemoveNotification}
        isDarkMode={isDarkMode}
        onToggleDarkMode={onToggleDarkMode}
        onLogout={onLogout}
        userName={userName}
        userEmail={userEmail}
      />
      
      <main className="max-w-7xl mx-auto px-6">
        {/* Page Header */}
        <div className="py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-gray-900 dark:text-gray-100 mb-2">All Dustbins</h1>
              <p className="text-gray-600 dark:text-gray-300">
                Monitoring {dustbins.length} dustbin{dustbins.length !== 1 ? 's' : ''} across the city
              </p>
            </div>
            
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by ID or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 dark:text-gray-100"
              />
            </div>
          </div>
        </div>

        {/* Tips Carousel Section */}
        <section className="py-8">
          <TipsCarousel />
        </section>

        {/* Analytics Graph Section */}
        <AnalyticsGraph 
          selectedDustbinId={selectedGraphDustbinId}
          selectedDustbinName={selectedGraphDustbinName}
          onViewAll={handleClearGraphSelection}
          wetWasteFillLevel={selectedWetWasteFillLevel}
          dryWasteFillLevel={selectedDryWasteFillLevel}
          onManageAdd={() => openManageDialog('add')}
          onManageRemove={() => openManageDialog('remove')}
          onManageEdit={() => openManageDialog('edit')}
          dustbins={dustbins}
        />

        {/* Manage Dustbin Dialog */}
        <ManageDustbinDialog
          mode={manageDialogMode}
          open={manageDialogOpen}
          onOpenChange={setManageDialogOpen}
          dustbins={dustbins}
          onAdd={handleAddDustbin}
          onRemove={handleRemoveDustbin}
          onEdit={handleEditDustbin}
        />

        {/* Dustbins Grid */}
        <div className="pb-12">
          {filteredDustbins.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No dustbins found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredDustbins.map((dustbin) => (
                <DustbinCard
                  key={dustbin.id}
                  dustbin={dustbin}
                  onClick={() => handleCardClick(dustbin)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
