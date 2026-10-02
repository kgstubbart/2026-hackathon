import { useFocusEffect } from 'expo-router';
import { Fragment, useCallback, useRef, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { KindBadge, UpdateCard } from '@/components/update-card';
import { Avatar, Button, Card, Chip, Divider, Icon, Screen, ScreenHeader, SectionHeader, Text, type IconName } from '@/components/ui';
import { colors, radius, spacing, typography } from '@/constants/theme';
import type { Update, User } from '@/data/mock-data';
import { useStore } from '@/data/store';
import { headlineFor, timeAgo, updateKinds } from '@/data/update-kinds';

const recentSearches = ['Stripe', 'Figma', 'Goldman Sachs'];
const companySuggestions = ['Airbnb', 'Duolingo', 'Figma', 'Goldman Sachs', 'Microsoft', 'Notion', 'Ramp', 'Spotify', 'Stripe'];
const jobTitleSuggestions = [
  'Data Analyst Intern',
  'Machine Learning Intern',
  'Product Design Intern',
  'Software Engineering Intern',
  'Summer Analyst',
  'UX Research Intern',
];
const postCount = (count: number) => `${count} ${count === 1 ? 'post' : 'posts'} from friends`;
type SearchMode = 'posts' | 'people';

export default function SearchScreen() {
  const { updates, friendIds, getUser, toggleCongrats } = useStore();
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [mode, setMode] = useState<SearchMode>('posts');
  const [searchActive, setSearchActive] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setCompany('');
      setJobTitle('');
      setOpenId(null);
      setMode('posts');
      setSearchActive(false);
    }, []),
  );

  const friendPosts = updates.filter((update) => friendIds.includes(update.userId) && update.visibility === 'friends');
  const terms = { company: company.trim().toLowerCase(), jobTitle: jobTitle.trim().toLowerCase() };
  const searching = Boolean(terms.company || terms.jobTitle);
  const results = friendPosts.filter((update) => {
    return (
      update.company.toLowerCase().includes(terms.company) &&
      update.role.toLowerCase().includes(terms.jobTitle)
    );
  });

  const selectMode = (nextMode: SearchMode) => {
    setMode(nextMode);
    if (nextMode === 'people') setSearchActive(true);
  };

  if (!searchActive && mode === 'posts') {
    return (
      <Screen scroll={false}>
        <ScreenHeader title="Search" />
        <ModeToggle mode={mode} onChange={selectMode} />
        <View style={styles.idleLayout}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.idleList}>
            <SectionHeader title="Your circle" />
            <Card flush style={styles.feedContainer}>
              {friendIds.map((friendId, index) => (
                <Fragment key={friendId}>
                  {index > 0 ? <Divider /> : null}
                  <IdleFriendRow user={getUser(friendId)} latest={updates.find((update) => update.userId === friendId)} />
                </Fragment>
              ))}
            </Card>
          </ScrollView>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Start searching posts"
            onPress={() => setSearchActive(true)}
            style={({ pressed }) => [styles.idleSearch, pressed && styles.pressed]}>
            <SearchCriteriaPreview />
          </Pressable>
        </View>
      </Screen>
    );
  }

  return (
    <Screen keyboardShouldPersistTaps="handled">
      <ScreenHeader title="Search" />
      <ModeToggle mode={mode} onChange={selectMode} />

      {mode === 'posts' ? (
        <>
        <View style={styles.fields}>
          <View style={styles.inputs}>
            <SearchInput icon="briefcase" value={company} onChange={setCompany} placeholder="Company" suggestions={companySuggestions} autoFocus />
            <Divider />
            <SearchInput icon="profile" value={jobTitle} onChange={setJobTitle} placeholder="Job title" suggestions={jobTitleSuggestions} />
          </View>
        </View>
        <View style={styles.results}>
          <Card flush style={styles.feedContainer}>
          {searching ? (
            <>
              {results.map((update, index) => {
                const author = getUser(update.userId);
                return (
                  <Fragment key={update.id}>
                    {openId === update.id ? (
                      <View style={styles.expanded}>
                        <UpdateCard update={update} author={author} onCongrats={() => toggleCongrats(update.id)} />
                      </View>
                    ) : (
                      <ResultRow
                        icon={updateKinds[update.kind].icon}
                        title={<Highlight text={update.company} query={terms.company} />}
                        subtitle={[author.name, update.role, update.location ?? author.location].join(' · ')}
                        onPress={() => setOpenId(update.id)}
                      />
                    )}
                  </Fragment>
                );
              })}
              {results.length === 0 ? (
                <Text variant="body" color={colors.textMuted} align="center" style={styles.empty}>
                  None of your friends have posted about that yet.
                </Text>
              ) : null}
            </>
          ) : (
            <>
              {recentSearches.map((term) => (
                <ResultRow
                  key={term}
                  icon="clock"
                  title={<Text variant="headline">{term}</Text>}
                  subtitle={postCount(friendPosts.filter((update) => update.company === term).length)}
                  onPress={() => setCompany(term)}
                />
              ))}
              </>
          )}
          </Card>
        </View>
        </>
      ) : (
        <PeopleSearch />
      )}
    </Screen>
  );
}

