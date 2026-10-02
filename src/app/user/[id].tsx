import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { CardCollection } from '@/components/card-collection';
import { ProfileIdentity } from '@/components/profile-identity';
import { Button, IconButton, Screen, Text, TopBar } from '@/components/ui';
import { UpdateCard } from '@/components/update-card';
import { colors, layout, spacing } from '@/constants/theme';
import { useStore } from '@/data/store';
import { feedKinds } from '@/data/update-kinds';

const back = () => (router.canGoBack() ? router.back() : router.navigate('/friends'));

// Another person's profile, pushed on top of the tabs from Friends, the feed or search.
export default function UserScreen() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const {
    users,
    currentUser,
    updates,
    friendIds,
    requestIds,
    toggleFriend,
    acceptRequest,
    declineRequest,
    toggleCongrats,
    commentsFor,
  } = useStore();
  // Tapping "Remove friend" once asks for a second tap instead of a system dialog.
  const [confirmRemove, setConfirmRemove] = useState(false);

  const user = users.find((item) => item.id === id);
  const isMe = user?.id === currentUser.id;

  // Your own id just opens your profile tab.
  useEffect(() => {
    if (isMe) router.replace('/profile');
  }, [isMe]);

  if (!user || isMe) {
    return (
      <Screen header={<TopBar title={user?.name ?? 'Profile'} left={<IconButton icon="back" label="Back" tone="muted" onPress={back} />} />}>
        {user ? null : (
          <Text variant="body" color={colors.textMuted} align="center" style={styles.empty}>
            This person is gone.
          </Text>
        )}
      </Screen>
    );
  }

  const isFriend = friendIds.includes(user.id);
  const hasRequest = requestIds.includes(user.id);
  const firstName = user.name.split(' ')[0];
  const shared = updates.filter(
    (update) => update.userId === user.id && update.visibility === 'friends' && feedKinds.includes(update.kind),
  );
  const openChat = () => router.navigate({ pathname: '/messages', params: { user: user.id } });

  return (
    <Screen header={<TopBar title={user.name} left={<IconButton icon="back" label="Back" tone="muted" onPress={back} />} />}>
      <ProfileIdentity user={user} counts={[{ value: shared.length, label: 'shared updates' }]} />

      <View style={styles.actions}>
        {isFriend ? (
          <>
            <View style={styles.grow}>
              <Button label="Message" icon="chat" fullWidth onPress={openChat} />
            </View>
            <View style={styles.grow}>
              <Button
                label={confirmRemove ? 'Confirm remove' : 'Remove friend'}
                variant="outline"
                fullWidth
                onPress={() => {
                  if (!confirmRemove) return setConfirmRemove(true);
                  setConfirmRemove(false);
                  toggleFriend(user.id);
                }}
              />
            </View>
          </>
        ) : hasRequest ? (
          <>
            <View style={styles.grow}>
              <Button label="Accept" icon="check" fullWidth onPress={() => acceptRequest(user.id)} />
            </View>
            <View style={styles.grow}>
              <Button label="Decline" variant="outline" fullWidth onPress={() => declineRequest(user.id)} />
            </View>
          </>
        ) : (
          <View style={styles.grow}>
            <Button label="Add friend" icon="personAdd" fullWidth onPress={() => toggleFriend(user.id)} />
          </View>
        )}
      </View>

      {isFriend ? (
        <>
          <CardCollection
            updates={updates.filter((update) => update.userId === user.id)}
            emptyText={`${firstName} hasn't collected any cards yet.`}
          />
          <View style={styles.history}>
          {shared.length ? (
            shared.map((update) => (
              <UpdateCard
                key={update.id}
                commentCount={commentsFor(update.id).length}
                update={update}
                author={user}
                onCongrats={() => toggleCongrats(update.id)}
              />
            ))
          ) : (
            <Text variant="body" color={colors.textMuted} align="center">
              {firstName} hasn&apos;t shared anything yet.
            </Text>
          )}
          </View>
        </>
      ) : (
        <Text variant="body" color={colors.textMuted} align="center" style={styles.empty}>
          Add {firstName} as a friend to see their updates.
        </Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
  grow: { flex: 1 },
  history: { gap: spacing.sm, marginTop: spacing.xxl, marginHorizontal: -layout.gutter },
  empty: { marginTop: spacing.xxxl },
});
