import { router, useFocusEffect } from 'expo-router';
import { Fragment, useCallback, useRef, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { Divider, Icon, Screen, SectionHeader, Text, type IconName } from '@/components/ui';
import { colors, layout, radius, spacing, tones, typography } from '@/constants/theme';
import { companyStats, experienceLabel, findQuestions, isExperience, summarizeCompanies } from '@/data/repository';
import { useStore } from '@/data/store';
import { updateKinds } from '@/data/update-kinds';

const openCompany = (company: string) => router.navigate({ pathname: '/company/[company]', params: { company } });
const openPost = (id: string) => router.navigate({ pathname: '/post/[id]', params: { id } });
const scopeNote = 'Experiences shared by the friends you are connected with';

// Repository of shared experiences: browse companies, or search by company and position (Uber-style two-field bar).
export default function SearchScreen() {
  const { updates, friendIds, currentUser } = useStore();
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [active, setActive] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setCompany('');
      setPosition('');
      setActive(false);
    }, []),
  );

  const circle = [...friendIds, currentUser.id];
  const experiences = updates.filter((update) => isExperience(update, circle));
  const companies = summarizeCompanies(experiences);
  const positions = [...new Set(experiences.map((update) => update.role))].sort();
  const terms = { company: company.trim().toLowerCase(), position: position.trim().toLowerCase() };
  const searching = Boolean(terms.company || terms.position);

  // Company rows that match both fields; each row lists the positions that matched.
  const companyHits = companies
    .map((item) => ({
      ...item,
      positions: item.positions.filter((role) => role.toLowerCase().includes(terms.position)),
    }))
    .filter((item) => item.company.toLowerCase().includes(terms.company) && item.positions.length);
  const questionHits = findQuestions(
    experiences.filter((update) => update.role.toLowerCase().includes(terms.position)),
    terms.company,
  ).filter((hit) => terms.company);

  if (!active) {
    return (
      <Screen scroll={false} header={<AppHeader />}>
        <Text variant="caption" color={colors.textMuted} style={styles.note}>
          {scopeNote}
        </Text>
        <View style={styles.idle}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.idleList}>
            <SectionHeader title="Companies" />
            <List>
              {companies.map((item) => (
                <Row
                  key={item.company}
                  title={<Text variant="headline">{item.company}</Text>}
                  subtitle={companyStats(item)}
                  onPress={() => openCompany(item.company)}
                />
              ))}
            </List>
            <Pressable
              accessibilityRole="link"
              onPress={() => router.navigate('/friends')}
              style={({ pressed }) => [styles.people, pressed && styles.pressed]}>
              <Icon name="friends" size={18} color={colors.primary} />
              <Text variant="callout" color={colors.primary}>
                Connect with more friends to grow the repository
              </Text>
            </Pressable>
          </ScrollView>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Search by company and position"
            onPress={() => setActive(true)}
            style={({ pressed }) => [styles.bar, pressed && styles.pressed]}>
            <View style={styles.fields}>
              <PreviewRow icon="briefcase" label="Company" />
              <Divider />
              <PreviewRow icon="profile" label="Position" />
            </View>
          </Pressable>
        </View>
      </Screen>
    );
  }

  return (
    <Screen keyboardShouldPersistTaps="handled" header={<AppHeader />}>
      <Text variant="caption" color={colors.textMuted} style={styles.note}>
        {scopeNote}
      </Text>
      <View style={styles.fields}>
        <SearchInput icon="briefcase" value={company} onChange={setCompany} placeholder="Company" suggestions={companies.map((item) => item.company)} autoFocus />
        <Divider />
        <SearchInput icon="profile" value={position} onChange={setPosition} placeholder="Position" suggestions={positions} />
      </View>

      {searching ? (
        <>
          {companyHits.length ? (
            <>
              <SectionHeader title="Companies" />
              <List>
                {companyHits.map((item) => (
                  <Row
                    key={item.company}
                    title={<Highlight text={item.company} query={terms.company} />}
                    subtitle={terms.position ? item.positions.join(' · ') : companyStats(item)}
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
                      title={<Highlight text={hit.text} query={terms.company} />}
                      subtitle={[hit.update.company, hit.update.role, experienceLabel(hit.update), hit.difficulty].filter(Boolean).join(' · ')}
                      onPress={() => openPost(hit.update.id)}
                    />
                  );
                })}
              </List>
            </>
          ) : null}
          {!companyHits.length && !questionHits.length ? (
            <Text variant="body" color={colors.textMuted} align="center" style={styles.empty}>
              None of your friends have shared that yet.
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
                title={<Text variant="headline">{item.company}</Text>}
                subtitle={companyStats(item)}
                onPress={() => openCompany(item.company)}
              />
            ))}
          </List>
        </>
      )}
    </Screen>
  );
}

