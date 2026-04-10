interface StatusBadgeProps {
  status: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'on_track' | 'at_risk' | 'delayed';
  text?: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, text, size = 'md' }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'success':
      case 'on_track':
        return { dot: 'bg-success', label: text || 'En tiempo' };
      case 'warning':
      case 'at_risk':
        return { dot: 'bg-warning', label: text || 'En riesgo' };
      case 'danger':
      case 'delayed':
        return { dot: 'bg-destructive', label: text || 'Retrasado' };
      case 'info':
        return { dot: 'bg-info', label: text || 'Info' };
      default:
        return { dot: 'bg-muted-foreground', label: text || 'Neutral' };
    }
  };

  const config = getStatusConfig();
  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-[11px]' : 'px-2 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded border border-border bg-transparent text-muted-foreground ${sizeClasses} font-medium`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />
      {config.label}
    </span>
  );
}