import type { Update, UpdateKind } from './mock-data';

// The Search tab is a repository of shared experiences: every non-private interview, takehome/OA, offer
// and acceptance anyone has posted, browsable by company and position.
export const repositoryKinds: UpdateKind[] = ['interview', 'takehome', 'offer', 'accepted'];

export const isExperience = (update: Update) => update.visibility === 'friends' && repositoryKinds.includes(update.kind);

export type CompanySummary = {
  company: string;
  positions: string[];
  interviews: number;
  takehomes: number;
  offers: number;
  latest: number;
};

export function summarizeCompanies(experiences: Update[]): CompanySummary[] {
  const byCompany = new Map<string, CompanySummary>();
  for (const update of experiences) {
    const entry = byCompany.get(update.company) ?? {
      company: update.company,
      positions: [],
      interviews: 0,
      takehomes: 0,
      offers: 0,
      latest: 0,
    };
    if (!entry.positions.includes(update.role)) entry.positions.push(update.role);
    if (update.kind === 'interview') entry.interviews += 1;
    if (update.kind === 'takehome') entry.takehomes += 1;
    if (update.kind === 'offer' || update.kind === 'accepted') entry.offers += 1;
    entry.latest = Math.max(entry.latest, update.createdAt);
    byCompany.set(update.company, entry);
  }
  return [...byCompany.values()].sort((a, b) => a.company.localeCompare(b.company));
}

// "3 positions · 5 interviews · 2 OAs"
export function companyStats(summary: CompanySummary) {
  const plural = (count: number, word: string, pluralWord = `${word}s`) => `${count} ${count === 1 ? word : pluralWord}`;
  return [
    plural(summary.positions.length, 'position'),
    summary.interviews ? plural(summary.interviews, 'interview') : null,
    summary.takehomes ? plural(summary.takehomes, 'OA') : null,
    summary.offers ? plural(summary.offers, 'offer') : null,
  ]
    .filter(Boolean)
    .join(' · ');
}

// Group one company's experiences by position, most-posted position first.
export function groupByPosition(experiences: Update[]) {
  const groups = new Map<string, Update[]>();
  for (const update of experiences) groups.set(update.role, [...(groups.get(update.role) ?? []), update]);
  return [...groups.entries()]
    .map(([position, updates]) => ({ position, updates: updates.sort((a, b) => b.createdAt - a.createdAt) }))
    .sort((a, b) => b.updates.length - a.updates.length);
}

// Short label for an experience row: "Round 2 · Technical", "OA", "Take-home", "Offer".
export function experienceLabel(update: Update) {
  switch (update.kind) {
    case 'interview':
      return [update.round ?? 'Interview', update.interviewType].filter(Boolean).join(' · ');
    case 'takehome':
      return update.assessmentFormat ?? 'OA';
    case 'offer':
      return 'Offer';
    case 'accepted':
      return 'Accepted offer';
    default:
      return update.kind;
  }
}

export type QuestionHit = { update: Update; text: string; difficulty?: string };

export function findQuestions(experiences: Update[], query: string): QuestionHit[] {
  const hits: QuestionHit[] = [];
  for (const update of experiences) {
    for (const question of update.questions ?? []) {
      if (question.text?.toLowerCase().includes(query)) hits.push({ update, text: question.text, difficulty: question.difficulty });
    }
  }
  return hits;
}
