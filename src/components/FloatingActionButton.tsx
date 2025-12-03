import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingActionButtonProps {
  label?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function FloatingActionButton({ 
  label = "Create Hype", 
  icon,
  onClick,
  className 
}: FloatingActionButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "fixed bottom-24 right-4 z-50",
        "flex items-center gap-2 px-5 py-3",
        "bg-gradient-hype text-white font-semibold",
        "rounded-full shadow-lg shadow-primary/30",
        "hover:shadow-xl hover:shadow-primary/40",
        "active:scale-95 transition-all duration-200",
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {icon || <Plus className="w-5 h-5" />}
      <span>{label}</span>
    </motion.button>
  );
}