function ModeToggle({ mode, onChange }: { mode: SearchMode; onChange: (mode: SearchMode) => void }) {
  return (
    <View style={styles.modeToggle}>
      <Chip label="Posts" selected={mode === 'posts'} onPress={() => onChange('posts')} />
      <Chip label="People" selected={mode === 'people'} onPress={() => onChange('people')} />
    </View>
  );
}

function IdleFriendRow({ user, latest }: { user: User; latest?: Update }) {
  return (
    <View style={styles.friendRow}>
      <Avatar user={user} size={44} />
      <View style={styles.friendText}>
        <Text variant="headline" numberOfLines={1}>
          {user.name}
        </Text>
        <Text variant="caption" color={colors.textMuted} numberOfLines={1}>
          {user.major} · {user.school}
        </Text>
        {latest ? (
          <Text variant="caption" color={colors.textFaint} numberOfLines={1}>
            {headlineFor(latest)} · {timeAgo(latest.createdAt)}
          </Text>
        ) : null}
      </View>
      {latest ? <KindBadge kind={latest.kind} /> : null}
    </View>
  );
}

function SearchCriteriaPreview() {
  return (
    <View style={styles.fields}>
      <CriteriaPreviewRow icon="briefcase" label="Company" />
      <Divider />
      <CriteriaPreviewRow icon="profile" label="Job title" />
    </View>
  );
}

function CriteriaPreviewRow({ icon, label }: { icon: IconName; label: string }) {
  return (
    <View style={styles.previewRow}>
      <Icon name={icon} size={20} color={colors.textMuted} />
      <Text variant="headline" color={colors.textFaint}>
        {label}
      </Text>
    </View>
  );
}

function PeopleSearch() {
  const { users, currentUser, friendIds, requestIds, toggleFriend, acceptRequest } = useStore();
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();
  const people = users.filter((user) => {
    if (user.id === currentUser.id) return false;
    return `${user.name} ${user.school} ${user.major}`.toLowerCase().includes(normalizedQuery);
  });

  return (
    <>
      <PeopleSearchInput value={query} onChange={setQuery} />
      <SectionHeader title={normalizedQuery ? 'Matches' : 'People on StrJava'} />
      {people.length ? (
        <Card flush style={styles.feedContainer}>
          {people.map((user, index) => (
            <Fragment key={user.id}>
              {index > 0 ? <Divider /> : null}
              <PersonSearchRow
                user={user}
                isFriend={friendIds.includes(user.id)}
                hasRequest={requestIds.includes(user.id)}
                onAdd={() => toggleFriend(user.id)}
                onAccept={() => acceptRequest(user.id)}
              />
            </Fragment>
          ))}
        </Card>
      ) : (
        <Text variant="body" color={colors.textMuted} align="center" style={styles.empty}>
          No one matches “{query}”.
        </Text>
      )}
    </>
  );
}

function PeopleSearchInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <View style={styles.fields}>
      <View style={styles.peopleInputRow}>
        <Icon name="search" size={20} color={colors.textMuted} />
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder="Search by name, school, or major"
          placeholderTextColor={colors.textFaint}
          autoFocus
          autoCorrect={false}
          style={styles.peopleInput}
        />
      </View>
    </View>
  );
}

