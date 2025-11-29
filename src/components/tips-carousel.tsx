import { useState, useEffect, useRef } from 'react';
import { Recycle, Leaf, TrendingDown, BarChart3, Clock, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from './ui/card';
import { LucideIcon } from 'lucide-react';

interface Tip {
  icon: LucideIcon;
  title: string;
  description: string;
}

const allTips: Tip[] = [
  {
    icon: Recycle,
    title: "Smart Sorting",
    description: "Improve recycling rates by monitoring waste classification in real-time and identifying areas that need better sorting education."
  },
  {
    icon: Leaf,
    title: "Reduce Overflow",
    description: "Prevent bin overflow and environmental hazards by tracking fill levels and optimizing collection schedules based on actual usage."
  },
  {
    icon: TrendingDown,
    title: "Lower Costs",
    description: "Reduce unnecessary collection trips and fuel costs by only dispatching trucks when bins reach optimal capacity levels."
  },
  {
    icon: BarChart3,
    title: "Data Insights",
    description: "Analyze waste generation patterns across locations to make informed decisions about bin placement and sizing."
  },
  {
    icon: Clock,
    title: "Timely Collection",
    description: "Receive instant alerts when bins approach capacity, ensuring timely collection and maintaining cleanliness standards."
  },
  {
    icon: MapPin,
    title: "Area Monitoring",
    description: "Track performance across different zones and identify high-traffic areas that require more frequent service or larger bins."
  },
  {
    icon: Recycle,
    title: "Waste Segregation",
    description: "Separate wet and dry waste at source to improve recycling efficiency and reduce contamination in recyclable materials."
  },
  {
    icon: TrendingDown,
    title: "Route Optimization",
    description: "Use real-time fill data to plan the most efficient collection routes, saving time and reducing vehicle emissions."
  },
  {
    icon: BarChart3,
    title: "Predictive Analytics",
    description: "Leverage historical data to predict fill patterns and proactively schedule maintenance before issues arise."
  },
  {
    icon: Leaf,
    title: "Environmental Impact",
    description: "Monitor and reduce your carbon footprint by tracking collection efficiency and promoting sustainable waste practices."
  },
  {
    icon: Clock,
    title: "Real-Time Monitoring",
    description: "Get live updates on bin status across all locations, enabling faster response times and better resource allocation."
  },
  {
    icon: MapPin,
    title: "Smart Placement",
    description: "Identify optimal locations for new bins based on usage patterns and community needs to maximize service coverage."
  },
  {
    icon: Recycle,
    title: "Contamination Alerts",
    description: "Detect when wrong materials are placed in recycling bins and take corrective action to maintain recycling quality."
  },
  {
    icon: TrendingDown,
    title: "Cost Tracking",
    description: "Monitor operational expenses per collection and identify cost-saving opportunities through data-driven insights."
  },
  {
    icon: BarChart3,
    title: "Performance Metrics",
    description: "Track key performance indicators like collection frequency, fill rates, and response times to improve service quality."
  }
];

// Function to randomly select 6 tips
const getRandomTips = (count: number = 6): Tip[] => {
  const shuffled = [...allTips].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

export default function TipsCarousel() {
  const [tips] = useState<Tip[]>(() => getRandomTips(6)); // Initialize with random 6 tips
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      if (!isPaused) {
        goToNext();
      }
    }, 5000);
  };

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPaused, currentIndex]);

  const goToNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % tips.length);
    setTimeout(() => setIsTransitioning(false), 400);
  };

  const goToPrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + tips.length) % tips.length);
    setTimeout(() => setIsTransitioning(false), 400);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 400);
    startTimer();
  };

  const currentTip = tips[currentIndex];
  const Icon = currentTip.icon;

  return (
    <div 
      className="relative w-full max-w-4xl mx-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <Card className="p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md overflow-hidden min-h-[180px]">
        <div
          className={`transition-opacity duration-400 ${
            isTransitioning ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <div className="flex items-start gap-6">
            <div className="bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0">
              <Icon className="w-8 h-8 text-green-600 dark:text-green-500" />
            </div>
            <div className="flex-1 space-y-3">
              <h3 className="text-green-700 dark:text-green-500">{currentTip.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{currentTip.description}</p>
            </div>
          </div>
        </div>

        {/* Navigation Arrows - shown on hover */}
        <div className="opacity-0 hover:opacity-100 transition-opacity">
          <button
            onClick={goToPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow-md flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 transition-all"
            aria-label="Previous tip"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow-md flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 transition-all"
            aria-label="Next tip"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </Card>

      {/* Navigation Dots */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {tips.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-green-600 w-8'
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Go to tip ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
