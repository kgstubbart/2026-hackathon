import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import { Activity, ActivityType, currentUserId, initialActivities, users } from './mock-data';

type NewActivity = { type: ActivityType; company: string; role: string; notes: string; visibility: 'friends' | 'private'; duration_minutes?: number; stage?: string; outcome?: string };
type Store = { activities: Activity[]; addActivity: (activity: NewActivity) => void; toggleKudos: (id: string) => void; users: typeof users; currentUser: (typeof users)[number] };
const JobHuntContext = createContext<Store | null>(null);

export function JobHuntProvider({ children }: PropsWithChildren) {
  const [activities, setActivities] = useState(initialActivities);
  const addActivity = (activity: NewActivity) => setActivities((items) => [{ id: `logged-${Date.now()}`, user_id: currentUserId, started_at: new Date().toISOString(), created_at: new Date().toISOString(), kudos: 0, comments: 0, metadata: activity.stage ? { stage: activity.stage, outcome: activity.outcome } : undefined, ...activity }, ...items]);
  const toggleKudos = (id: string) => setActivities((items) => items.map((item) => item.id === id ? { ...item, isKudos: !item.isKudos, kudos: item.kudos + (item.isKudos ? -1 : 1) } : item));
  const value = useMemo(() => ({ activities, addActivity, toggleKudos, users, currentUser: users.find((user) => user.id === currentUserId)! }), [activities]);
  return <JobHuntContext.Provider value={value}>{children}</JobHuntContext.Provider>;
}
export function useJobHunt() { const value = useContext(JobHuntContext); if (!value) throw new Error('useJobHunt must be inside JobHuntProvider'); return value; }