function PersonSearchRow({
  user,
  isFriend,
  hasRequest,
  onAdd,
  onAccept,
}: {
  user: User;
  isFriend: boolean;
  hasRequest: boolean;
  onAdd: () => void;
  onAccept: () => void;
}) {
  return (
    <View style={styles.peopleRow}>
      <Avatar user={user} size={44} />
      <View style={styles.peopleText}>
        <Text variant="headline" numberOfLines={1}>
          {user.name}
        </Text>
        <Text variant="caption" color={colors.textMuted} numberOfLines={1}>
          {user.major} · {user.school}
        </Text>
      </View>
      {isFriend ? (
        <Text variant="caption" color={colors.primary} style={styles.statusText}>
          Friends
        </Text>
      ) : hasRequest ? (
        <Button label="Accept" size="sm" onPress={onAccept} />
      ) : (
        <Button label="Add" icon="personAdd" size="sm" variant="secondary" onPress={onAdd} />
      )}
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

function SearchInput({ icon, value, onChange, placeholder, suggestions, autoFocus }: SearchInputProps) {
  const [focused, setFocused] = useState(false);
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const query = value.trim().toLowerCase();
  const matches = query
    ? suggestions
        .filter((suggestion) => suggestion.toLowerCase().includes(query))
        .sort((a, b) => Number(b.toLowerCase().startsWith(query)) - Number(a.toLowerCase().startsWith(query)))
    .slice(0, 5)
    : [];

  const clearBlurTimeout = () => {
    if (blurTimeout.current) clearTimeout(blurTimeout.current);
    blurTimeout.current = null;
  };

  const selectSuggestion = (suggestion: string) => {
    clearBlurTimeout();
    onChange(suggestion);
    setFocused(false);
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
            blurTimeout.current = setTimeout(() => {
              setFocused(false);
              blurTimeout.current = null;
            }, 150);
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
              onPress={() => selectSuggestion(suggestion)}
              style={({ pressed }) => [styles.suggestion, pressed && styles.pressed]}>
              <Text variant="callout">{suggestion}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

// Bolds the part of `text` that matches the query, Uber-style.
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

type ResultRowProps = { icon: IconName; title: ReactNode; subtitle?: string; circle?: boolean; onPress?: () => void };

function ResultRow({ icon, title, subtitle, circle, onPress }: ResultRowProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={[styles.rowIcon, circle && styles.rowIconCircle]}>
        <Icon name={icon} size={22} />
      </View>
      <View style={styles.rowText}>
        {title}
        {subtitle ? (
          <Text variant="callout" color={colors.textMuted} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  modeToggle: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.xs,
    marginBottom: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
  },
  idleLayout: { flex: 1, minHeight: 0 },
  idleList: { paddingBottom: spacing.md },
  idleSearch: { paddingTop: spacing.md, paddingBottom: spacing.md, backgroundColor: colors.background },
  feedContainer: {
    borderRadius: 0,
    borderWidth: 0,
    boxShadow: 'none',
    elevation: 0,
    shadowOpacity: 0,
  },
  fields: {
    width: '100%',
    borderRadius: 0,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    zIndex: 2,
  },
  inputs: { width: '100%' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, height: spacing.xxxl + spacing.xl },
  peopleInputRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, height: spacing.xxxl + spacing.xl },
  input: { ...typography.headline, fontWeight: '400', flex: 1, height: '100%', color: colors.text, outlineColor: 'transparent' },
  peopleInput: { ...typography.body, flex: 1, height: '100%', color: colors.text, outlineColor: 'transparent' },
  inputGroup: { position: 'relative' },
  focusedInputGroup: { zIndex: 10 },
  results: { marginTop: spacing.lg, zIndex: 1 },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, height: spacing.xxxl + spacing.xl },
  friendRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  friendText: { flex: 1, gap: spacing.xxs },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  rowIcon: { width: spacing.xxxl + spacing.md, height: spacing.xxxl + spacing.md, alignItems: 'center', justifyContent: 'center' },
  rowIconCircle: { borderRadius: radius.pill, backgroundColor: colors.background },
  rowText: {
    flex: 1,
    gap: 2,
    minHeight: 72,
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  regular: { fontWeight: '400' },
  suggestions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: spacing.lg,
    zIndex: 20,
    elevation: 4,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: spacing.xs,
  },
  suggestion: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  peopleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  peopleText: { flex: 1, gap: spacing.xxs },
  statusText: { fontWeight: '700' },
  expanded: {
    marginVertical: spacing.sm,
    borderRadius: 0,
    overflow: 'hidden',
    borderWidth: 0,
  },
  empty: { marginTop: spacing.xxl },
  pressed: { opacity: 0.6 },
});
