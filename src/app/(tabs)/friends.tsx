import { router } from 'expo-router';
import { Fragment, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { Avatar, Button, Card, Divider, IconButton, Screen, SearchField, SectionHeader, Text } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';
import type { User } from '@/data/mock-data';
import { useStore } from '@/data/store';

export default function FriendsScreen() {
  const { users, currentUser, updates, friendIds, requestIds, toggleFriend, acceptRequest, declineRequest } = useStore();
  const [query, setQuery] = useState('');

  const others = users.filter((user) => user.id !== currentUser.id);
  const q = query.trim().toLowerCase();
  const matches = (user: User) => `${user.name} ${user.school} ${user.major}`.toLowerCase().includes(q);

  const friends = others.filter((user) => friendIds.includes(user.id) && matches(user));
  const requests = others.filter((user) => requestIds.includes(user.id) && matches(user));
  const suggestions = others.filter(
    (user) => !friendIds.includes(user.id) && !requestIds.includes(user.id) && matches(user),
  );
  const latestFor = (id: string) => updates.find((update) => update.userId === id && update.visibility === 'friends');

  return (
    <Screen keyboardShouldPersistTaps="handled" header={<AppHeader />}>
      <SearchField value={query} onChangeText={setQuery} placeholder="Search by name or school" />

      {requests.length ? (
        <PeopleSection title="Requests">
          {requests.map((user) => (
            <PersonRow
              key={user.id}
              user={user}
              subtitle={user.school}
              action={
                <>
                  <IconButton icon="close" label="Decline" tone="muted" onPress={() => declineRequest(user.id)} />
                  <Button label="Accept" size="sm" onPress={() => acceptRequest(user.id)} />
                </>
              }
            />
          ))}
        </PeopleSection>
      ) : null}

      {friends.length ? (
        <PeopleSection title="Your circle">
          {friends.map((user) => {
            const latest = latestFor(user.id);
            return (
              <PersonRow
                key={user.id}
                user={user}
                subtitle={latest ? [latest.company, latest.term].filter(Boolean).join(' · ') : user.school}
                action={
                  <IconButton
                    icon="chat"
                    label="Message"
                    tone="muted"
                    onPress={() => router.navigate({ pathname: '/messages', params: { user: user.id } })}
                  />
                }
              />
            );
          })}
        </PeopleSection>
      ) : null}

      {suggestions.length ? (
        <PeopleSection title="People you may know">
          {suggestions.map((user) => (
            <PersonRow
              key={user.id}
              user={user}
              subtitle={user.school === currentUser.school ? `Also at ${user.school}` : `${user.major} · ${user.school}`}
              action={
                <Button label="Add" icon="personAdd" size="sm" variant="secondary" onPress={() => toggleFriend(user.id)} />
              }
            />
          ))}
        </PeopleSection>
      ) : null}

      {!requests.length && !friends.length && !suggestions.length ? (
        <Text variant="body" color={colors.textMuted} align="center" style={styles.empty}>
          No one matches “{query}”.
        </Text>
      ) : null}
    </Screen>
  );
}

function PeopleSection({ title, children }: { title: string; children: ReactNode[] }) {
  return (
    <>
      <SectionHeader title={title} />
      <Card flush>
        {children.map((child, index) => (
          <Fragment key={index}>
            {index > 0 ? <Divider /> : null}
            {child}
          </Fragment>
        ))}
      </Card>
    </>
  );
}

// The row opens the person's profile; its action buttons are their own Pressables, so they don't open it.
function PersonRow({ user, subtitle, action }: { user: User; subtitle: string; action?: ReactNode }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${user.name}'s profile`}
      onPress={() => router.navigate({ pathname: '/user/[id]', params: { id: user.id } })}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <Avatar user={user} size={44} />
      <View style={styles.rowText}>
        <Text variant="headline" numberOfLines={1}>
          {user.name}
        </Text>
        <Text variant="caption" color={colors.textMuted} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      {action ? <View style={styles.actions}>{action}</View> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  rowText: { flex: 1, gap: spacing.xxs },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  pressed: { opacity: 0.7 },
  empty: { marginTop: spacing.xxxl },
});
