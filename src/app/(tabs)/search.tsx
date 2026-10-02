import { router, useFocusEffect } from 'expo-router';
import { Fragment, useCallback, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { CompanyMark, Divider, Icon, Screen, ScreenHeader, SearchField, SectionHeader, Text, type IconName } from '@/components/ui';
import { colors, layout, radius, spacing, tones } from '@/constants/theme';
import { companyStats, experienceLabel, findQuestions, isExperience, summarizeCompanies } from '@/data/repository';
import { useStore } from '@/data/store';
import { updateKinds } from '@/data/update-kinds';

const openCompany = (company: string) => router.navigate({ pathname: '/company/[company]', params: { company } });
const openPost = (id: string) => router.navigate({ pathname: '/post/[id]', params: { id } });

// Repository of shared experiences: browse companies, or search companies, positions and questions.
export default function SearchScreen() {
  const { updates, getUser } = useStore();
  const [query, setQuery] = useState('');

  useFocusEffect(useCallback(() => setQuery(''), []));

  const experiences = updates.filter(isExperience);
  const companies = summarizeCompanies(experiences);
  const q = query.trim().toLowerCase();

  const companyHits = q ? companies.filter((item) => item.company.toLowerCase().includes(q)) : [];
  const positionHits = q
    ? companies.flatMap((item) =>
        item.positions.filter((position) => position.toLowerCase().includes(q)).map((position) => ({ company: item.company, position })),
      )
    : [];
  const questionHits = q ? findQuestions(experiences, q) : [];
  const nothing = q && !companyHits.length && !positionHits.length && !questionHits.length;

  return (
    <Screen keyboardShouldPersistTaps="handled">
      <ScreenHeader title="Search" />
      <SearchField
        value={query}
        onChangeText={setQuery}
        placeholder="Company, position or question"
        autoCorrect={false}
        returnKeyType="search"
      />

      {q ? (
        <>
          {companyHits.length ? (
            <>
              <SectionHeader title="Companies" />
              <List>
                {companyHits.map((item) => (
                  <Row
                    key={item.company}
                    leading={<CompanyMark company={item.company} size={40} />}
                    title={<Highlight text={item.company} query={q} />}
                    subtitle={companyStats(item)}
                    onPress={() => openCompany(item.company)}
                  />
                ))}
              </List>
            </>
          ) : null}

          {positionHits.length ? (
            <>
              <SectionHeader title="Positions" />
              <List>
                {positionHits.map((item) => (
                  <Row
                    key={`${item.company}-${item.position}`}
                    leading={<IconTile icon="briefcase" />}
                    title={<Highlight text={item.position} query={q} />}
                    subtitle={item.company}
                    onPress={() => openCompany(item.company)}
                  />
                ))}
              </List>
            </>
          ) : null}

          {questionHits.length ? (
            <>
              <SectionHeader title="Questions" />
              <List>
                {questionHits.map((hit, index) => {
                  const meta = updateKinds[hit.update.kind];
                  return (
                    <Row
                      key={`${hit.update.id}-${index}`}
                      leading={<IconTile icon={meta.icon} tone={meta.tone} />}
                      title={<Highlight text={hit.text} query={q} />}
                      subtitle={[hit.update.company, hit.update.role, experienceLabel(hit.update), hit.difficulty]
                        .filter(Boolean)
                        .join(' · ')}
                      onPress={() => openPost(hit.update.id)}
                    />
                  );
                })}
              </List>
            </>
          ) : null}

          {nothing ? (
            <Text variant="body" color={colors.textMuted} align="center" style={styles.empty}>
              Nothing shared about “{query}” yet.
            </Text>
          ) : null}
        </>
      ) : (
        <>
          <SectionHeader title="Companies" />
          <List>
            {companies.map((item) => (
              <Row
                key={item.company}
                leading={<CompanyMark company={item.company} size={40} />}
                title={<Text variant="headline">{item.company}</Text>}
                subtitle={companyStats(item)}
                onPress={() => openCompany(item.company)}
              />
            ))}
          </List>
          <Text variant="caption" color={colors.textFaint} align="center" style={styles.footnote}>
            {experiences.length} experiences shared by {new Set(experiences.map((update) => getUser(update.userId).id)).size} people
          </Text>
          <Pressable
            accessibilityRole="link"
            onPress={() => router.navigate('/friends')}
            style={({ pressed }) => [styles.people, pressed && styles.pressed]}>
            <Icon name="friends" size={18} color={colors.primary} />
            <Text variant="callout" color={colors.primary}>
              Looking for people? Find friends
            </Text>
          </Pressable>
        </>
      )}
    </Screen>
  );
}

// Full-width white list with hairline dividers, like the feed.
function List({ children }: { children: ReactNode[] }) {
  return (
    <View style={styles.list}>
      {children.map((child, index) => (
        <Fragment key={index}>
          {index > 0 ? <Divider /> : null}
          {child}
        </Fragment>
      ))}
    </View>
  );
}

function IconTile({ icon, tone }: { icon: IconName; tone?: keyof typeof tones }) {
  const fg = tone ? tones[tone].fg : colors.textMuted;
  const bg = tone ? tones[tone].bg : colors.background;
  return (
    <View style={[styles.tile, { backgroundColor: bg }]}>
      <Icon name={icon} size={18} color={fg} />
    </View>
  );
}

type RowProps = { leading: ReactNode; title: ReactNode; subtitle?: string; onPress: () => void };

function Row({ leading, title, subtitle, onPress }: RowProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      {leading}
      <View style={styles.rowText}>
        {title}
        {subtitle ? (
          <Text variant="caption" color={colors.textMuted} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Icon name="forward" size={16} color={colors.textFaint} />
    </Pressable>
  );
}

// Bolds the part of `text` that matches the query.
function Highlight({ text, query }: { text: string; query: string }) {
  const start = text.toLowerCase().indexOf(query);
  if (start < 0) return <Text variant="headline">{text}</Text>;
  const end = start + query.length;
  return (
    <Text variant="headline" style={styles.regular}>
      {text.slice(0, start)}
      <Text variant="headline">{text.slice(start, end)}</Text>
      {text.slice(end)}
    </Text>
  );
}

const styles = StyleSheet.create({
  // Bleed past the gutter so the white list runs edge to edge like the feed.
  list: { backgroundColor: colors.surface, marginHorizontal: -layout.gutter, paddingHorizontal: layout.gutter },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, minHeight: 64 },
  rowText: { flex: 1, gap: spacing.xxs },
  tile: { width: 40, height: 40, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  regular: { fontWeight: '400' },
  empty: { marginTop: spacing.xxl },
  footnote: { marginTop: spacing.lg },
  people: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.lg, minHeight: 44 },
  pressed: { opacity: 0.6 },
});
