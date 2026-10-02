import { StyleSheet, View } from 'react-native';

import { Chip, Icon, Section, Text } from '@/components/ui';
import { colors, radius, spacing, tones, type Tone } from '@/constants/theme';
import type { Update } from '@/data/mock-data';
import { updateKinds } from '@/data/update-kinds';

// Difficulty pills borrow the kind tones: easy is calm, hard is loud.
const difficultyTone: Record<string, Tone> = { easy: 'mint', medium: 'amber', hard: 'rose' };

// The post page's own section for an interview or takehome/OA: round/type/format as chips, then every
// question as a numbered row with the difficulty as a colored pill. Big and scannable, since the questions
// are the reason people open these posts.
export function QuestionList({ update }: { update: Update }) {
  const facts = [update.round, update.interviewType, update.assessmentFormat].filter((fact): fact is string => Boolean(fact));
  const questions = update.questions ?? [];
  if (!facts.length && !questions.length) return null;

  const meta = updateKinds[update.kind];
  const title = update.kind === 'takehome' ? 'Questions or task' : 'Interview questions';

  return (
    <Section title={questions.length ? `${title} · ${questions.length}` : title}>
      {facts.length ? (
        <View style={styles.facts}>
          {facts.map((fact) => (
            <Chip key={fact} label={fact} icon={meta.icon} />
          ))}
        </View>
      ) : null}
      {questions.map((question, index) => {
        const tone = question.difficulty ? tones[difficultyTone[question.difficulty.toLowerCase()] ?? 'primary'] : null;
        return (
          <View key={index} style={[styles.question, index > 0 && styles.questionDivider]}>
            <View style={[styles.number, { backgroundColor: tones[meta.tone].bg }]}>
              <Text variant="callout" color={tones[meta.tone].fg} style={styles.numberText}>
                {index + 1}
              </Text>
            </View>
            <Text variant="headline" style={styles.text}>
              {question.text || 'Question not shared'}
            </Text>
            {question.difficulty && tone ? (
              <View style={[styles.pill, { backgroundColor: tone.bg }]}>
                <Text variant="caption" color={tone.fg} style={styles.pillText}>
                  {question.difficulty}
                </Text>
              </View>
            ) : null}
          </View>
        );
      })}
      {questions.length ? null : (
        <View style={styles.none}>
          <Icon name="comment" size={16} color={colors.textFaint} />
          <Text variant="body" color={colors.textMuted}>
            No questions shared. Ask in the comments.
          </Text>
        </View>
      )}
    </Section>
  );
}

const styles = StyleSheet.create({
  facts: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  question: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xs },
  questionDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, paddingTop: spacing.md },
  number: { width: 28, height: 28, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  numberText: { fontWeight: '700' },
  text: { flex: 1 },
  pill: { paddingHorizontal: spacing.sm + 2, paddingVertical: spacing.xs, borderRadius: radius.pill },
  pillText: { fontWeight: '700' },
  none: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
