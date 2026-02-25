import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus
} from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: ReactNode;
  status?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}

export function KPICard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  trendValue,
  icon,
  status = 'neutral'
}: KPICardProps) {
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-[#00C853]';
    if (trend === 'down') return 'text-[#FF3D3D]';
    return 'text-muted-foreground';
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'border-l-[#00C853]';
      case 'warning': return 'border-l-[#FFC107]';
      case 'danger': return 'border-l-[#FF3D3D]';
      case 'info': return 'border-l-[#2196F3]';
      default: return 'border-l-transparent';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-all duration-300 border-l-4 ${getStatusColor()}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-muted-foreground text-sm mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-foreground">{value}</h3>
            {trendValue && (
              <span className={`flex items-center gap-1 text-sm ${getTrendColor()}`}>
                {getTrendIcon()}
                {trendValue}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-muted-foreground text-xs mt-1">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="text-primary opacity-80">
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
}