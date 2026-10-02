import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  Button,
  ChipGroup,
  ComboField,
  FieldLabel,
  Icon,
  IconButton,
  Screen,
  Section,
  Text,
  TextField,
  TopBar,
} from '@/components/ui';
import { colors, spacing, tones } from '@/constants/theme';
import {
  assessmentFormats,
  companySuggestions,
  difficulties,
  finalRound,
  interviewRounds,
  interviewTypes,
  positionSuggestions,
  type Question,
} from '@/data/mock-data';
import { useStore, type NewUpdate } from '@/data/store';
import { isPrivateKind, shareKinds, updateKinds } from '@/data/update-kinds';

type ShareKind = (typeof shareKinds)[number];
type DraftQuestion = { text: string; difficulty: string };

const blankQuestion: DraftQuestion = { text: '', difficulty: '' };

// Tapping the selected option again clears it.
const toggle = (current: string, set: (value: string) => void) => (next: string) => set(next === current ? '' : next);

const unique = (items: string[]) => [...new Set(items.filter(Boolean))];

// Nobody knows how many rounds there will be: typing a number offers that round, and Final is always there.
function roundOptions(value: string) {
  const number = value.trim().match(/^(?:round\s*)?(\d+)$/i)?.[1];
  return number ? [`Round ${Number(number)}`, finalRound] : interviewRounds;
}

