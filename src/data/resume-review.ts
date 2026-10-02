import type { Update, User } from './mock-data';

// Resume review is a DEMO: nothing is uploaded or scanned. The "AI" verdict is a deterministic
// hash of the company and role so the same pick always shows the same result.

export const mockResume = { fileName: 'Alex_Morgan_Resume.pdf', pages: 1, size: '184 KB' };

export const scanSteps = [
  'Parsing your resume',
  'Extracting skills and projects',
  'Comparing with offer holders',
  'Weighing what got them the offer',
  'Scoring your chances',
];

export type Signal = { label: string; detail: string };
export type Review = {
  score: number;
  verdict: string;
  matches: Signal[];
  gaps: Signal[];
  tips: string[];
};

const signalPool: { label: string; have: string; miss: string; tip: string }[] = [
  { label: 'Prior internship', have: 'Your Summer 2026 internship lines up with theirs', miss: 'offer holders had one before applying', tip: 'Lead with your strongest project if you have no prior internship.' },
  { label: 'Shipped project on GitHub', have: 'Your portfolio project matches what they listed', miss: 'listed a project with real users', tip: 'Add a link to a project people can actually try.' },
  { label: 'Open-source contributions', have: 'Your contributions show up like theirs do', miss: 'had merged pull requests on their resume', tip: 'One merged PR to a library they use goes a long way.' },
  { label: 'Referral', have: 'You have a friend inside, like they did', miss: 'applied with a referral', tip: 'Ask a friend who got the offer for a referral.' },
  { label: 'Hackathon placement', have: 'Your hackathon result reads like theirs', miss: 'listed a hackathon win or finalist spot', tip: 'Mention your best hackathon placing, even a finalist spot.' },
  { label: 'Quantified impact', have: 'Your bullets carry numbers the way theirs do', miss: 'put numbers on every bullet', tip: 'Turn "improved performance" into "cut p95 latency 40%".' },
  { label: 'Relevant coursework', have: 'Your systems and algorithms courses match', miss: 'called out matching coursework', tip: 'List the two or three courses closest to the role.' },
  { label: 'Teaching or leadership', have: 'Your TA role mirrors theirs', miss: 'had a TA or club lead role', tip: 'Even a semester as a TA is worth a line.' },
];

const hash = (text: string) => {
  let value = 7;
  for (const character of text.toLowerCase()) value = (Math.imul(value, 31) + character.charCodeAt(0)) >>> 0;
  return value;
};

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;

export function reviewChances(company: string, role: string, holders: User[]): Review {
  const seed = hash(`${company}|${role}`);
  const count = Math.max(1, holders.length);
  // Scores sit between 38 and 86; more offer holders means more confidence and a nudge up.
  const score = Math.min(86, 38 + (seed % 41) + Math.min(count, 4) * 2);
  const verdict = score >= 75 ? 'Strong match' : score >= 60 ? 'Good shape' : score >= 50 ? 'In the running' : 'Needs work';

  // Pick a stable subset of signals, then split them into matches and gaps.
  const ordered = [...signalPool].sort((a, b) => hash(`${seed}${a.label}`) - hash(`${seed}${b.label}`));
  const picked = ordered.slice(0, 5);
  const matchCount = Math.max(1, Math.round((score / 100) * picked.length));
  const matches = picked.slice(0, matchCount).map((signal, index) => ({
    label: signal.label,
    detail: `${signal.have} · ${plural(Math.max(1, count - (index % 2)), 'offer holder')}`,
  }));
  const gaps = picked.slice(matchCount).map((signal, index) => ({
    label: signal.label,
    detail: `${plural(Math.max(1, count - (index % 2)), 'offer holder')} ${signal.miss}`,
  }));
  const tips = picked.slice(matchCount).map((signal) => signal.tip);
  return { score, verdict, matches, gaps, tips };
}

// Friends (and you) who posted an offer or acceptance, grouped by company and role.
export function offerHolders(updates: Update[], circle: string[]) {
  const seen = new Set<string>();
  return updates.filter((update) => {
    const key = `${update.userId}|${update.company}|${update.role}`;
    if (!circle.includes(update.userId) || (update.kind !== 'offer' && update.kind !== 'accepted') || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
