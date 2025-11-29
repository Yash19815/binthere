import { MapPin, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { DustbinData } from './dustbin-card';

interface DustbinDetailModalProps {
  dustbin: DustbinData | null;
  isOpen: boolean;
  onClose: () => void;
}

interface CollectionRecord {
  wasteType: string;
  area: string;
  timestamp: string;
  frequency: string;
}

export default function DustbinDetailModal({ dustbin, isOpen, onClose }: DustbinDetailModalProps) {
  if (!dustbin) return null;

  const hasAlert = dustbin.wetWasteFillLevel >= 90 || dustbin.dryWasteFillLevel >= 90;

  // Mock collection data
  const collectionRecords: CollectionRecord[] = [
    {
      wasteType: 'Wet Waste',
      area: dustbin.location,
      timestamp: '2 days ago',
      frequency: '3x per week'
    },
    {
      wasteType: 'Dry Waste',
      area: dustbin.location,
      timestamp: '3 days ago',
      frequency: '2x per week'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <div>
              <div className="text-gray-900 dark:text-gray-100">{dustbin.name}</div>
              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 mt-1">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{dustbin.location}</span>
              </div>
            </div>
          </DialogTitle>
          <DialogDescription className="dark:text-gray-300">
            View collection history and details for this dustbin. Check the graph below for fill count trends.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Alert Banner */}
          {hasAlert && (
            <Alert className="bg-red-50 border-red-200">
              <AlertDescription className="text-red-800">
                Critical Alert: Dustbin has reached critical capacity ({dustbin.overallFillLevel}%). 
                Immediate collection recommended.
              </AlertDescription>
            </Alert>
          )}

          {/* Data Collection Display */}
          <div className="space-y-4">
            <h3 className="text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Collection History
            </h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm text-gray-700">Waste Type</th>
                    <th className="px-4 py-3 text-left text-sm text-gray-700">Area</th>
                    <th className="px-4 py-3 text-left text-sm text-gray-700">Last Collection</th>
                    <th className="px-4 py-3 text-left text-sm text-gray-700">Frequency</th>
                  </tr>
                </thead>
                <tbody>
                  {collectionRecords.map((record, index) => (
                    <tr key={index} className="border-t border-gray-200">
                      <td className="px-4 py-3 text-sm text-gray-900">{record.wasteType}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{record.area}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{record.timestamp}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{record.frequency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
