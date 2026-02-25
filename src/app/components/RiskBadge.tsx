interface RiskBadgeProps {
  risk: 'low' | 'medium' | 'high';
}

export function RiskBadge({ risk }: RiskBadgeProps) {
  const getColor = () => {
    switch (risk) {
      case 'low':
        return 'bg-[#00C853]/10 text-[#00C853] border-[#00C853]/20';
      case 'medium':
        return 'bg-[#FFC107]/10 text-[#FFC107] border-[#FFC107]/20';
      case 'high':
        return 'bg-[#FF3D3D]/10 text-[#FF3D3D] border-[#FF3D3D]/20';
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
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getColor()}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {getLabel()}
    </span>
  );
}
