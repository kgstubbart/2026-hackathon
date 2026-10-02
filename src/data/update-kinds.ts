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

// Only these kinds appear in the feed; applications and milestones stay on the poster's profile.
export const feedKinds: UpdateKind[] = ['interview', 'offer', 'accepted'];

// Feed post sentence split around the bolded keyword, e.g. "Got an **Interview** at Stripe for the SWE Intern position!"
export function postSentence(update: Pick<Update, 'kind' | 'company' | 'role' | 'title'>): [string, string, string] {
  const company = update.company || 'a company';
  const role = update.role || 'intern';
  switch (update.kind) {
    case 'interview':
      return ['Got an ', 'Interview', ` at ${company} for the ${role} position!`];
    case 'offer':
      return ['Got an ', 'Offer', ` from ${company} for the ${role} position!`];
    case 'accepted':
      return ['', 'Accepted', ` an offer at ${company} for the ${role} position!`];
    case 'applied':
      return ['', 'Applied', ` to ${company} for the ${role} position!`];
    case 'milestone':
      return ['Hit a ', 'Milestone', ` at ${company}${update.title ? `: ${update.title}` : '!'}`];
  }
}

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
