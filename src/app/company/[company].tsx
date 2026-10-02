import { router, useLocalSearchParams } from 'expo-router';
import { Fragment } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { CompanyMark, Divider, Icon, IconButton, Screen, Section, Text, TopBar } from '@/components/ui';
import { colors, radius, spacing, tones } from '@/constants/theme';
import type { Update } from '@/data/mock-data';
import { companyStats, experienceLabel, groupByPosition, isExperience, summarizeCompanies } from '@/data/repository';
import { useStore } from '@/data/store';
import { timeAgo, updateKinds } from '@/data/update-kinds';

const back = () => (router.canGoBack() ? router.back() : router.navigate('/search'));

// One company in the repository: its positions, and under each the shared interviews, OAs and offers.
export default function CompanyScreen() {
  const { company } = useLocalSearchParams<{ company: string }>();
  const { updates, getUser } = useStore();
  const experiences = updates.filter((update) => isExperience(update) && update.company === company);
  const summary = summarizeCompanies(experiences)[0];

  return (
    <Screen
      flush
      header={
        <TopBar
          title={company ?? 'Company'}
          left={<IconButton icon="back" label="Back" tone="muted" onPress={back} />}
          right={<CompanyMark company={company ?? '?'} size={36} />}
        />
      }>

      {summary ? (
        groupByPosition(experiences).map((group) => (
          <Section key={group.position} title={group.position}>
            <View style={styles.list}>
              {group.updates.map((update, index) => (
                <Fragment key={update.id}>
                  {index > 0 ? <Divider /> : null}
                  <ExperienceRow update={update} author={getUser(update.userId).name} />
                </Fragment>
              ))}
            </View>
          </Section>
        ))
      ) : (
        <Text variant="body" color={colors.textMuted} align="center" style={styles.empty}>
          Nothing shared about {company} yet.
        </Text>
      )}

      {summary ? (
        <Text variant="caption" color={colors.textFaint} align="center" style={styles.footnote}>
          {companyStats(summary)}
        </Text>
      ) : null}
    </Screen>
  );
}

function ExperienceRow({ update, author }: { update: Update; author: string }) {
  const meta = updateKinds[update.kind];
  const tone = tones[meta.tone];
  const questions = update.questions?.map((question) => question.text || `${question.difficulty} question`) ?? [];
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.navigate({ pathname: '/post/[id]', params: { id: update.id } })}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={[styles.tile, { backgroundColor: tone.bg }]}>
        <Icon name={meta.icon} size={18} color={tone.fg} />
      </View>
      <View style={styles.rowText}>
        <Text variant="headline">{experienceLabel(update)}</Text>
        {questions.length ? (
          <Text variant="callout" color={colors.text} numberOfLines={2}>
            {questions.join(' · ')}
          </Text>
        ) : null}
        <Text variant="caption" color={colors.textFaint}>
          {author} · {timeAgo(update.createdAt)}
        </Text>
      </View>
      <Icon name="forward" size={16} color={colors.textFaint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: { marginTop: -spacing.sm },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, paddingVertical: spacing.md },
  rowText: { flex: 1, gap: spacing.xxs },
  tile: { width: 40, height: 40, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  empty: { paddingVertical: spacing.xxl },
  footnote: { paddingVertical: spacing.lg },
  pressed: { opacity: 0.6 },
});
