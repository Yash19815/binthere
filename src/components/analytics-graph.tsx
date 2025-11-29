import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Plus, Trash2, Edit } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface DustbinData {
  id: string;
  name: string;
  location: string;
  overallFillLevel: number;
  wetWasteFillLevel: number;
  dryWasteFillLevel: number;
  lastUpdated: string;
  criticalTimestamp?: number;
}

interface AnalyticsGraphProps {
  selectedDustbinId: string | null;
  selectedDustbinName?: string;
  onViewAll?: () => void;
  wetWasteFillLevel?: number;
  dryWasteFillLevel?: number;
  onManageAdd?: () => void;
  onManageRemove?: () => void;
  onManageEdit?: () => void;
  dustbins: DustbinData[];
}

// Generate time period options dynamically
const getTimePeriodOptions = () => {
  const options = [
    { value: 'last-week', label: 'Last Week' },
    { value: 'last-month', label: 'Last Month' }
  ];

  // Get current date
  const now = new Date();
  const currentMonth = now.getMonth(); // 0-11
  const currentYear = now.getFullYear();

  // Add months from previous month down to January (descending order)
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  
  for (let month = currentMonth - 1; month >= 0; month--) {
    options.push({
      value: `month-${month}`,
      label: `${monthNames[month]} ${currentYear}`
    });
  }

  return options;
};

// Generate dates for a given period
const generateDatesForPeriod = (period: string) => {
  const now = new Date(2025, 9, 27); // October 27, 2025 (month is 0-indexed)
  const dates: string[] = [];

  if (period === 'last-week') {
    // Last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const monthName = date.toLocaleString('en', { month: 'short' });
      const day = date.getDate();
      dates.push(`${monthName} ${day}`);
    }
  } else if (period === 'last-month') {
    // Last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const monthName = date.toLocaleString('en', { month: 'short' });
      const day = date.getDate();
      dates.push(`${monthName} ${day}`);
    }
  } else if (period.startsWith('month-')) {
    // Specific month
    const monthIndex = parseInt(period.split('-')[1]);
    const year = 2025;
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, monthIndex, day);
      const monthName = date.toLocaleString('en', { month: 'short' });
      dates.push(`${monthName} ${day}`);
    }
  }

  return dates;
};

// Generate base pattern for individual dustbin (normalized per dustbin)
const generateDustbinPattern = (dustbinId: string, dates: string[]) => {
  // Create a consistent but varied pattern based on dustbin ID
  const seed = parseInt(dustbinId) || 1;
  const baseWet = 2 + (seed % 4);
  const baseDry = 2 + ((seed + 1) % 4);
  
  return dates.map((date, index) => {
    // Add some variation based on index
    const variation = Math.sin(index * 0.5) * 1.5;
    return {
      date,
      wetWaste: Math.max(1, Math.round(baseWet + variation + (index % 3))),
      dryWaste: Math.max(1, Math.round(baseDry + variation + ((index + 1) % 3)))
    };
  });
};

