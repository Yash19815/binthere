import { MapPin, Clock, AlertCircle, Battery, Wrench } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

export interface DustbinData {
  id: string;
  name: string;
  location: string;
  overallFillLevel: number;
  wetWasteFillLevel: number;
  dryWasteFillLevel: number;
  lastUpdated: string;
  criticalTimestamp?: number; // Timestamp when dustbin became critically full
  batteryLevel?: number; // Battery percentage (0-100)
  lastMaintenance?: string; // Last maintenance check date/time
}

interface DustbinCardProps {
  dustbin: DustbinData;
  onClick: () => void;
}

function getFillLevelColor(percentage: number): string {
  if (percentage >= 80) return 'text-red-600';
  if (percentage >= 60) return 'text-yellow-600';
  return 'text-green-600';
}

function getFillLevelBgColor(percentage: number): string {
  if (percentage >= 80) return 'bg-red-600';
  if (percentage >= 60) return 'bg-yellow-600';
  return 'bg-green-600';
}

function getBatteryColor(percentage: number): string {
  if (percentage <= 20) return 'text-red-600';
  if (percentage <= 40) return 'text-yellow-600';
  return 'text-green-600';
}

function getBatteryBgColor(percentage: number): string {
  if (percentage <= 20) return 'bg-red-100';
  if (percentage <= 40) return 'bg-yellow-100';
  return 'bg-green-100';
}

export default function DustbinCard({ dustbin, onClick }: DustbinCardProps) {
  const hasAlert = dustbin.wetWasteFillLevel >= 80 || dustbin.dryWasteFillLevel >= 80;
  const batteryLevel = dustbin.batteryLevel ?? 100; // Default to 100% if not provided
  
  return (
    <Card 
      className="p-6 bg-white dark:bg-gray-800 hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-700 hover:-translate-y-1 relative"
      onClick={onClick}
    >
      {/* Battery Level - Top Left */}
      <div className={`absolute -top-2 transition-all duration-300 ${hasAlert ? '-left-2' : 'left-4'}`}>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${getBatteryBgColor(batteryLevel)} dark:bg-opacity-20 border border-gray-200 dark:border-gray-600 shadow-sm`}>
          <Battery className={`w-3 h-3 ${getBatteryColor(batteryLevel)}`} />
          <span className={`text-xs ${getBatteryColor(batteryLevel)}`}>
            {batteryLevel}%
          </span>
        </div>
      </div>

      {/* Critical Alert Badge - Top Right */}
      {hasAlert && (
        <div className="absolute -top-2 -right-2">
          <Badge className="bg-red-600 text-white rounded-full w-6 h-6 p-0 flex items-center justify-center animate-pulse">
            !
          </Badge>
        </div>
      )}
      
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-gray-900 dark:text-gray-100 mb-1">{dustbin.name}</h3>
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{dustbin.location}</span>
            </div>
          </div>
          {hasAlert && (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-300">Overall Fill Level</span>
            <span className={`${getFillLevelColor(dustbin.overallFillLevel)}`}>
              {dustbin.overallFillLevel}%
            </span>
          </div>
          <div className="relative h-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${getFillLevelBgColor(dustbin.overallFillLevel)}`}
              style={{ width: `${dustbin.overallFillLevel}%` }}
            />
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Updated {dustbin.lastUpdated}</span>
          </div>
          {dustbin.lastMaintenance && (
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <Wrench className="w-4 h-4" />
              <span className="text-sm">Maintenance: {dustbin.lastMaintenance}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
