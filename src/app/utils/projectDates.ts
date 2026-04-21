import { isTerminalProjectStatus } from './projectStatus';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export function formatProjectDate(date: string | null | undefined) {
  if (!date) return '—';
  const parsed = parseISO(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return format(parsed, 'dd MMM yyyy', { locale: es });
}

export function getProjectDaysRemaining(endDate: string | null) {
  if (!endDate) return null;
  return Math.ceil((new Date(endDate).getTime() - Date.now()) / 86_400_000);
}

export function getProjectDaysLabel(endDate: string | null, status?: string | null) {
  if (!endDate) return { label: '—', cls: 'text-muted-foreground' };
  if (isTerminalProjectStatus(status)) {
    return { label: '—', cls: 'text-muted-foreground' };
  }

  const days = getProjectDaysRemaining(endDate);
  if (days === null) return { label: '—', cls: 'text-muted-foreground' };
  if (days < 0) return { label: 'Vencido', cls: 'text-destructive font-semibold' };
  if (days === 0) return { label: 'Hoy', cls: 'text-destructive font-semibold' };
  if (days <= 7) return { label: `${days}d`, cls: 'text-warning font-semibold' };
  return { label: `${days}d`, cls: 'text-muted-foreground' };
}