export default function AnalyticsGraph({ selectedDustbinId, selectedDustbinName, onViewAll, wetWasteFillLevel, dryWasteFillLevel, onManageAdd, onManageRemove, onManageEdit, dustbins }: AnalyticsGraphProps) {
  const [timePeriod, setTimePeriod] = useState('last-week');
  const timePeriodOptions = useMemo(() => getTimePeriodOptions(), []);

  // Calculate aggregated data from current dustbins
  const data = useMemo(() => {
    const dates = generateDatesForPeriod(timePeriod);
    
    if (selectedDustbinId) {
      // Return individual dustbin data
      return generateDustbinPattern(selectedDustbinId, dates);
    }
    
    // Aggregate all current dustbins
    return dates.map((date, index) => {
      let totalWet = 0;
      let totalDry = 0;
      
      dustbins.forEach(dustbin => {
        const pattern = generateDustbinPattern(dustbin.id, dates);
        totalWet += pattern[index].wetWaste;
        totalDry += pattern[index].dryWaste;
      });
      
      return {
        date,
        wetWaste: totalWet,
        dryWaste: totalDry
      };
    });
  }, [selectedDustbinId, dustbins, timePeriod]);

  const viewingLabel = selectedDustbinId && selectedDustbinName
    ? `Viewing: ${selectedDustbinName}`
    : 'Viewing: All Dustbins';

  // Get latest values (last data point)
  const latestData = data[data.length - 1];

  return (
    <section className="py-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-gray-900 dark:text-gray-100 mb-1">Garbage Collection Analytics</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">{viewingLabel}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Management Buttons */}
            <button
              onClick={onManageAdd}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
              title="Add new dustbin"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">Add</span>
            </button>
            <button
              onClick={onManageEdit}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              title="Edit dustbin location"
            >
              <Edit className="w-4 h-4" />
              <span className="text-sm">Edit</span>
            </button>
            <button
              onClick={onManageRemove}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
              title="Remove dustbin"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm">Remove</span>
            </button>
            
            {selectedDustbinId && onViewAll && (
              <button
                onClick={onViewAll}
                className="text-sm text-green-600 hover:text-green-700 hover:underline transition-colors ml-2"
              >
                View All Dustbins
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            {/* Time Period Selector */}
            <div className="mb-4">
              <Select value={timePeriod} onValueChange={setTimePeriod}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  {timePeriodOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  tick={{ fontSize: 12 }}
                  interval={timePeriod === 'last-month' || timePeriod.startsWith('month-') ? Math.ceil(data.length / 10) : 0}
                />
                <YAxis 
                  stroke="#6b7280"
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Fill Count', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#6b7280' } }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '8px 12px'
                  }}
                  labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="line"
                />
                <Line 
                  type="monotone" 
                  dataKey="wetWaste" 
                  stroke="#3b82f6" 
                  strokeWidth={2.5}
                  name="Wet Waste"
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="dryWaste" 
                  stroke="#f59e0b" 
                  strokeWidth={2.5}
                  name="Dry Waste"
                  dot={{ fill: '#f59e0b', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Current Values Display */}
          <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-center gap-6 transition-all duration-500 ease-in-out ${selectedDustbinId ? 'w-96' : 'w-48'}`}>
            <div>
              <div className="text-xs text-gray-400 dark:text-white mb-1 opacity-60">Latest</div>
              <div className="text-sm text-gray-400 dark:text-white opacity-50">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
            </div>
            
            {selectedDustbinId && wetWasteFillLevel !== undefined && dryWasteFillLevel !== undefined ? (
              <div className="flex gap-6 items-end justify-center">
                {/* Fill Count Stats */}
                <div className="flex flex-col gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full bg-blue-500 opacity-70"></div>
                      <span className="text-xs text-gray-400 opacity-60">Wet Waste</span>
                    </div>
                    <div className="text-2xl text-blue-500 opacity-50">{latestData.wetWaste}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full bg-amber-500 opacity-70"></div>
                      <span className="text-xs text-gray-400 opacity-60">Dry Waste</span>
                    </div>
                    <div className="text-2xl text-amber-500 opacity-50">{latestData.dryWaste}</div>
                  </div>
                </div>

                {/* Vertical Fill Bars - Slide in animation */}
                <div className="flex gap-4 items-end h-48 animate-in slide-in-from-right duration-500">
                  {/* Wet Waste Bar */}
                  <div className="flex flex-col items-center gap-2">
                    <div className={`relative w-12 h-40 rounded-lg overflow-hidden ${
                      wetWasteFillLevel >= 80 ? 'bg-red-100 dark:bg-red-900/20' : 
                      wetWasteFillLevel >= 60 ? 'bg-yellow-100 dark:bg-yellow-900/20' : 
                      'bg-green-100 dark:bg-green-900/20'
                    }`}>
                      <div 
                        className={`absolute bottom-0 w-full transition-all duration-700 ease-out ${
                          wetWasteFillLevel >= 80 ? 'bg-red-500' : 
                          wetWasteFillLevel >= 60 ? 'bg-yellow-500' : 
                          'bg-green-500'
                        }`}
                        style={{ height: `${wetWasteFillLevel}%` }}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-t ${
                          wetWasteFillLevel >= 80 ? 'from-red-600 to-red-400' : 
                          wetWasteFillLevel >= 60 ? 'from-yellow-600 to-yellow-400' : 
                          'from-green-600 to-green-400'
                        }`}></div>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <span className={`text-xs opacity-70 ${
                        wetWasteFillLevel >= 80 ? 'text-red-600' : 
                        wetWasteFillLevel >= 60 ? 'text-yellow-600' : 
                        'text-green-600'
                      }`}>{wetWasteFillLevel}%</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Wet Waste</span>
                    </div>
                  </div>

                  {/* Dry Waste Bar */}
                  <div className="flex flex-col items-center gap-2">
                    <div className={`relative w-12 h-40 rounded-lg overflow-hidden ${
                      dryWasteFillLevel >= 80 ? 'bg-red-100 dark:bg-red-900/20' : 
                      dryWasteFillLevel >= 60 ? 'bg-yellow-100 dark:bg-yellow-900/20' : 
                      'bg-green-100 dark:bg-green-900/20'
                    }`}>
                      <div 
                        className={`absolute bottom-0 w-full transition-all duration-700 ease-out ${
                          dryWasteFillLevel >= 80 ? 'bg-red-500' : 
                          dryWasteFillLevel >= 60 ? 'bg-yellow-500' : 
                          'bg-green-500'
                        }`}
                        style={{ height: `${dryWasteFillLevel}%` }}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-t ${
                          dryWasteFillLevel >= 80 ? 'from-red-600 to-red-400' : 
                          dryWasteFillLevel >= 60 ? 'from-yellow-600 to-yellow-400' : 
                          'from-green-600 to-green-400'
                        }`}></div>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <span className={`text-xs opacity-70 ${
                        dryWasteFillLevel >= 80 ? 'text-red-600' : 
                        dryWasteFillLevel >= 60 ? 'text-yellow-600' : 
                        'text-green-600'
                      }`}>{dryWasteFillLevel}%</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Dry Waste</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-blue-500 opacity-70"></div>
                    <span className="text-xs text-gray-400 opacity-60">Wet Waste</span>
                  </div>
                  <div className="text-2xl text-blue-500 opacity-50">{latestData.wetWaste}</div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-amber-500 opacity-70"></div>
                    <span className="text-xs text-gray-400 opacity-60">Dry Waste</span>
                  </div>
                  <div className="text-2xl text-amber-500 opacity-50">{latestData.dryWaste}</div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
