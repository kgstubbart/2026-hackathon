import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { UpdateCard } from '@/components/update-card';
import {
  Button,
  Card,
  ChipGroup,
  FieldLabel,
  Icon,
  IconButton,
  Screen,
  ScreenHeader,
  SectionHeader,
  Text,
  TextField,
  type IconName,
} from '@/components/ui';
import { colors, radius, spacing, tones } from '@/constants/theme';
import { interviewStages, terms, type UpdateKind, type Visibility } from '@/data/mock-data';
import { useStore } from '@/data/store';
import { updateKindOrder, updateKinds } from '@/data/update-kinds';

export default function ShareScreen() {
  const { addUpdate, currentUser } = useStore();
  const [kind, setKind] = useState<UpdateKind>('offer');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [term, setTerm] = useState(terms[0]);
  const [stage, setStage] = useState(interviewStages[0]);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [note, setNote] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('friends');

  const draft = {
    kind,
    company: company.trim(),
    role: role.trim(),
    term,
    stage: kind === 'interview' ? stage : undefined,
    title: kind === 'milestone' ? title.trim() : undefined,
    location: location.trim() || undefined,
    note: note.trim() || undefined,
    visibility,
  };
  const canShare = draft.company.length > 0 && draft.role.length > 0;

  const share = () => {
    if (!canShare) return;
    addUpdate(draft);
    setCompany('');
    setRole('');
    setTitle('');
    setLocation('');
    setNote('');
    router.navigate('/');
  };

  return (
    <Screen keyboardShouldPersistTaps="handled">
      <ScreenHeader
        eyebrow="New update"
        title="Share your news"
        right={<IconButton icon="close" label="Close" onPress={() => router.navigate('/')} />}
      />

      <Text variant="headline" style={styles.question}>
        What happened?
      </Text>
      <View style={styles.kinds}>
        {updateKindOrder.map((item) => {
          const meta = updateKinds[item];
          const tone = tones[meta.tone];
          const selected = item === kind;
          return (
            <Pressable
              key={item}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => setKind(item)}
              style={({ pressed }) => [
                styles.kind,
                selected && { borderColor: tone.fg, backgroundColor: tone.bg },
                pressed && styles.pressed,
              ]}>
              <View style={[styles.kindIcon, { backgroundColor: selected ? tone.fg : tone.bg }]}>
                <Icon name={meta.icon} size={16} color={selected ? colors.onPrimary : tone.fg} />
              </View>
              <View style={styles.kindText}>
                <Text variant="callout" style={styles.kindLabel}>
                  {meta.label}
                </Text>
                <Text variant="caption" color={colors.textMuted} numberOfLines={1}>
                  {meta.description}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <SectionHeader title="Details" />
      <Card style={styles.form}>
        <TextField label="Company" value={company} onChangeText={setCompany} placeholder="e.g. Stripe" />
        <TextField label="Role" value={role} onChangeText={setRole} placeholder="e.g. Software Engineering Intern" />
        {kind === 'milestone' ? (
          <TextField label="Milestone" value={title} onChangeText={setTitle} placeholder="e.g. Shipped my first feature" />
        ) : null}
        {kind === 'interview' ? (
          <View style={styles.group}>
            <FieldLabel>Stage</FieldLabel>
            <ChipGroup options={interviewStages} value={stage} onChange={setStage} />
          </View>
        ) : null}
        <View style={styles.group}>
          <FieldLabel>Term</FieldLabel>
          <ChipGroup options={terms} value={term} onChange={setTerm} />
        </View>
        <TextField label="Location (optional)" value={location} onChangeText={setLocation} placeholder="e.g. San Francisco, CA" />
        <TextField
          label="Comment (optional)"
          value={note}
          onChangeText={setNote}
          placeholder="Anything your friends should know?"
          multiline
        />
      </Card>

      <SectionHeader title="Who can see this" />
      <View style={styles.audience}>
        <AudienceOption
          icon="friends"
          label="Friends"
          caption="Your circle gets notified"
          selected={visibility === 'friends'}
          onPress={() => setVisibility('friends')}
        />
        <AudienceOption
          icon="lock"
          label="Only me"
          caption="Track it privately"
          selected={visibility === 'private'}
          onPress={() => setVisibility('private')}
        />
      </View>

      <SectionHeader title="Preview" />
      <View style={styles.preview}>
        <UpdateCard
          preview
          author={currentUser}
          update={{
            ...draft,
            id: 'preview',
            userId: currentUser.id,
            company: draft.company || 'Company',
            createdAt: 0,
            congrats: 0,
            comments: 0,
          }}
        />
      </View>

      <View style={styles.submit}>
        <Button
          label={visibility === 'friends' ? 'Share with friends' : 'Save privately'}
          icon={visibility === 'friends' ? 'send' : 'lock'}
          size="lg"
          fullWidth
          disabled={!canShare}
          onPress={share}
        />
        {!canShare ? (
          <Text variant="caption" color={colors.textFaint} align="center">
            Add a company and role to share
          </Text>
        ) : null}
      </View>
    </Screen>
  );
}

type AudienceOptionProps = { icon: IconName; label: string; caption: string; selected: boolean; onPress: () => void };

function AudienceOption({ icon, label, caption, selected, onPress }: AudienceOptionProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.option, selected && styles.optionSelected, pressed && styles.pressed]}>
      <View style={styles.optionTop}>
        <Icon name={icon} size={18} color={selected ? colors.primary : colors.textMuted} />
        <View style={[styles.radio, selected && styles.radioSelected]}>
          {selected ? <Icon name="check" size={10} color={colors.onPrimary} /> : null}
        </View>
      </View>
      <Text variant="headline">{label}</Text>
      <Text variant="caption" color={colors.textMuted}>
        {caption}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  question: { marginBottom: spacing.md },
  kinds: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  kind: {
    flexGrow: 1,
    flexBasis: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  kindIcon: { width: 32, height: 32, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  kindText: { flex: 1 },
  kindLabel: { fontWeight: '700' },
  form: { gap: spacing.lg },
  group: { gap: spacing.sm },
  audience: { flexDirection: 'row', gap: spacing.sm },
  option: {
    flex: 1,
    gap: spacing.xs,
    padding: spacing.md + 2,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  optionTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
  preview: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  submit: { gap: spacing.sm, marginTop: spacing.lg },
  pressed: { opacity: 0.75 },
});
