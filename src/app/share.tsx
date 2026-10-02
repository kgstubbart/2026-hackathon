import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

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
} from '@/components/ui';
import { colors, radius, spacing, tones } from '@/constants/theme';
import {
  assessmentFormats,
  difficulties,
  interviewRounds,
  interviewTypes,
  type AssessmentFormat,
  type Difficulty,
  type InterviewType,
  type Question,
} from '@/data/mock-data';
import { useStore, type NewUpdate } from '@/data/store';
import { isPrivateKind, shareKinds, updateKinds } from '@/data/update-kinds';

type ShareKind = (typeof shareKinds)[number];
type DraftQuestion = { text: string; difficulty: Difficulty };

const blankQuestion: DraftQuestion = { text: '', difficulty: 'Medium' };

export default function ShareScreen() {
  const { addUpdate } = useStore();
  const [kind, setKind] = useState<ShareKind>('interview');
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [round, setRound] = useState<string>(interviewRounds[0]);
  const [interviewType, setInterviewType] = useState<InterviewType>('Technical');
  const [format, setFormat] = useState<AssessmentFormat>('Timed');
  const [questions, setQuestions] = useState<DraftQuestion[]>([blankQuestion]);

  const isPrivate = isPrivateKind(kind);
  const hasQuestions = kind === 'interview' || kind === 'assessment';
  const canShare = company.trim().length > 0 && position.trim().length > 0;

  const editQuestion = (index: number, patch: Partial<DraftQuestion>) =>
    setQuestions((items) => items.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  const share = () => {
    if (!canShare) return;
    const filled: Question[] = questions
      .filter((question) => question.text.trim())
      .map((question) => ({
        text: question.text.trim(),
        difficulty: kind === 'interview' ? question.difficulty : undefined,
      }));
    const update: NewUpdate = { kind, company: company.trim(), role: position.trim() };
    if (kind === 'interview') Object.assign(update, { round, interviewType });
    if (kind === 'assessment') update.assessmentFormat = format;
    if (hasQuestions && filled.length) update.questions = filled;
    addUpdate(update);
    setCompany('');
    setPosition('');
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
        <TextField label="Company" value={company} onChangeText={setCompany} placeholder="e.g. Stripe" />
        <TextField
          label="Position"
          value={position}
          onChangeText={setPosition}
          placeholder="e.g. Software Engineering Intern"
        />
        {kind === 'interview' ? (
          <>
            <View style={styles.group}>
              <FieldLabel>Round</FieldLabel>
              <ChipGroup options={interviewRounds} value={round} onChange={setRound} />
            </View>
            <View style={styles.group}>
              <FieldLabel>Type</FieldLabel>
              <ChipGroup options={interviewTypes} value={interviewType} onChange={setInterviewType} />
            </View>
          </>
        ) : null}
        {kind === 'assessment' ? (
          <View style={styles.group}>
            <FieldLabel>Format</FieldLabel>
            <ChipGroup options={assessmentFormats} value={format} onChange={setFormat} />
          </View>
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
                    <TextField
                      value={item.text}
                      onChangeText={(text) => editQuestion(index, { text })}
                      placeholder={
                        kind === 'interview'
                          ? 'e.g. Two Sum, or a question they asked'
                          : 'e.g. LRU Cache, or build a rate limiter'
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
                {kind === 'interview' ? (
                  <ChipGroup
                    options={difficulties}
                    value={item.difficulty}
                    onChange={(difficulty) => editQuestion(index, { difficulty })}
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
  questionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  questionInput: { flex: 1 },
  submit: { gap: spacing.sm, marginTop: spacing.xxl },
  pressed: { opacity: 0.75 },
});
