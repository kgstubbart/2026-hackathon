import type { IconName } from '@/components/ui';
import type { Tone } from '@/constants/theme';
import type { Update, UpdateKind } from './mock-data';

export const updateKinds: Record<UpdateKind, { label: string; icon: IconName; tone: Tone }> = {
  applied: { label: 'Application', icon: 'send', tone: 'sky' },
  interview: { label: 'Interview', icon: 'calendar', tone: 'amber' },
  takehome: { label: 'Takehome/OA', icon: 'code', tone: 'teal' },
  offer: { label: 'Offer', icon: 'trophy', tone: 'mint' },
  accepted: { label: 'Accepted', icon: 'briefcase', tone: 'primary' },
  milestone: { label: 'Milestone', icon: 'star', tone: 'rose' },
};

export const updateKindOrder: UpdateKind[] = ['applied', 'interview', 'takehome', 'offer', 'accepted', 'milestone'];
// Kinds a user can log from the Share tab.
export const shareKinds = ['applied', 'interview', 'takehome', 'offer'] as const satisfies readonly UpdateKind[];

// Applications never reach the feed; they only feed personal tracking and the streak.
export const isPrivateKind = (kind: UpdateKind) => kind === 'applied';

// Only these kinds appear in the feed; applications and milestones stay on the poster's profile.
export const feedKinds: UpdateKind[] = ['interview', 'takehome', 'offer', 'accepted'];

// Feed post sentence as segments; the kind, company and role are bold, the rest regular.
// e.g. "Got an **Interview** at **Stripe** for the **SWE Intern** position!"
export type SentenceSegment = { text: string; bold?: boolean };

export function postSentence(
  update: Pick<Update, 'kind' | 'company' | 'role' | 'title' | 'assessmentFormat'>,
): SentenceSegment[] {
  const company = { text: update.company || 'a company', bold: true };
  const role = { text: update.role || 'intern', bold: true };
  const forThe = { text: ' for the ' };
  const position = { text: ' position!' };
  switch (update.kind) {
    case 'interview':
      return [{ text: 'Got an ' }, { text: 'Interview', bold: true }, { text: ' at ' }, company, forThe, role, position];
    case 'takehome':
      // Use the format when known: "Got an OA…" / "Got a Take-home…".
      return [
        { text: update.assessmentFormat === 'Take-home' ? 'Got a ' : 'Got an ' },
        { text: update.assessmentFormat || 'OA', bold: true },
        { text: ' from ' },
        company,
        forThe,
        role,
        position,
      ];
    case 'offer':
      return [{ text: 'Got an ' }, { text: 'Offer', bold: true }, { text: ' from ' }, company, forThe, role, position];
    case 'accepted':
      return [{ text: 'Accepted', bold: true }, { text: ' an offer at ' }, company, forThe, role, position];
    case 'applied':
      return [{ text: 'Applied', bold: true }, { text: ' to ' }, company, forThe, role, position];
    case 'milestone':
      return [
        { text: 'Hit a ' },
        { text: 'Milestone', bold: true },
        { text: ' at ' },
        company,
        { text: update.title ? `: ${update.title}` : '!' },
      ];
  }
}

export function headlineFor(update: Pick<Update, 'kind' | 'company' | 'stage' | 'round' | 'assessmentFormat' | 'title'>) {
  const company = update.company || 'a company';
  switch (update.kind) {
    case 'applied':
      return `Applied to ${company}`;
    case 'interview':
      if (update.stage) return `${update.stage} at ${company}`;
      return `${update.round ? `${update.round} interview` : 'Interview'} at ${company}`;
    case 'takehome':
      return `${update.assessmentFormat || 'Takehome/OA'} from ${company}`;
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