function PreviewRow({ icon, label }: { icon: IconName; label: string }) {
  return (
    <View style={styles.inputRow}>
      <Icon name={icon} size={20} color={colors.textMuted} />
      <Text variant="headline" color={colors.textFaint}>
        {label}
      </Text>
    </View>
  );
}

type SearchInputProps = {
  icon: IconName;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  suggestions: string[];
  autoFocus?: boolean;
};

// One line of the two-field bar; suggests matching companies or positions from the repository while typing.
function SearchInput({ icon, value, onChange, placeholder, suggestions, autoFocus }: SearchInputProps) {
  const [focused, setFocused] = useState(false);
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const query = value.trim().toLowerCase();
  const matches = query
    ? suggestions
        .filter((suggestion) => suggestion.toLowerCase().includes(query) && suggestion.toLowerCase() !== query)
        .sort((a, b) => Number(b.toLowerCase().startsWith(query)) - Number(a.toLowerCase().startsWith(query)))
        .slice(0, 5)
    : [];

  const clearBlurTimeout = () => {
    if (blurTimeout.current) clearTimeout(blurTimeout.current);
    blurTimeout.current = null;
  };

  return (
    <View style={[styles.inputGroup, focused && styles.focusedInputGroup]}>
      <View style={styles.inputRow}>
        <Icon name={icon} size={20} color={colors.textMuted} />
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.textFaint}
          autoFocus={autoFocus}
          autoCorrect={false}
          returnKeyType="search"
          onFocus={() => {
            clearBlurTimeout();
            setFocused(true);
          }}
          onBlur={() => {
            clearBlurTimeout();
            blurTimeout.current = setTimeout(() => setFocused(false), 150);
          }}
          style={styles.input}
        />
        {focused && value ? (
          <Pressable accessibilityRole="button" accessibilityLabel={`Clear ${placeholder}`} hitSlop={10} onPress={() => onChange('')}>
            <Icon name="clear" size={20} color={colors.text} />
          </Pressable>
        ) : null}
      </View>
      {focused && matches.length > 0 ? (
        <View style={styles.suggestions}>
          {matches.map((suggestion) => (
            <Pressable
              key={suggestion}
              accessibilityRole="button"
              accessibilityLabel={`Use ${suggestion}`}
              onPress={() => {
                clearBlurTimeout();
                onChange(suggestion);
                setFocused(false);
              }}
              style={({ pressed }) => [styles.suggestion, pressed && styles.pressed]}>
              <Text variant="callout">{suggestion}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
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

function IconTile({ icon, tone }: { icon: IconName; tone: keyof typeof tones }) {
  return (
    <View style={[styles.tile, { backgroundColor: tones[tone].bg }]}>
      <Icon name={icon} size={18} color={tones[tone].fg} />
    </View>
  );
}

type RowProps = { leading?: ReactNode; title: ReactNode; subtitle?: string; onPress: () => void };

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
  const start = query ? text.toLowerCase().indexOf(query) : -1;
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
  note: { marginBottom: spacing.sm },
  idle: { flex: 1, minHeight: 0 },
  idleList: { paddingBottom: spacing.md },
  // The two-field bar: white block, one field per line, hairline divider between.
  bar: { paddingVertical: spacing.md, backgroundColor: colors.background },
  fields: { backgroundColor: colors.surface, paddingHorizontal: spacing.lg, zIndex: 2 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, height: spacing.xxxl + spacing.xl },
  input: { ...typography.headline, fontWeight: '400', flex: 1, height: '100%', color: colors.text },
  inputGroup: { position: 'relative' },
  focusedInputGroup: { zIndex: 10 },
  suggestions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 20,
    elevation: 4,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingVertical: spacing.xs,
  },
  suggestion: { minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.sm },
  // Bleed past the gutter so the white list runs edge to edge like the feed.
  list: { backgroundColor: colors.surface, marginHorizontal: -layout.gutter, paddingHorizontal: layout.gutter },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, minHeight: 60 },
  rowText: { flex: 1, gap: spacing.xxs },
  tile: { width: 40, height: 40, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  regular: { fontWeight: '400' },
  empty: { marginTop: spacing.xxl },
  people: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.lg, minHeight: 44 },
  pressed: { opacity: 0.6 },
});
