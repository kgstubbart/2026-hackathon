export type UpdateKind = 'applied' | 'interview' | 'offer' | 'accepted' | 'milestone';
export type Visibility = 'friends' | 'private';

export type User = {
  id: string;
  name: string;
  initials: string;
  color: string;
  school: string;
  major: string;
  gradYear: number;
  location: string;
};

export type Update = {
  id: string;
  userId: string;
  kind: UpdateKind;
  company: string;
  role: string;
  term: string;
  location?: string;
  stage?: string;
  title?: string;
  note?: string;
  createdAt: number;
  visibility: Visibility;
  congrats: number;
  comments: number;
  congratulated?: boolean;
};

export type Message = { id: string; fromMe: boolean; body: string; time: string };
export type Conversation = { userId: string; time: string; unread?: number; messages: Message[] };

export const currentUserId = 'alex';
// Consecutive weeks (before this one) with at least one logged update.
export const currentStreakWeeks = 12;

export const users: User[] = [
  { id: 'alex', name: 'Alex Morgan', initials: 'AM', color: '#6C63FF', school: 'University of Michigan', major: 'Computer Science', gradYear: 2028, location: 'Ann Arbor, MI' },
  { id: 'maya', name: 'Maya Chen', initials: 'MC', color: '#F28C6B', school: 'UC Berkeley', major: 'Cognitive Science', gradYear: 2028, location: 'Berkeley, CA' },
  { id: 'jordan', name: 'Jordan Ellis', initials: 'JE', color: '#3FA98C', school: 'Georgia Tech', major: 'Computer Engineering', gradYear: 2027, location: 'Atlanta, GA' },
  { id: 'priya', name: 'Priya Shah', initials: 'PS', color: '#9B7BE0', school: 'NYU Stern', major: 'Finance', gradYear: 2027, location: 'New York, NY' },
  { id: 'theo', name: 'Theo Martin', initials: 'TM', color: '#E0A043', school: 'UT Austin', major: 'Business Analytics', gradYear: 2028, location: 'Austin, TX' },
  { id: 'lena', name: 'Lena Ortiz', initials: 'LO', color: '#E26D86', school: 'University of Washington', major: 'HCI + Design', gradYear: 2027, location: 'Seattle, WA' },
  { id: 'sam', name: 'Sam Rivera', initials: 'SR', color: '#4C9BD6', school: 'University of Michigan', major: 'Data Science', gradYear: 2028, location: 'Ann Arbor, MI' },
  { id: 'nia', name: 'Nia Brooks', initials: 'NB', color: '#D9734E', school: 'Howard University', major: 'Economics', gradYear: 2027, location: 'Washington, DC' },
  { id: 'kai', name: 'Kai Nakamura', initials: 'KN', color: '#5AA06A', school: 'Carnegie Mellon', major: 'Robotics', gradYear: 2028, location: 'Pittsburgh, PA' },
  { id: 'zoe', name: 'Zoe Kim', initials: 'ZK', color: '#B57BD6', school: 'UCLA', major: 'Statistics', gradYear: 2029, location: 'Los Angeles, CA' },
];

export const initialFriendIds = ['maya', 'jordan', 'priya', 'theo', 'lena', 'sam'];
export const initialRequestIds = ['nia'];

const minutesAgo = (minutes: number) => Date.now() - minutes * 60_000;

