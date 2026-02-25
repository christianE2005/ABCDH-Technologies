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
          bg: 'bg-[#00C853]/10',
          text: 'text-[#00C853]',
          border: 'border-[#00C853]/30',
          dot: 'bg-[#00C853]',
          label: text || 'En tiempo'
        };
      case 'warning':
      case 'at_risk':
        return {
          bg: 'bg-[#FFC107]/10',
          text: 'text-[#FFC107]',
          border: 'border-[#FFC107]/30',
          dot: 'bg-[#FFC107]',
          label: text || 'En riesgo'
        };
      case 'danger':
      case 'delayed':
        return {
          bg: 'bg-[#FF3D3D]/10',
          text: 'text-[#FF3D3D]',
          border: 'border-[#FF3D3D]/30',
          dot: 'bg-[#FF3D3D]',
          label: text || 'Retrasado'
        };
      case 'info':
        return {
          bg: 'bg-[#2196F3]/10',
          text: 'text-[#2196F3]',
          border: 'border-[#2196F3]/30',
          dot: 'bg-[#2196F3]',
          label: text || 'Info'
        };
      default:
        return {
          bg: 'bg-muted/10',
          text: 'text-muted-foreground',
          border: 'border-muted/30',
          dot: 'bg-muted-foreground',
          label: text || 'Neutral'
        };
    }
  };

  const config = getStatusConfig();
  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses} font-medium`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
      {config.label}
    </span>
  );
}