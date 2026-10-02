import { createContext, useContext, useState, type PropsWithChildren } from 'react';

import {
  conversations as initialConversations,
  currentUserId,
  initialComments,
  initialFriendIds,
  initialRequestIds,
  initialUpdates,
  users as initialUsers,
  type Comment,
  type Conversation,
  type Message,
  type Update,
  type User,
} from './mock-data';
import { isPrivateKind } from './update-kinds';

export type NewUpdate = Pick<Update, 'kind' | 'company' | 'role'> &
  Partial<Pick<Update, 'round' | 'interviewType' | 'assessmentFormat' | 'questions' | 'note'>>;

export type ProfilePatch = Partial<Omit<User, 'id' | 'initials' | 'color'>>;

type Store = {
  users: User[];
  currentUser: User;
  getUser: (id: string) => User;
  updateProfile: (patch: ProfilePatch) => void;
  updates: Update[];
  addUpdate: (update: NewUpdate) => void;
  removeUpdate: (id: string) => void;
  toggleCongrats: (id: string) => void;
  comments: Comment[];
  commentsFor: (updateId: string) => Comment[];
  addComment: (updateId: string, body: string) => void;
  friendIds: string[];
  requestIds: string[];
  toggleFriend: (id: string) => void;
  acceptRequest: (id: string) => void;
  declineRequest: (id: string) => void;
  conversations: Conversation[];
  conversationWith: (userId: string) => Conversation | undefined;
  /** Sends a message to a user, starting the conversation if there isn't one. `updateId` attaches a shared post. */
  sendMessage: (userId: string, body: string, updateId?: string) => void;
  markRead: (userId: string) => void;
};

const StoreContext = createContext<Store | null>(null);

const initialsFor = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

const clockTime = (timestamp: number) =>
  new Date(timestamp).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

export function StoreProvider({ children }: PropsWithChildren) {
  const [users, setUsers] = useState(initialUsers);
  const [updates, setUpdates] = useState(initialUpdates);
  const [comments, setComments] = useState(initialComments);
  const [friendIds, setFriendIds] = useState(initialFriendIds);
  const [requestIds, setRequestIds] = useState(initialRequestIds);
  const [conversations, setConversations] = useState(initialConversations);

  const getUser = (id: string) => users.find((user) => user.id === id) ?? users[0];

  const value: Store = {
    users,
    currentUser: getUser(currentUserId),
    getUser,
    updateProfile: (patch) =>
      setUsers((items) =>
        items.map((user) =>
          user.id === currentUserId
            ? { ...user, ...patch, initials: patch.name ? initialsFor(patch.name) || user.initials : user.initials }
            : user,
        ),
      ),
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
    removeUpdate: (id) => {
      setUpdates((items) => items.filter((item) => item.id !== id));
      setComments((items) => items.filter((item) => item.updateId !== id));
    },
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
      setFriendIds((ids) => (ids.includes(id) ? ids : [...ids, id]));
    },
    declineRequest: (id) => setRequestIds((ids) => ids.filter((item) => item !== id)),
    conversations,
    conversationWith: (userId) => conversations.find((conversation) => conversation.userId === userId),
    sendMessage: (userId, body, updateId) => {
      const now = Date.now();
      const message: Message = { id: `msg-${now}`, fromMe: true, body, time: clockTime(now), updateId };
      setConversations((items) => {
        const existing = items.find((conversation) => conversation.userId === userId);
        const next: Conversation = existing
          ? { ...existing, time: message.time, messages: [...existing.messages, message] }
          : { userId, time: message.time, messages: [message] };
        // The conversation you just wrote to moves to the top of the list.
        return [next, ...items.filter((conversation) => conversation.userId !== userId)];
      });
    },
    markRead: (userId) =>
      setConversations((items) =>
        items.map((conversation) =>
          conversation.userId === userId && conversation.unread ? { ...conversation, unread: 0 } : conversation,
        ),
      ),
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error('useStore must be used inside StoreProvider');
  return value;
}
