import type { IconName } from '@/components/ui';
import type { Tone } from '@/constants/theme';
import type { Update, UpdateKind } from './mock-data';

export const updateKinds: Record<UpdateKind, { label: string; description: string; icon: IconName; tone: Tone }> = {
  applied: { label: 'Applied', description: 'Sent an application', icon: 'send', tone: 'sky' },
  interview: { label: 'Interview', description: 'Got or finished an interview', icon: 'calendar', tone: 'amber' },
  offer: { label: 'Offer', description: 'Received an offer', icon: 'trophy', tone: 'mint' },
  accepted: { label: 'Accepted', description: 'Said yes to an internship', icon: 'briefcase', tone: 'primary' },
  milestone: { label: 'Milestone', description: 'Something worth celebrating', icon: 'star', tone: 'rose' },
};

export const updateKindOrder: UpdateKind[] = ['applied', 'interview', 'offer', 'accepted', 'milestone'];

export const isCelebration = (kind: UpdateKind) => kind === 'offer' || kind === 'accepted';

export function headlineFor(update: Pick<Update, 'kind' | 'company' | 'stage' | 'title'>) {
  const company = update.company || 'a company';
  switch (update.kind) {
    case 'applied':
      return `Applied to ${company}`;
    case 'interview':
      return `${update.stage ?? 'Interview'} at ${company}`;
    case 'offer':
      return `Got an offer from ${company}`;
    case 'accepted':
      return `Accepted an internship at ${company}`;
    case 'milestone':
      return update.title || `New milestone at ${company}`;
  }
}

export function timeAgo(timestamp: number) {
  const minutes = Math.max(0, Math.round((Date.now() - timestamp) / 60_000));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  return days < 7 ? `${days}d` : `${Math.round(days / 7)}w`;
}
