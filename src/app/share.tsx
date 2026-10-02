import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  Button,
  Card,
  ComboField,
  Icon,
  IconButton,
  Screen,
  ScreenHeader,
  SectionHeader,
  Text,
} from '@/components/ui';
import { colors, radius, spacing, tones } from '@/constants/theme';
import {
  assessmentFormats,
  assessmentTasks,
  behavioralQuestions,
  companySuggestions,
  difficulties,
  finalRound,
  interviewRounds,
  interviewTypes,
  positionSuggestions,
  technicalQuestions,
  type Question,
} from '@/data/mock-data';
import { useStore, type NewUpdate } from '@/data/store';
import { isPrivateKind, shareKinds, updateKinds } from '@/data/update-kinds';

type ShareKind = (typeof shareKinds)[number];
type DraftQuestion = { text: string; difficulty: string };

const blankQuestion: DraftQuestion = { text: '', difficulty: '' };

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
  const questionOptions =
    kind === 'assessment'
      ? [...technicalQuestions, ...assessmentTasks]
      : behavioral
        ? behavioralQuestions
        : interviewType.trim().toLowerCase() === 'technical'
          ? technicalQuestions
          : [...technicalQuestions, ...behavioralQuestions];
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
        <ComboField label="Company" value={company} onChangeText={setCompany} options={companies} placeholder="e.g. Stripe" />
        <ComboField
          label="Position"
          value={position}
          onChangeText={setPosition}
          options={positions}
          placeholder="e.g. Software Engineering Intern"
        />
        {kind === 'interview' ? (
          <>
            <ComboField
              label="Round"
              value={round}
              onChangeText={setRound}
              options={roundOptions(round)}
              placeholder="Pick one, or type a round number"
            />
            <ComboField
              label="Type"
              value={interviewType}
              onChangeText={setInterviewType}
              options={interviewTypes}
              placeholder="Behavioral, technical or mixed"
            />
          </>
        ) : null}
        {kind === 'assessment' ? (
          <ComboField
            label="Format"
            value={format}
            onChangeText={setFormat}
            options={assessmentFormats}
            placeholder="Timed or take-home"
          />
        ) : null}
      </Card>

      {hasQuestions ? (
        <>
          <SectionHeader title={kind === 'interview' ? 'Questions' : 'Questions or task'} />
          <Card style={styles.form}>
            {questions.map((item, index) => (
              <View key={index} style={styles.group}>
                <View style={styles.questionRow}>
                  <View style={styles.questionInput}>
                    <ComboField
                      value={item.text}
                      onChangeText={(text) => editQuestion(index, { text })}
                      options={questionOptions}
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
                  <ComboField
                    value={item.difficulty}
                    onChangeText={(difficulty) => editQuestion(index, { difficulty })}
                    options={difficulties}
                    placeholder="Difficulty"
                    accessibilityLabel={`Difficulty of question ${index + 1}`}
                  />
                ) : null}
              </View>
            ))}
            <Button
              label="Add another"
              icon="plus"
              variant="secondary"
              size="sm"
              onPress={() => setQuestions((items) => [...items, blankQuestion])}
            />
            {hasDifficulty ? (
              <Text variant="caption" color={colors.textFaint}>
                Can&apos;t share the question? Just pick a difficulty.
              </Text>
            ) : null}
          </Card>
        </>
      ) : null}

      <View style={styles.submit}>
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
      </View>
    </Screen>
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
  questionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  questionInput: { flex: 1 },
  submit: { gap: spacing.sm, marginTop: spacing.xxl },
  pressed: { opacity: 0.75 },
});