export default function ShareScreen() {
  const { addUpdate, updates } = useStore();
  const [kind, setKind] = useState<ShareKind>('interview');
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [round, setRound] = useState('');
  const [interviewType, setInterviewType] = useState('');
  const [format, setFormat] = useState('');
  const [questions, setQuestions] = useState<DraftQuestion[]>([blankQuestion]);

  const isPrivate = isPrivateKind(kind);
  const hasQuestions = kind === 'interview' || kind === 'assessment';
  const behavioral = interviewType.trim().toLowerCase() === 'behavioral';
  // Difficulty is a coding-question thing, so behavioral interviews don't ask for it.
  const hasDifficulty = kind === 'interview' && !behavioral;

  const companies = unique([...updates.map((update) => update.company), ...companySuggestions]);
  const positions = unique([...updates.map((update) => update.role), ...positionSuggestions]);
  const canShare = company.trim().length > 0 && position.trim().length > 0;

  const editQuestion = (index: number, patch: Partial<DraftQuestion>) =>
    setQuestions((items) => items.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  const share = () => {
    if (!canShare) return;
    // A question can be just the text, just the difficulty, or both.
    const filled: Question[] = questions
      .map((question) => ({
        text: question.text.trim() || undefined,
        difficulty: (hasDifficulty && question.difficulty.trim()) || undefined,
      }))
      .filter((question) => question.text || question.difficulty);
    const update: NewUpdate = { kind, company: company.trim(), role: position.trim() };
    if (kind === 'interview') {
      // A bare number typed without picking the suggestion still reads as a round.
      update.round = (/^\d+$/.test(round.trim()) ? `Round ${Number(round)}` : round.trim()) || undefined;
      update.interviewType = interviewType.trim() || undefined;
    }
    if (kind === 'assessment') update.assessmentFormat = format.trim() || undefined;
    if (hasQuestions && filled.length) update.questions = filled;
    addUpdate(update);
    setCompany('');
    setPosition('');
    setRound('');
    setInterviewType('');
    setFormat('');
    setQuestions([blankQuestion]);
    router.navigate(isPrivate ? '/profile' : '/');
  };

  return (
    <Screen
      flush
      keyboardShouldPersistTaps="handled"
      header={
        <TopBar
          title="New update"
          left={<IconButton icon="close" label="Close" tone="muted" onPress={() => router.navigate('/')} />}
        />
      }>
      <Section title="What happened?">
        <View style={styles.kinds}>
          {shareKinds.map((item) => {
            const meta = updateKinds[item];
            const tone = tones[meta.tone];
            const selected = item === kind;
            return (
              <Pressable
                key={item}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setKind(item)}
                style={({ pressed }) => [styles.kind, pressed && styles.pressed]}>
                <Icon name={meta.icon} size={22} color={selected ? tone.fg : colors.textFaint} />
                <Text variant="caption" color={selected ? colors.text : colors.textMuted} style={selected && styles.kindSelected}>
                  {meta.label}
                </Text>
                <View style={[styles.kindLine, selected && { backgroundColor: tone.fg }]} />
              </Pressable>
            );
          })}
        </View>
      </Section>

      <Section title="Details">
        <ComboField label="Company" value={company} onChangeText={setCompany} options={companies} placeholder="e.g. Stripe" />
        <ComboField
          label="Position"
          value={position}
          onChangeText={setPosition}
          options={positions}
          placeholder="e.g. Software Engineering Intern"
        />
        {kind === 'interview' ? (
          <View style={styles.pair}>
            <View style={styles.round}>
              <ComboField
                compact
                label="Round"
                value={round}
                onChangeText={setRound}
                options={roundOptions(round)}
                placeholder="2, Final"
              />
            </View>
            <View style={[styles.type, styles.group]}>
              <FieldLabel>Type</FieldLabel>
              <ChipGroup compact options={interviewTypes} value={interviewType} onChange={toggle(interviewType, setInterviewType)} />
            </View>
          </View>
        ) : null}
        {kind === 'assessment' ? (
          <View style={styles.group}>
            <FieldLabel>Format</FieldLabel>
            <ChipGroup options={assessmentFormats} value={format} onChange={toggle(format, setFormat)} />
          </View>
        ) : null}
      </Section>

      {hasQuestions ? (
        <Section title={kind === 'interview' ? 'Questions' : 'Questions or task'}>
          {questions.map((item, index) => (
            <View key={index} style={styles.group}>
              <View style={styles.questionRow}>
                <View style={styles.questionInput}>
                  <TextField
                    value={item.text}
                    onChangeText={(text) => editQuestion(index, { text })}
                    placeholder={
                      kind === 'assessment'
                        ? 'e.g. LRU Cache, or build a rate limiter'
                        : behavioral
                          ? 'e.g. Tell me about a time you failed'
                          : 'e.g. Two Sum, or a question they asked'
                    }
                    accessibilityLabel={`Question ${index + 1}`}
                  />
                </View>
                {questions.length > 1 ? (
                  <IconButton
                    icon="trash"
                    label={`Remove question ${index + 1}`}
                    tone="plain"
                    onPress={() => setQuestions((items) => items.filter((_, i) => i !== index))}
                  />
                ) : null}
              </View>
              {hasDifficulty ? (
                <ChipGroup
                  options={difficulties}
                  value={item.difficulty}
                  onChange={toggle(item.difficulty, (difficulty) => editQuestion(index, { difficulty }))}
                />
              ) : null}
            </View>
          ))}
          <View style={styles.addRow}>
            <Button
              label="Add another"
              icon="plus"
              variant="ghost"
              size="sm"
              onPress={() => setQuestions((items) => [...items, blankQuestion])}
            />
          </View>
          {hasDifficulty ? (
            <Text variant="caption" color={colors.textFaint}>
              Can&apos;t share the question? Just pick a difficulty.
            </Text>
          ) : null}
        </Section>
      ) : null}

      <Section>
        <Button
          label={isPrivate ? 'Log application' : 'Post to feed'}
          icon={isPrivate ? 'lock' : 'send'}
          size="lg"
          fullWidth
          disabled={!canShare}
          onPress={share}
        />
        <Text variant="caption" color={colors.textFaint} align="center">
          {!canShare
            ? 'Add a company and position to continue'
            : isPrivate
              ? 'Applications stay private and count toward your streak'
              : 'Your friends will see this on their feed'}
        </Text>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Flat, tab-like kind picker: icon over label, selected one underlined in its tone.
  kinds: { flexDirection: 'row', marginHorizontal: -spacing.sm },
  kind: { flex: 1, alignItems: 'center', gap: spacing.xs + 2, paddingTop: spacing.xs },
  kindSelected: { fontWeight: '700' },
  kindLine: { alignSelf: 'stretch', height: 2, marginTop: spacing.xs, backgroundColor: 'transparent' },
  group: { gap: spacing.sm },
  pair: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  // Just wide enough for "Round 12"; the type chips take the rest of the row.
  round: { width: 92 },
  type: { flex: 1 },
  questionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  questionInput: { flex: 1 },
  addRow: { flexDirection: 'row' },
  pressed: { opacity: 0.6 },
});
