export type ActivityType = 'application' | 'interview' | 'networking' | 'skill_practice' | 'search_session';
export type User = { id: string; name: string; initials: string; avatarColor: string; headline: string; target_role: string; location: string };
export type Activity = { id: string; user_id: string; type: ActivityType; company: string; role: string; started_at: string; duration_minutes?: number; notes: string; visibility: 'friends' | 'private'; metadata?: { stage?: string; outcome?: string }; created_at: string; kudos: number; comments: number; isKudos?: boolean };

export const currentUserId = 'alex';
export const users: User[] = [
  { id: 'alex', name: 'Alex Morgan', initials: 'AM', avatarColor: '#F5A58D', headline: 'Product Designer', target_role: 'Senior Product Designer', location: 'Brooklyn, NY' },
  { id: 'maya', name: 'Maya Chen', initials: 'MC', avatarColor: '#F8B193', headline: 'Product Designer', target_role: 'Product Designer', location: 'San Francisco, CA' },
  { id: 'jordan', name: 'Jordan Ellis', initials: 'JE', avatarColor: '#6DB5A2', headline: 'Staff Engineer', target_role: 'Engineering Manager', location: 'Austin, TX' },
  { id: 'priya', name: 'Priya Shah', initials: 'PS', avatarColor: '#A58CDB', headline: 'Growth Lead', target_role: 'Growth Product', location: 'New York, NY' },
  { id: 'theo', name: 'Theo Martin', initials: 'TM', avatarColor: '#E2A45B', headline: 'Product Manager', target_role: 'Product Leadership', location: 'Chicago, IL' },
  { id: 'lena', name: 'Lena Ortiz', initials: 'LO', avatarColor: '#E78089', headline: 'UX Researcher', target_role: 'Research Lead', location: 'Seattle, WA' },
  { id: 'nina', name: 'Nina Patel', initials: 'NP', avatarColor: '#D97562', headline: 'Senior Recruiter', target_role: 'Talent', location: 'Los Angeles, CA' },
  { id: 'sam', name: 'Sam Rivera', initials: 'SR', avatarColor: '#70A9D8', headline: 'Design Manager', target_role: 'Design', location: 'Brooklyn, NY' },
  { id: 'marcus', name: 'Marcus Lee', initials: 'ML', avatarColor: '#97B27C', headline: 'Talent Partner', target_role: 'Recruiting', location: 'Boston, MA' },
  { id: 'zoe', name: 'Zoe Kim', initials: 'ZK', avatarColor: '#B993DC', headline: 'Software Engineer', target_role: 'Frontend', location: 'Denver, CO' },
];

const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3_600_000).toISOString();
const samples: Omit<Activity, 'id'>[] = [
  { user_id: 'maya', type: 'application', company: 'Linear', role: 'Senior Product Designer', started_at: hoursAgo(0.3), created_at: hoursAgo(0.3), notes: 'Applied to a role that feels like a real fit.', visibility: 'friends', kudos: 12, comments: 3 },
  { user_id: 'jordan', type: 'interview', company: 'Northstar Labs', role: 'Staff Engineer', started_at: hoursAgo(0.7), created_at: hoursAgo(0.7), duration_minutes: 60, notes: 'Completed the final round. Feeling grateful for the process.', visibility: 'friends', metadata: { stage: 'Final round', outcome: 'Great' }, kudos: 24, comments: 6 },
  { user_id: 'priya', type: 'application', company: 'Meadow', role: 'Growth Lead', started_at: hoursAgo(1), created_at: hoursAgo(1), notes: 'Got the offer!', visibility: 'friends', kudos: 48, comments: 14 },
  { user_id: 'theo', type: 'networking', company: 'Fable', role: 'Product', started_at: hoursAgo(2), created_at: hoursAgo(2), notes: 'Coffee chat with an alum. Great advice on storytelling.', visibility: 'friends', kudos: 9, comments: 2 },
  { user_id: 'lena', type: 'skill_practice', company: 'Personal goal', role: 'UX Research', started_at: hoursAgo(5), created_at: hoursAgo(5), notes: '25 applications logged — consistency badge unlocked.', visibility: 'friends', kudos: 31, comments: 8 },
  { user_id: 'alex', type: 'application', company: 'Linear', role: 'Senior Product Designer', started_at: hoursAgo(8), created_at: hoursAgo(8), notes: 'Referred by Sam. Portfolio review next.', visibility: 'friends', kudos: 16, comments: 4 },
  { user_id: 'alex', type: 'interview', company: 'Northstar Labs', role: 'Product Designer', started_at: hoursAgo(26), created_at: hoursAgo(26), duration_minutes: 62, notes: 'Final round interview completed.', visibility: 'friends', metadata: { stage: 'Final round', outcome: 'Great' }, kudos: 20, comments: 5 },
];

export const initialActivities: Activity[] = Array.from({ length: 50 }, (_, index) => {
  const sample = samples[index % samples.length];
  const offset = Math.floor(index / samples.length) * 25;
  return { ...sample, id: `activity-${index}`, started_at: hoursAgo(offset + (index % 6)), created_at: hoursAgo(offset + (index % 6)), kudos: sample.kudos + (index % 4), comments: sample.comments + (index % 3) };
});

export const activityLabel: Record<ActivityType, string> = { application: 'Application', interview: 'Interview', networking: 'Networking', skill_practice: 'Practice', search_session: 'Search session' };
export const activityIcon: Record<ActivityType, string> = { application: '↗', interview: '▣', networking: '♧', skill_practice: '◎', search_session: '⌕' };
