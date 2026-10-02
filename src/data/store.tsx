import { createContext, useContext, useState, type PropsWithChildren } from 'react';

import {
  currentUserId,
  initialComments,
  initialFriendIds,
  initialRequestIds,
  initialUpdates,
  users,
  type Comment,
  type Update,
  type User,
} from './mock-data';
import { isPrivateKind } from './update-kinds';

export type NewUpdate = Pick<Update, 'kind' | 'company' | 'role'> &
  Partial<Pick<Update, 'round' | 'interviewType' | 'assessmentFormat' | 'questions'>>;

type Store = {
  users: User[];
  currentUser: User;
  getUser: (id: string) => User;
  updates: Update[];
  addUpdate: (update: NewUpdate) => void;
  toggleCongrats: (id: string) => void;
  comments: Comment[];
  commentsFor: (updateId: string) => Comment[];
  addComment: (updateId: string, body: string) => void;
  friendIds: string[];
  requestIds: string[];
  toggleFriend: (id: string) => void;
  acceptRequest: (id: string) => void;
};

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: PropsWithChildren) {
  const [updates, setUpdates] = useState(initialUpdates);
  const [comments, setComments] = useState(initialComments);
  const [friendIds, setFriendIds] = useState(initialFriendIds);
  const [requestIds, setRequestIds] = useState(initialRequestIds);

  const getUser = (id: string) => users.find((user) => user.id === id) ?? users[0];

  const value: Store = {
    users,
    currentUser: getUser(currentUserId),
    getUser,
    updates,
    addUpdate: (update) =>
      setUpdates((items) => [
        {
          id: `new-${Date.now()}`,
          userId: currentUserId,
          createdAt: Date.now(),
          congrats: 0,
          // Applications are personal tracking only; everything else goes to the feed.
          visibility: isPrivateKind(update.kind) ? 'private' : 'friends',
          ...update,
        },
        ...items,
      ]),
    toggleCongrats: (id) =>
      setUpdates((items) =>
        items.map((item) =>
          item.id === id
            ? { ...item, congratulated: !item.congratulated, congrats: item.congrats + (item.congratulated ? -1 : 1) }
            : item,
        ),
      ),
    comments,
    commentsFor: (updateId) => comments.filter((comment) => comment.updateId === updateId),
    addComment: (updateId, body) =>
      setComments((items) => [
        ...items,
        { id: `comment-${Date.now()}`, updateId, userId: currentUserId, body, createdAt: Date.now() },
      ]),
    friendIds,
    requestIds,
    toggleFriend: (id) =>
      setFriendIds((ids) => (ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id])),
    acceptRequest: (id) => {
      setRequestIds((ids) => ids.filter((item) => item !== id));
      setFriendIds((ids) => [...ids, id]);
    },
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error('useStore must be used inside StoreProvider');
  return value;
}
