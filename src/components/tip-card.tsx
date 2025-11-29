import { LucideIcon } from 'lucide-react';
import { Card } from './ui/card';

interface TipCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export default function TipCard({ icon: Icon, title, description }: TipCardProps) {
  return (
    <Card className="p-6 bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow duration-300 border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col gap-4">
        <div className="bg-green-100 dark:bg-green-900/30 w-12 h-12 rounded-lg flex items-center justify-center">
          <Icon className="w-6 h-6 text-green-600 dark:text-green-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-green-700 dark:text-green-500">{title}</h3>
          <p className="text-gray-600 dark:text-gray-300">{description}</p>
        </div>
      </div>
    </Card>
  );
}