export const initialUpdates: Update[] = [
  { id: 'u1', userId: 'priya', kind: 'offer', company: 'Goldman Sachs', role: 'Summer Analyst', term: 'Summer 2027', location: 'New York, NY', note: 'Superday paid off. Still processing this one!', createdAt: minutesAgo(18), visibility: 'friends', congrats: 42, comments: 11 },
  { id: 'u2', userId: 'jordan', kind: 'interview', company: 'Stripe', role: 'Software Engineering Intern', term: 'Summer 2027', stage: 'Final round', note: 'Two technical rounds and a system design chat tomorrow.', createdAt: minutesAgo(52), visibility: 'friends', congrats: 14, comments: 4 },
  { id: 'u3', userId: 'maya', kind: 'accepted', company: 'Figma', role: 'Product Design Intern', term: 'Summer 2027', location: 'San Francisco, CA', note: 'Signed! Who else is going to be in SF this summer?', createdAt: minutesAgo(130), visibility: 'friends', congrats: 67, comments: 19 },
  { id: 'u4', userId: 'theo', kind: 'applied', company: 'Spotify', role: 'Data Analyst Intern', term: 'Summer 2027', note: 'Number 14 this week. Keeping the streak alive.', createdAt: minutesAgo(240), visibility: 'friends', congrats: 8, comments: 1 },
  { id: 'u5', userId: 'lena', kind: 'milestone', company: 'Microsoft', role: 'UX Research Intern', term: 'Fall 2026', title: 'Wrapped my first research study', note: 'Presented findings to the Teams org. Terrified and thrilled.', createdAt: minutesAgo(410), visibility: 'friends', congrats: 29, comments: 6 },
  { id: 'u6', userId: 'sam', kind: 'interview', company: 'Duolingo', role: 'Machine Learning Intern', term: 'Summer 2027', stage: 'Phone screen', createdAt: minutesAgo(600), visibility: 'friends', congrats: 11, comments: 2 },
  { id: 'u7', userId: 'alex', kind: 'interview', company: 'Airbnb', role: 'Software Engineering Intern', term: 'Summer 2027', stage: 'Technical interview', note: 'Graph problem went well. Fingers crossed.', createdAt: minutesAgo(900), visibility: 'friends', congrats: 16, comments: 3 },
  { id: 'u8', userId: 'alex', kind: 'applied', company: 'Notion', role: 'Software Engineering Intern', term: 'Summer 2027', note: 'Referred by Sam. Thank you!', createdAt: minutesAgo(2_800), visibility: 'friends', congrats: 9, comments: 2 },
  { id: 'u9', userId: 'maya', kind: 'interview', company: 'Figma', role: 'Product Design Intern', term: 'Summer 2027', stage: 'Portfolio review', createdAt: minutesAgo(4_300), visibility: 'friends', congrats: 21, comments: 5 },
  { id: 'u10', userId: 'alex', kind: 'applied', company: 'Ramp', role: 'Software Engineering Intern', term: 'Summer 2027', createdAt: minutesAgo(5_900), visibility: 'private', congrats: 0, comments: 0 },
  { id: 'u11', userId: 'jordan', kind: 'applied', company: 'Stripe', role: 'Software Engineering Intern', term: 'Summer 2027', createdAt: minutesAgo(12_000), visibility: 'friends', congrats: 6, comments: 0 },
];

export const conversations: Conversation[] = [
  {
    userId: 'maya',
    time: '9:24 AM',
    unread: 2,
    messages: [
      { id: 'm1', fromMe: true, body: 'CONGRATS on Figma!! You earned it.', time: '9:02 AM' },
      { id: 'm2', fromMe: false, body: 'Thank you!! Still can’t believe it.', time: '9:20 AM' },
      { id: 'm3', fromMe: false, body: 'Want me to look over your portfolio before your Airbnb onsite?', time: '9:24 AM' },
    ],
  },
  {
    userId: 'sam',
    time: '8:51 AM',
    unread: 1,
    messages: [
      { id: 'm1', fromMe: false, body: 'Just submitted the Notion referral for you 🙌', time: '8:51 AM' },
    ],
  },
  {
    userId: 'jordan',
    time: 'Yesterday',
    messages: [
      { id: 'm1', fromMe: false, body: 'Any tips for the Stripe final round?', time: 'Yesterday' },
      { id: 'm2', fromMe: true, body: 'Talk through tradeoffs out loud. They love that.', time: 'Yesterday' },
    ],
  },
  {
    userId: 'priya',
    time: 'Tue',
    messages: [{ id: 'm1', fromMe: false, body: 'Coffee once recruiting season calms down?', time: 'Tue' }],
  },
];

export const terms = ['Summer 2027', 'Fall 2026', 'Spring 2027', 'Winter 2027'];
export const interviewStages = ['Phone screen', 'Technical interview', 'Behavioral interview', 'Final round'];
