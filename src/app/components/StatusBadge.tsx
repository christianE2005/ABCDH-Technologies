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
        return {
          classes: 'bg-success/10 text-success',
          label: text || 'En tiempo'
        };
      case 'warning':
      case 'at_risk':
        return {
          classes: 'bg-warning/10 text-warning',
          label: text || 'En riesgo'
        };
      case 'danger':
      case 'delayed':
        return {
          classes: 'bg-destructive/10 text-destructive',
          label: text || 'Retrasado'
        };
      case 'info':
        return {
          classes: 'bg-primary/10 text-primary',
          label: text || 'Info'
        };
      default:
        return {
          classes: 'bg-muted text-muted-foreground',
          label: text || 'Neutral'
        };
    }
  };

  const config = getStatusConfig();
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md ${config.classes} ${sizeClasses} font-medium transition-colors`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {config.label}
    </span>
  );
}