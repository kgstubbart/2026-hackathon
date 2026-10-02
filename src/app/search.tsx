import { router } from 'expo-router';
import { Fragment, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { UpdateCard } from '@/components/update-card';
import { Divider, Icon, Text, type IconName } from '@/components/ui';
import { colors, layout, radius, spacing, typography } from '@/constants/theme';
import { useStore } from '@/data/store';
import { updateKinds } from '@/data/update-kinds';

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

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const { updates, friendIds, getUser, toggleCongrats } = useStore();
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  const friendPosts = updates.filter((update) => friendIds.includes(update.userId) && update.visibility === 'friends');
  const terms = { company: company.trim().toLowerCase(), jobTitle: jobTitle.trim().toLowerCase() };
  const searching = Boolean(terms.company || terms.jobTitle);
  const results = friendPosts.filter((update) => {
    return (
      update.company.toLowerCase().includes(terms.company) &&
      update.role.toLowerCase().includes(terms.jobTitle)
    );
  });

  return (
    <View style={[styles.screen, { paddingTop: insets.top + spacing.md }]}>
      <View style={[styles.column, styles.top]}>
        <View style={styles.fields}>
          <View style={styles.rail}>
            <View style={styles.dot}>
              <View style={styles.dotInner} />
            </View>
            <View style={styles.railLine} />
            <View style={styles.square}>
              <View style={styles.squareInner} />
            </View>
          </View>
          <View style={styles.inputs}>
            <SearchInput value={company} onChange={setCompany} placeholder="Company" suggestions={companySuggestions} autoFocus />
            <Divider />
            <SearchInput value={jobTitle} onChange={setJobTitle} placeholder="Job title" suggestions={jobTitleSuggestions} />
          </View>
        </View>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false}>
        <View style={styles.column}>
          {searching ? (
            <>
              {results.map((update, index) => {
                const author = getUser(update.userId);
                return (
                  <Fragment key={update.id}>
                    {index === 2 ? <FindPeopleRow /> : null}
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
              {results.length < 3 ? <FindPeopleRow /> : null}
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
              <FindPeopleRow />
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  suggestions: string[];
  autoFocus?: boolean;
};

function SearchInput({ value, onChange, placeholder, suggestions, autoFocus }: SearchInputProps) {
  const [focused, setFocused] = useState(false);
  const query = value.trim().toLowerCase();
  const matches = query
    ? suggestions
        .filter((suggestion) => suggestion.toLowerCase().includes(query))
        .sort((a, b) => Number(b.toLowerCase().startsWith(query)) - Number(a.toLowerCase().startsWith(query)))
        .slice(0, 5)
    : [];

  return (
    <View style={styles.inputGroup}>
      <View style={styles.inputRow}>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.textFaint}
          autoFocus={autoFocus}
          autoCorrect={false}
          returnKeyType="search"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
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
              onPressIn={() => {
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

function FindPeopleRow() {
  return (
    <ResultRow
      icon="globe"
      circle
      title={<Text variant="headline">Find people to follow</Text>}
      onPress={() => router.navigate('/friends')}
    />
  );
}

const MARKER = 18;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  column: { width: '100%', maxWidth: layout.maxContentWidth, alignSelf: 'center', paddingHorizontal: layout.gutter },
  top: { paddingBottom: spacing.md },
  fields: {
    flex: 1,
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: colors.text,
    borderRadius: radius.lg,
    paddingLeft: spacing.lg,
  },
  rail: { alignItems: 'center', paddingVertical: 18, width: MARKER },
  dot: { width: MARKER, height: MARKER, borderRadius: MARKER / 2, backgroundColor: colors.text, alignItems: 'center', justifyContent: 'center' },
  dotInner: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.surface },
  railLine: { flex: 1, width: 2, minHeight: 12, backgroundColor: colors.text },
  square: { width: MARKER, height: MARKER, borderRadius: 4, backgroundColor: colors.text, alignItems: 'center', justifyContent: 'center' },
  squareInner: { width: 6, height: 6, backgroundColor: colors.surface },
  inputs: { flex: 1, marginLeft: spacing.lg },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, height: 54, paddingRight: spacing.lg },
  input: { ...typography.headline, fontWeight: '400', flex: 1, height: '100%', color: colors.text, outlineColor: 'transparent' },
  inputGroup: { position: 'relative' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  rowIcon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  rowIconCircle: { borderRadius: 22, backgroundColor: colors.background },
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
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingVertical: spacing.xs,
  },
  suggestion: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  expanded: {
    marginVertical: spacing.sm,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  empty: { marginTop: spacing.xxl },
  pressed: { opacity: 0.6 },
});
