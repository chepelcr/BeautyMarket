import { motion } from 'framer-motion';

interface ProgressIndicatorProps {
  label: string;
  current: number;
  goal: number;
  unit?: string;
  color?: 'red' | 'orange';
}

export default function ProgressIndicator({
  label,
  current,
  goal,
  unit = '',
  color = 'red',
}: ProgressIndicatorProps) {
  const percentage = Math.min((current / goal) * 100, 100);
  const isComplete = current >= goal;

  const colorClasses = {
    red: {
      bg: 'bg-red-600',
      text: 'text-red-600',
      gradient: 'from-red-600 to-orange-600',
    },
    orange: {
      bg: 'bg-orange-600',
      text: 'text-orange-600',
      gradient: 'from-orange-600 to-red-600',
    },
  };

  const colors = colorClasses[color];

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="font-bold text-gray-900 uppercase tracking-wide text-sm">
          {label}
        </span>
        <span className={`font-black ${colors.text}`}>
          {current} / {goal} {unit}
        </span>
      </div>

      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full bg-gradient-to-r ${colors.gradient} relative`}
        >
          {isComplete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-white/30"
            />
          )}
        </motion.div>
      </div>

      {isComplete && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs font-bold text-green-600"
        >
          GOAL ACHIEVED!
        </motion.div>
      )}
    </div>
  );
}
