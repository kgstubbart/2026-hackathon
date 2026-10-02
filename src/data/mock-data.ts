export type UpdateKind = 'applied' | 'interview' | 'takehome' | 'offer' | 'accepted' | 'milestone';
export type Visibility = 'friends' | 'private';
// Either part can be left out: someone may share only the difficulty, or only the question.
export type Question = { text?: string; difficulty?: string };

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
  term?: string;
  location?: string;
  stage?: string;
  round?: string;
  interviewType?: string;
  assessmentFormat?: string;
  questions?: Question[];
  title?: string;
  note?: string;
  createdAt: number;
  visibility: Visibility;
  congrats: number;
  congratulated?: boolean;
};

export type Comment = { id: string; updateId: string; userId: string; body: string; createdAt: number };

// A message can carry a shared post (`updateId`), rendered as a small post preview in the thread.
export type Message = { id: string; fromMe: boolean; body: string; time: string; updateId?: string };
export type Conversation = { userId: string; time: string; unread?: number; messages: Message[] };

export const currentUserId = 'alex';
// Consecutive weeks (before this one) with at least one logged update.
export const currentStreakWeeks = 12;

// Whole-season totals for StrJava Wrapped (the in-memory updates only cover the last few weeks).
export const seasonStats = {
  year: 2026,
  applications: 47,
  interviews: 11,
  takehomes: 5,
  offers: 2,
  longestStreakWeeks: 13,
  congratsReceived: 214,
  congratsGiven: 163,
  topCompany: 'Airbnb',
  topCompanyInterviews: 3,
  busiestMonth: 'September',
  hypeFriendId: 'maya',
  hypeFriendCongrats: 38,
};

