import { Trophy, Flame, Award, Lock, Star } from 'lucide-react';
import type { ApiBadge, ApiUserBadge, ApiGamificationProfile, ApiLeaderboardEntry } from '../../services';

// Tier → color (1 bronze, 2 silver, 3 gold), fallback indigo.
const TIER_COLOR: Record<number, string> = { 1: '#b45309', 2: '#9ca3af', 3: '#eab308' };
function tierColor(tier: number): string {
  return TIER_COLOR[tier] ?? '#6366f1';
}

// Backend icon may be an emoji or a name; show short strings (emoji), otherwise a generic award icon.
function renderBadgeGlyph(icon: string | null | undefined, size = 'w-4 h-4') {
  const value = (icon ?? '').trim();
  if (value && value.length <= 3) return <span className="leading-none text-[14px]">{value}</span>;
  return <Award className={size} />;
}

export function LevelProgress({ profile }: { profile: ApiGamificationProfile }) {
  const into = Math.max(0, profile.xp_into_level ?? 0);
  const need = Math.max(0, profile.xp_for_next_level ?? 0);
  const level = profile.level ?? 0;
  const totalXp = profile.total_xp ?? 0;
  const currentStreak = profile.current_streak ?? 0;
  const longestStreak = profile.longest_streak ?? 0;
  const pct = need > 0 ? Math.min(100, Math.round((into / need) * 100)) : 100;
  return (
    <div className="flex items-center gap-4">
      <div className="relative w-14 h-14 shrink-0 rounded-full bg-primary/10 border border-primary/30 flex flex-col items-center justify-center">
        <span className="text-[16px] font-bold text-primary leading-none tabular-nums">{level}</span>
        <span className="text-[8px] text-muted-foreground uppercase tracking-wider">nivel</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between text-[11px] mb-1">
          <span className="font-medium text-foreground inline-flex items-center gap-1.5">
            <Star className="w-3 h-3 text-primary" /> {totalXp.toLocaleString()} XP
          </span>
          <span className="text-muted-foreground tabular-nums">{need > 0 ? `${into}/${need} al nivel ${level + 1}` : 'Nivel máximo'}</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Flame className={`w-3 h-3 ${currentStreak > 0 ? 'text-amber-500' : ''}`} />
            Racha: <span className="font-medium text-foreground">{currentStreak}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <Trophy className="w-3 h-3" />
            Mejor racha: <span className="font-medium text-foreground">{longestStreak}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export function BadgeGrid({ catalog, userBadges }: { catalog: ApiBadge[]; userBadges: ApiUserBadge[] }) {
  // A row counts as earned only when it has an unlock date; rows without one are in-progress.
  const earned = new Map<number, ApiUserBadge>();
  const progressById = new Map<number, number>();
  userBadges.forEach((ub) => {
    if (!ub?.badge) return;
    if (ub.unlocked_at) earned.set(ub.badge.id_badge, ub);
    if (ub.progress != null) progressById.set(ub.badge.id_badge, ub.progress);
  });
  const badges = catalog.filter((b) => b.is_active);

  if (badges.length === 0) {
    return <p className="text-[11px] text-muted-foreground">No hay insignias configuradas todavía.</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {badges
        .slice()
        .sort((a, b) => Number(earned.has(b.id_badge)) - Number(earned.has(a.id_badge)) || a.tier - b.tier)
        .map((badge) => {
          const unlock = earned.get(badge.id_badge);
          const isEarned = !!unlock;
          const color = tierColor(badge.tier);
          return (
            <div
              key={badge.id_badge}
              title={badge.description}
              className={`flex items-center gap-2.5 rounded-md border px-2.5 py-2 transition-colors ${
                isEarned ? 'border-border bg-card' : 'border-dashed border-border bg-surface-secondary/30'
              }`}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={isEarned
                  ? { backgroundColor: `${color}22`, color }
                  : { backgroundColor: 'var(--secondary)', color: 'var(--muted-foreground)' }}
              >
                {isEarned ? renderBadgeGlyph(badge.icon) : <Lock className="w-3.5 h-3.5" />}
              </div>
              <div className="min-w-0">
                <p className={`text-[11px] font-medium truncate ${isEarned ? 'text-foreground' : 'text-muted-foreground'}`}>{badge.name}</p>
                <p className="text-[9px] text-muted-foreground truncate">
                  {isEarned
                    ? (unlock?.unlocked_at ? `Obtenida ${unlock.unlocked_at.slice(0, 10)}` : 'Obtenida')
                    : progressById.has(badge.id_badge)
                      ? `Progreso: ${progressById.get(badge.id_badge)}`
                      : badge.xp_reward > 0 ? `+${badge.xp_reward} XP` : 'Bloqueada'}
                </p>
              </div>
            </div>
          );
        })}
    </div>
  );
}

export function Leaderboard({ entries, currentUserId }: { entries: ApiLeaderboardEntry[]; currentUserId?: number | null }) {
  if (entries.length === 0) {
    return <p className="text-[11px] text-muted-foreground py-2">Aún no hay datos para el ranking.</p>;
  }
  const medal = (rank: number) => (rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null);
  return (
    <div className="divide-y divide-border">
      {entries.map((e) => {
        const isMe = currentUserId != null && e.user === currentUserId;
        return (
          <div
            key={e.user}
            className={`flex items-center gap-3 px-3 py-2 ${isMe ? 'bg-primary/5' : ''}`}
          >
            <span className="w-6 text-center text-[12px] font-semibold tabular-nums shrink-0">
              {medal(e.rank) ?? e.rank}
            </span>
            <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[11px] font-medium shrink-0">
              {(e.username || '?').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-foreground truncate">
                {e.username || `Usuario #${e.user}`}{isMe && <span className="text-[10px] text-primary ml-1">(tú)</span>}
              </p>
              <p className="text-[10px] text-muted-foreground">Nivel {e.level ?? 0}</p>
            </div>
            <span className="text-[11px] font-semibold text-foreground tabular-nums shrink-0">{(e.total_xp ?? 0).toLocaleString()} XP</span>
          </div>
        );
      })}
    </div>
  );
}
