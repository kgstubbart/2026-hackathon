import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar, Button, ComboField, HeaderBlock, Icon, Screen, ScreenHeader, Section, Text } from '@/components/ui';
import { colors, radius, spacing, tones } from '@/constants/theme';
import { mockResume, offerHolders, reviewChances, scanSteps, type Review } from '@/data/resume-review';
import { useStore } from '@/data/store';

type Stage = 'pick' | 'scanning' | 'result';

const stepMs = 900;
const unique = (items: string[]) => [...new Set(items.filter(Boolean))];

// Resume review: pick a company and role, "upload" a resume, and get an AI-looking chance score built
// from the friends who already got offers there. The scan is a demo; see src/data/resume-review.ts.
export default function ResumeReviewScreen() {
  const params = useLocalSearchParams<{ company?: string }>();
  const { updates, currentUser, friendIds, getUser } = useStore();
  const [company, setCompany] = useState(params.company ?? '');
  const [role, setRole] = useState('');
  const [uploaded, setUploaded] = useState(false);
  const [stage, setStage] = useState<Stage>('pick');
  const [step, setStep] = useState(0);
  const [review, setReview] = useState<Review | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  // A company handed over from the company page lands in the field (adjusted during render, not in an effect).
  const [seenCompany, setSeenCompany] = useState(params.company);
  if (params.company !== seenCompany) {
    setSeenCompany(params.company);
    if (params.company) setCompany(params.company);
  }

  useEffect(() => () => clearInterval(timer.current ?? undefined), []);

  const circle = [...friendIds, currentUser.id];
  const offers = offerHolders(updates, circle);
  const companies = unique(offers.map((update) => update.company));
  const sameCompany = offers.filter((update) => update.company.trim().toLowerCase() === company.trim().toLowerCase());
  const roles = unique(sameCompany.map((update) => update.role));
  const forRole = role.trim()
    ? sameCompany.filter((update) => update.role.trim().toLowerCase() === role.trim().toLowerCase())
    : sameCompany;
  const holders = unique(forRole.map((update) => update.userId)).map(getUser);
  const canScan = company.trim().length > 0 && role.trim().length > 0 && uploaded;

  const scan = () => {
    if (!canScan) return;
    setStep(0);
    setStage('scanning');
    timer.current = setInterval(() => {
      setStep((current) => {
        if (current + 1 < scanSteps.length) return current + 1;
        clearInterval(timer.current ?? undefined);
        setReview(reviewChances(company.trim(), role.trim(), holders));
        setStage('result');
        return current;
      });
    }, stepMs);
  };

  const reset = () => {
    setStage('pick');
    setReview(null);
    setRole('');
  };

  return (
    <Screen flush keyboardShouldPersistTaps="handled">
      <HeaderBlock>
        <ScreenHeader title="Resume review" />
      </HeaderBlock>

      {stage === 'pick' ? (
        <>
          <Section title="Where are you applying?">
            <ComboField label="Company" value={company} onChangeText={setCompany} options={companies} placeholder="e.g. Stripe" />
            <ComboField label="Position" value={role} onChangeText={setRole} options={roles} placeholder="e.g. Software Engineering Intern" />
            {holders.length ? (
              <View style={styles.holders}>
                <View style={styles.avatars}>
                  {holders.slice(0, 4).map((user, index) => (
                    <View key={user.id} style={[styles.avatar, index > 0 && styles.avatarOverlap]}>
                      <Avatar user={user} size={28} ring={colors.surface} />
                    </View>
                  ))}
                </View>
                <Text variant="callout" color={colors.textMuted} style={styles.flex}>
                  {holders.length === 1 ? `${holders[0].name.split(' ')[0]} got an offer here` : `${holders.length} friends got offers here`}
                </Text>
              </View>
            ) : company.trim() ? (
              <Text variant="caption" color={colors.textFaint}>
                No friend has an offer here yet, so the score will lean on general patterns.
              </Text>
            ) : null}
          </Section>

          <Section title="Your resume">
            {uploaded ? (
              <View style={styles.file}>
                <View style={[styles.tile, { backgroundColor: tones.primary.bg }]}>
                  <Icon name="document" size={20} color={tones.primary.fg} />
                </View>
                <View style={styles.flex}>
                  <Text variant="headline" numberOfLines={1}>
                    {mockResume.fileName}
                  </Text>
                  <Text variant="caption" color={colors.textMuted}>
                    {mockResume.pages} page · {mockResume.size}
                  </Text>
                </View>
                <Button label="Replace" size="sm" variant="ghost" onPress={() => setUploaded(false)} />
              </View>
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Upload resume"
                onPress={() => setUploaded(true)}
                style={({ pressed }) => [styles.dropzone, pressed && styles.pressed]}>
                <Icon name="upload" size={26} color={colors.primary} />
                <Text variant="headline">Upload your resume</Text>
                <Text variant="caption" color={colors.textMuted}>
                  PDF or DOCX, one page is best
                </Text>
              </Pressable>
            )}
          </Section>

          <Section>
            <Button label="Scan my chances" icon="sparkles" size="lg" fullWidth disabled={!canScan} onPress={scan} />
            <Text variant="caption" color={colors.textFaint} align="center">
              {canScan
                ? `Compares your resume with ${holders.length ? `${holders.length} offer holder${holders.length === 1 ? '' : 's'}` : 'offer patterns'} at ${company.trim()}`
                : !uploaded
                  ? 'Add your resume to continue'
                  : 'Add a company and position to continue'}
            </Text>
          </Section>
        </>
      ) : null}

      {stage === 'scanning' ? (
        <Section>
          <View style={styles.scanning}>
            <View style={[styles.tile, styles.tileLarge, { backgroundColor: tones.primary.bg }]}>
              <Icon name="sparkles" size={28} color={tones.primary.fg} />
            </View>
            <Text variant="title" align="center">
              Reviewing your resume
            </Text>
            <Text variant="body" color={colors.textMuted} align="center">
              {scanSteps[step]}…
            </Text>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${((step + 1) / scanSteps.length) * 100}%` }]} />
            </View>
            <Text variant="caption" color={colors.textFaint} align="center">
              Step {step + 1} of {scanSteps.length}
            </Text>
          </View>
        </Section>
      ) : null}

      {stage === 'result' && review ? (
        <>
          <Section>
            <View style={styles.scoreRow}>
              <View style={[styles.ring, { borderColor: scoreTone(review.score).fg, backgroundColor: scoreTone(review.score).bg }]}>
                <Text variant="display" color={scoreTone(review.score).fg}>
                  {review.score}%
                </Text>
              </View>
              <View style={styles.flex}>
                <Text variant="title">{review.verdict}</Text>
                <Text variant="callout" color={colors.textMuted}>
                  Chance of an offer for {role.trim()} at {company.trim()}
                </Text>
              </View>
            </View>
            {holders.length ? (
              <View style={styles.holders}>
                <View style={styles.avatars}>
                  {holders.slice(0, 4).map((user, index) => (
                    <View key={user.id} style={[styles.avatar, index > 0 && styles.avatarOverlap]}>
                      <Avatar user={user} size={28} ring={colors.surface} />
                    </View>
                  ))}
                </View>
                <Text variant="caption" color={colors.textMuted} style={styles.flex}>
                  Based on {holders.map((user) => user.name.split(' ')[0]).join(', ')}
                  {holders.length === 1 ? "'s offer" : "'s offers"}
                </Text>
              </View>
            ) : (
              <Text variant="caption" color={colors.textMuted}>
                Based on offer patterns across StrJava
              </Text>
            )}
          </Section>

          <Section title="What you share with them">
            {review.matches.map((signal) => (
              <SignalRow key={signal.label} icon="check" tone="mint" signal={signal} />
            ))}
          </Section>

          {review.gaps.length ? (
            <Section title="What they had that you don't">
              {review.gaps.map((signal) => (
                <SignalRow key={signal.label} icon="warning" tone="amber" signal={signal} />
              ))}
            </Section>
          ) : null}

          {review.tips.length ? (
            <Section title="Quick fixes">
              {review.tips.map((tip, index) => (
                <View key={index} style={styles.tip}>
                  <Text variant="callout" color={colors.primary} style={styles.tipNumber}>
                    {index + 1}
                  </Text>
                  <Text variant="body" style={styles.flex}>
                    {tip}
                  </Text>
                </View>
              ))}
            </Section>
          ) : null}

          <Section>
            {holders[0] ? (
              <Button
                label={`Ask ${holders[0].name.split(' ')[0]} for tips`}
                icon="chat"
                size="lg"
                fullWidth
                onPress={() => router.navigate({ pathname: '/messages', params: { user: holders[0].id } })}
              />
            ) : null}
            <Button label="Scan another company" variant="outline" fullWidth onPress={reset} />
            <Text variant="caption" color={colors.textFaint} align="center">
              Scores are estimates from friends&apos; shared outcomes, not a recruiter&apos;s decision.
            </Text>
          </Section>
        </>
      ) : null}
    </Screen>
  );
}

const scoreTone = (score: number) => (score >= 75 ? tones.mint : score >= 50 ? tones.amber : tones.rose);

function SignalRow({ icon, tone, signal }: { icon: 'check' | 'warning'; tone: 'mint' | 'amber'; signal: { label: string; detail: string } }) {
  return (
    <View style={styles.signal}>
      <View style={[styles.tile, styles.tileSmall, { backgroundColor: tones[tone].bg }]}>
        <Icon name={icon} size={16} color={tones[tone].fg} />
      </View>
      <View style={styles.flex}>
        <Text variant="headline">{signal.label}</Text>
        <Text variant="caption" color={colors.textMuted}>
          {signal.detail}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pressed: { opacity: 0.6 },
  holders: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatars: { flexDirection: 'row' },
  avatar: { borderRadius: radius.pill },
  avatarOverlap: { marginLeft: -spacing.sm },
  file: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  tile: { width: 40, height: 40, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  tileSmall: { width: 32, height: 32 },
  tileLarge: { width: 56, height: 56, borderRadius: radius.md },
  dropzone: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xxl,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  scanning: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl },
  track: { alignSelf: 'stretch', height: spacing.sm, borderRadius: radius.pill, backgroundColor: colors.surfaceMuted, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.primary },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  ring: { width: 104, height: 104, borderRadius: 52, borderWidth: 4, alignItems: 'center', justifyContent: 'center' },
  signal: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  tip: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  tipNumber: { width: spacing.xl, fontWeight: '700' },
});