export const users: User[] = [
  { id: 'alex', name: 'Alex Morgan', initials: 'AM', color: '#6C63FF', school: 'Brigham Young University', major: 'Computer Science', gradYear: 2028, location: 'Provo, UT' },
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

// Newest first, whatever order they are written in below.
export const initialUpdates: Update[] = ([
  { id: 'u1', userId: 'priya', kind: 'offer', company: 'Goldman Sachs', role: 'Summer Analyst', term: 'Summer 2027', location: 'New York, NY', note: 'Superday paid off. Still processing this one!', createdAt: minutesAgo(18), visibility: 'friends', congrats: 42 },
  { id: 'u2', userId: 'jordan', kind: 'interview', company: 'Stripe', role: 'Software Engineering Intern', term: 'Summer 2027', stage: 'Final round', round: 'Final', interviewType: 'Technical', questions: [{ text: 'Design a rate limiter', difficulty: 'Hard' }, { text: '56. Merge Intervals', difficulty: 'Medium' }], note: 'Two technical rounds and a system design chat tomorrow.', createdAt: minutesAgo(52), visibility: 'friends', congrats: 14 },
  { id: 'u3', userId: 'maya', kind: 'accepted', company: 'Figma', role: 'Product Design Intern', term: 'Summer 2027', location: 'San Francisco, CA', note: 'Signed! Who else is going to be in SF this summer?', createdAt: minutesAgo(130), visibility: 'friends', congrats: 67 },
  { id: 'u4', userId: 'theo', kind: 'applied', company: 'Spotify', role: 'Data Analyst Intern', term: 'Summer 2027', note: 'Number 14 this week. Keeping the streak alive.', createdAt: minutesAgo(240), visibility: 'private', congrats: 0 },
  { id: 'u12', userId: 'sam', kind: 'takehome', company: 'Datadog', role: 'Software Engineering Intern', assessmentFormat: 'OA', questions: [{ text: '146. LRU Cache' }, { text: '200. Number of Islands' }], createdAt: minutesAgo(320), visibility: 'friends', congrats: 7 },
  { id: 'u5', userId: 'lena', kind: 'milestone', company: 'Microsoft', role: 'UX Research Intern', term: 'Fall 2026', title: 'Wrapped my first research study', note: 'Presented findings to the Teams org. Terrified and thrilled.', createdAt: minutesAgo(410), visibility: 'friends', congrats: 29 },
  { id: 'u6', userId: 'sam', kind: 'interview', company: 'Duolingo', role: 'Machine Learning Intern', term: 'Summer 2027', stage: 'Phone screen', round: 'Round 1', interviewType: 'Mixed', questions: [{ text: 'Tell me about a project you are proud of' }, { text: '217. Contains Duplicate', difficulty: 'Easy' }], createdAt: minutesAgo(600), visibility: 'friends', congrats: 11 },
  { id: 'u7', userId: 'alex', kind: 'interview', company: 'Airbnb', role: 'Software Engineering Intern', term: 'Summer 2027', stage: 'Technical interview', round: 'Round 2', interviewType: 'Technical', questions: [{ text: '133. Clone Graph', difficulty: 'Medium' }, { text: '994. Rotting Oranges', difficulty: 'Medium' }], note: 'Graph problem went well. Fingers crossed.', createdAt: minutesAgo(900), visibility: 'friends', congrats: 16 },
  { id: 'u8', userId: 'alex', kind: 'applied', company: 'Notion', role: 'Software Engineering Intern', term: 'Summer 2027', note: 'Referred by Sam. Thank you!', createdAt: minutesAgo(2_800), visibility: 'private', congrats: 0 },
  { id: 'u9', userId: 'maya', kind: 'interview', company: 'Figma', role: 'Product Design Intern', term: 'Summer 2027', stage: 'Portfolio review', round: 'Round 2', interviewType: 'Behavioral', questions: [{ text: 'Walk me through your favorite project' }, { text: 'How do you handle design critique?' }], createdAt: minutesAgo(4_300), visibility: 'friends', congrats: 21 },
  { id: 'u10', userId: 'alex', kind: 'applied', company: 'Ramp', role: 'Software Engineering Intern', term: 'Summer 2027', createdAt: minutesAgo(5_900), visibility: 'private', congrats: 0 },
  { id: 'u11', userId: 'jordan', kind: 'applied', company: 'Stripe', role: 'Software Engineering Intern', term: 'Summer 2027', createdAt: minutesAgo(12_000), visibility: 'private', congrats: 0 },
  { id: 'u13', userId: 'theo', kind: 'takehome', company: 'Capital One', role: 'Data Analyst Intern', assessmentFormat: 'OA', questions: [{ text: '1. Two Sum' }, { text: '242. Valid Anagram' }, { text: 'SQL: top 3 customers by revenue' }], note: '70 minutes, three questions. The SQL one was the sneaky one.', createdAt: minutesAgo(95), visibility: 'friends', congrats: 5 },
  { id: 'u14', userId: 'priya', kind: 'interview', company: 'Morgan Stanley', role: 'Summer Analyst', round: 'Round 1', interviewType: 'Behavioral', questions: [{ text: 'Why Morgan Stanley over the other banks?' }, { text: 'Tell me about a time you worked under pressure' }], createdAt: minutesAgo(180), visibility: 'friends', congrats: 9 },
  { id: 'u15', userId: 'jordan', kind: 'takehome', company: 'Palantir', role: 'Software Engineering Intern', assessmentFormat: 'OA', questions: [{ text: '42. Trapping Rain Water' }, { text: '721. Accounts Merge' }], note: 'HackerRank, 90 minutes. Second one was rough.', createdAt: minutesAgo(360), visibility: 'friends', congrats: 12 },
  { id: 'u16', userId: 'lena', kind: 'interview', company: 'Microsoft', role: 'UX Research Intern', round: 'Round 1', interviewType: 'Behavioral', questions: [{ text: 'How would you research a feature nobody uses?' }], createdAt: minutesAgo(520), visibility: 'friends', congrats: 7 },
  { id: 'u17', userId: 'sam', kind: 'takehome', company: 'Roblox', role: 'Machine Learning Intern', assessmentFormat: 'Take-home', questions: [{ text: 'Build a recommender on the sample dataset and write up your approach' }], note: 'Due in five days. Pandas it is.', createdAt: minutesAgo(760), visibility: 'friends', congrats: 6 },
  { id: 'u18', userId: 'maya', kind: 'interview', company: 'Notion', role: 'Product Design Intern', round: 'Round 1', interviewType: 'Mixed', questions: [{ text: 'Redesign the share dialog' }, { text: 'Tell me about a time you shipped something imperfect' }], createdAt: minutesAgo(1_100), visibility: 'friends', congrats: 15 },
  { id: 'u19', userId: 'theo', kind: 'interview', company: 'Spotify', role: 'Data Analyst Intern', round: 'Round 2', interviewType: 'Technical', questions: [{ text: '560. Subarray Sum Equals K', difficulty: 'Medium' }, { text: 'SQL: 7-day rolling retention', difficulty: 'Hard' }], note: 'Case study on podcast churn too.', createdAt: minutesAgo(1_500), visibility: 'friends', congrats: 10 },
  { id: 'u20', userId: 'alex', kind: 'takehome', company: 'Notion', role: 'Software Engineering Intern', assessmentFormat: 'OA', questions: [{ text: '49. Group Anagrams' }, { text: '739. Daily Temperatures' }, { text: '208. Implement Trie (Prefix Tree)' }], note: 'CodeSignal, four sections. Got three.', createdAt: minutesAgo(2_100), visibility: 'friends', congrats: 13 },
  { id: 'u21', userId: 'sam', kind: 'interview', company: 'Duolingo', role: 'Machine Learning Intern', round: 'Round 2', interviewType: 'Technical', questions: [{ text: '322. Coin Change', difficulty: 'Medium' }, { text: 'Explain the bias-variance tradeoff' }], createdAt: minutesAgo(3_200), visibility: 'friends', congrats: 8 },
  { id: 'u22', userId: 'priya', kind: 'takehome', company: 'Goldman Sachs', role: 'Summer Analyst', assessmentFormat: 'OA', questions: [{ text: 'HireVue: 5 recorded questions' }, { text: 'Numerical reasoning set' }], createdAt: minutesAgo(8_000), visibility: 'friends', congrats: 11 },
  { id: 'u23', userId: 'jordan', kind: 'interview', company: 'Stripe', role: 'Software Engineering Intern', round: 'Round 1', interviewType: 'Technical', questions: [{ text: '208. Implement Trie (Prefix Tree)', difficulty: 'Medium' }, { text: 'Design a key-value store with TTL' }], createdAt: minutesAgo(9_500), visibility: 'friends', congrats: 9 },
] satisfies Update[]).sort((a, b) => b.createdAt - a.createdAt);

export const initialComments: Comment[] = [
  { id: 'c1', updateId: 'u1', userId: 'maya', body: 'LETS GO PRIYA!! Superday queen.', createdAt: minutesAgo(15) },
  { id: 'c2', updateId: 'u1', userId: 'alex', body: 'Huge. Dinner on you?', createdAt: minutesAgo(12) },
  { id: 'c3', updateId: 'u1', userId: 'theo', body: 'How many rounds was it in total?', createdAt: minutesAgo(9) },
  { id: 'c4', updateId: 'u2', userId: 'alex', body: 'The rate limiter one is a classic, token bucket and you are golden.', createdAt: minutesAgo(40) },
  { id: 'c5', updateId: 'u2', userId: 'sam', body: 'Good luck tomorrow!', createdAt: minutesAgo(30) },
  { id: 'c6', updateId: 'u3', userId: 'priya', body: 'SF summer crew assemble', createdAt: minutesAgo(120) },
  { id: 'c7', updateId: 'u3', userId: 'lena', body: 'So proud of you. Figma is lucky.', createdAt: minutesAgo(100) },
  { id: 'c8', updateId: 'u3', userId: 'jordan', body: 'Congrats Maya!!', createdAt: minutesAgo(90) },
  { id: 'c9', updateId: 'u12', userId: 'alex', body: 'Number of Islands again? They love that one.', createdAt: minutesAgo(300) },
  { id: 'c10', updateId: 'u7', userId: 'maya', body: 'Graph problems are your thing. You got this.', createdAt: minutesAgo(850) },
  { id: 'c11', updateId: 'u9', userId: 'alex', body: 'Your portfolio is unreal, no way they pass.', createdAt: minutesAgo(4_000) },
  { id: 'c12', updateId: 'u13', userId: 'sam', body: 'Which SQL dialect? I had the same OA last week.', createdAt: minutesAgo(80) },
  { id: 'c13', updateId: 'u15', userId: 'alex', body: 'Accounts Merge is just union find in disguise.', createdAt: minutesAgo(300) },
  { id: 'c14', updateId: 'u15', userId: 'theo', body: 'Trapping rain water on a timer is cruel.', createdAt: minutesAgo(280) },
  { id: 'c15', updateId: 'u18', userId: 'lena', body: 'Share dialog redesign is such a good prompt. What did you go with?', createdAt: minutesAgo(1_000) },
  { id: 'c16', updateId: 'u20', userId: 'jordan', body: 'Three out of four still clears the bar usually.', createdAt: minutesAgo(2_000) },
  { id: 'c17', updateId: 'u19', userId: 'priya', body: 'Rolling retention in SQL, respect.', createdAt: minutesAgo(1_400) },
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

// Share form: suggestions for the typed fields (any typed answer is accepted) and the fixed options.
export const finalRound = 'Final';
export const interviewRounds = ['Round 1', 'Round 2', 'Round 3', 'Round 4', 'Round 5', finalRound];
export const interviewTypes = ['Behavioral', 'Technical', 'Mixed'];
export const assessmentFormats = ['OA', 'Take-home'];
export const difficulties = ['Easy', 'Medium', 'Hard'];
// Real LeetCode titles, used as rotating placeholders for question fields.
export const leetcodeExamples = [
  '1. Two Sum',
  '146. LRU Cache',
  '200. Number of Islands',
  '56. Merge Intervals',
  '3. Longest Substring Without Repeating Characters',
  '207. Course Schedule',
  '20. Valid Parentheses',
  '238. Product of Array Except Self',
  '295. Find Median from Data Stream',
  '981. Time Based Key-Value Store',
];
export const behavioralExamples = [
  'Tell me about a time you failed',
  'Tell me about a time you disagreed with a teammate',
  'Why do you want to work here?',
  'Describe a project you are proud of',
];
export const companySuggestions = ['Airbnb', 'Amazon', 'Apple', 'Datadog', 'Duolingo', 'Figma', 'Goldman Sachs', 'Google', 'Meta', 'Microsoft', 'Notion', 'Ramp', 'Spotify', 'Stripe'];
export const positionSuggestions = ['Software Engineering Intern', 'Machine Learning Intern', 'Data Science Intern', 'Data Analyst Intern', 'Product Design Intern', 'Product Management Intern', 'UX Research Intern', 'Summer Analyst'];
