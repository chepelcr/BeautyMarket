import { motion } from 'framer-motion';
import { Award, Trophy, Target, Zap, Star, Medal } from 'lucide-react';
import { ReactNode } from 'react';

interface AchievementBadgeProps {
  title: string;
  description: string;
  icon?: 'award' | 'trophy' | 'target' | 'zap' | 'star' | 'medal';
  unlocked?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const icons: Record<string, ReactNode> = {
  award: <Award className="w-full h-full" />,
  trophy: <Trophy className="w-full h-full" />,
  target: <Target className="w-full h-full" />,
  zap: <Zap className="w-full h-full" />,
  star: <Star className="w-full h-full" />,
  medal: <Medal className="w-full h-full" />,
};

const sizeClasses = {
  sm: {
    container: 'w-16 h-16',
    icon: 'w-8 h-8',
    title: 'text-xs',
    desc: 'text-xs',
  },
  md: {
    container: 'w-24 h-24',
    icon: 'w-12 h-12',
    title: 'text-sm',
    desc: 'text-xs',
  },
  lg: {
    container: 'w-32 h-32',
    icon: 'w-16 h-16',
    title: 'text-base',
    desc: 'text-sm',
  },
};

export default function AchievementBadge({
  title,
  description,
  icon = 'award',
  unlocked = false,
  size = 'md',
}: AchievementBadgeProps) {
  const sizes = sizeClasses[size];

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="text-center"
    >
      <motion.div
        initial={{ rotate: 0 }}
        whileHover={{ rotate: [0, -5, 5, -5, 0] }}
        transition={{ duration: 0.5 }}
        className={`${sizes.container} mx-auto mb-3 rounded-full flex items-center justify-center relative ${
          unlocked
            ? 'bg-gradient-to-br from-red-600 to-orange-600 shadow-lg'
            : 'bg-gray-300'
        }`}
      >
        <div
          className={`${sizes.icon} ${
            unlocked ? 'text-white' : 'text-gray-500'
          }`}
        >
          {icons[icon]}
        </div>

        {unlocked && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white"
          >
            <Star className="w-4 h-4 text-white fill-white" />
          </motion.div>
        )}

        {!unlocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 rounded-full">
            <span className="text-white text-xs font-bold">LOCKED</span>
          </div>
        )}
      </motion.div>

      <h3
        className={`font-black ${sizes.title} mb-1 ${
          unlocked ? 'text-gray-900' : 'text-gray-500'
        }`}
      >
        {title}
      </h3>
      <p
        className={`${sizes.desc} ${
          unlocked ? 'text-gray-600' : 'text-gray-400'
        }`}
      >
        {description}
      </p>
    </motion.div>
  );
}
