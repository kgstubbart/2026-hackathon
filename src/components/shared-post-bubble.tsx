import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar, Icon, Text } from '@/components/ui';
import { colors, radius, spacing, tones } from '@/constants/theme';
import type { Update, User } from '@/data/mock-data';
import { postSentence, updateKinds } from '@/data/update-kinds';

type SharedPostBubbleProps = {
  /** The shared update, or undefined when it has since been deleted. */
  update?: Update;
  author?: User;
  /** Outgoing bubbles sit on the primary color, so everything inside is drawn in `onPrimary`. */
  fromMe: boolean;
};

// Compact post preview inside a chat bubble: author row with the kind icon, then the feed sentence. Tapping opens the post.
export function SharedPostBubble({ update, author, fromMe }: SharedPostBubbleProps) {
  const fg = fromMe ? colors.onPrimary : colors.text;
  const muted = fromMe ? colors.onPrimary : colors.textMuted;

  if (!update || !author) {
    return (
      <Text variant="body" color={muted} style={styles.unavailable}>
        Post unavailable
      </Text>
    );
  }

  const meta = updateKinds[update.kind];
  const iconColor = fromMe ? colors.onPrimary : tones[meta.tone].fg;
  const sentence = postSentence(update);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open shared post"
      onPress={() => router.navigate({ pathname: '/post/[id]', params: { id: update.id } })}
      style={({ pressed }) => [styles.preview, fromMe ? styles.previewOutgoing : styles.previewIncoming, pressed && styles.pressed]}>
      <View style={styles.author}>
        <Avatar user={author} size={24} />
        <Text variant="callout" color={fg} numberOfLines={1} style={[styles.name, styles.bold]}>
          {author.name}
        </Text>
        <Icon name={meta.icon} size={14} color={iconColor} />
      </View>
      <Text variant="body" color={fg}>
        {sentence.map((segment, index) => (
          <Text key={index} variant="body" color={fg} style={segment.bold && styles.bold}>
            {segment.text}
          </Text>
        ))}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  preview: { gap: spacing.sm, padding: spacing.md, borderRadius: radius.md },
  // Soft tint so the preview reads as an attachment inside either bubble.
  previewIncoming: { backgroundColor: colors.background },
  previewOutgoing: { backgroundColor: colors.primaryDeep },
  author: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  name: { flexShrink: 1 },
  bold: { fontWeight: '700' },
  unavailable: { fontStyle: 'italic' },
  pressed: { opacity: 0.7 },
});
