interface RiskBadgeProps {
  risk: 'low' | 'medium' | 'high';
}

export function RiskBadge({ risk }: RiskBadgeProps) {
  const getColor = () => {
    switch (risk) {
      case 'low':
        return 'bg-success/10 text-success';
      case 'medium':
        return 'bg-warning/10 text-warning';
      case 'high':
        return 'bg-destructive/10 text-destructive';
    }
  };

  const getLabel = () => {
    switch (risk) {
      case 'low':
        return 'Bajo';
      case 'medium':
        return 'Medio';
      case 'high':
        return 'Alto';
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium transition-colors ${getColor()}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {getLabel()}
    </span>
  );
}
