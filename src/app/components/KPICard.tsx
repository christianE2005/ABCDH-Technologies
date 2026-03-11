import { ReactNode } from 'react';
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
  status: _status = 'neutral'
}: KPICardProps) {
  void _status;
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-3.5 h-3.5" />;
    if (trend === 'down') return <TrendingDown className="w-3.5 h-3.5" />;
    return <Minus className="w-3.5 h-3.5" />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-success';
    if (trend === 'down') return 'text-destructive';
    return 'text-muted-foreground';
  };

  return (
    <div className="group relative overflow-hidden bg-card border border-border rounded-lg p-5 transition-all duration-300 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide mb-2">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-foreground tracking-tight">{value}</h3>
            {trendValue && (
              <span className={`flex items-center gap-0.5 text-xs font-semibold ${getTrendColor()} px-1.5 py-0.5 rounded-full ${
                trend === 'up' ? 'bg-success/10' : trend === 'down' ? 'bg-destructive/10' : 'bg-muted'
              }`}>
                {getTrendIcon()}
                {trendValue}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-muted-foreground text-xs mt-1.5">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center text-primary/70 group-hover:bg-primary/15 group-hover:text-primary transition-all duration-300">
            {icon}
          </div>
        )}
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}