import { router } from 'expo-router';
import { useState } from 'react';

import { Button, IconButton, Screen, Section, Text, TextField, TopBar } from '@/components/ui';
import { colors } from '@/constants/theme';
import { useStore, type ProfilePatch } from '@/data/store';

const back = () => (router.canGoBack() ? router.back() : router.navigate('/profile'));

// Edit your own profile. Laid out like the Share form: a top bar, then full-width white sections of fields.
export default function EditProfileScreen() {
  const { currentUser, updateProfile } = useStore();
  const [name, setName] = useState(currentUser.name);
  const [school, setSchool] = useState(currentUser.school);
  const [major, setMajor] = useState(currentUser.major);
  const [gradYear, setGradYear] = useState(String(currentUser.gradYear));
  const [location, setLocation] = useState(currentUser.location);

  // A year that doesn't parse leaves the saved one alone.
  const parsedYear = /^\d{4}$/.test(gradYear.trim()) ? Number(gradYear.trim()) : currentUser.gradYear;
  const patch: ProfilePatch = {
    name: name.trim(),
    school: school.trim(),
    major: major.trim(),
    gradYear: parsedYear,
    location: location.trim(),
  };
  const changed = (Object.keys(patch) as (keyof ProfilePatch)[]).some((key) => patch[key] !== currentUser[key]);
  const canSave = patch.name!.length > 0 && changed;

  const save = () => {
    if (!canSave) return;
    updateProfile(patch);
    back();
  };

  return (
    <Screen
      flush
      keyboardShouldPersistTaps="handled"
      header={<TopBar title="Edit profile" left={<IconButton icon="close" label="Close" tone="muted" onPress={back} />} />}>
      <Section title="About you">
        <TextField label="Name" value={name} onChangeText={setName} placeholder="Your name" autoCapitalize="words" />
        <TextField label="Location" value={location} onChangeText={setLocation} placeholder="e.g. Toronto, ON" autoCapitalize="words" />
      </Section>

      <Section title="School">
        <TextField label="School" value={school} onChangeText={setSchool} placeholder="e.g. University of Waterloo" autoCapitalize="words" />
        <TextField label="Major" value={major} onChangeText={setMajor} placeholder="e.g. Computer Science" autoCapitalize="words" />
        <TextField
          label="Graduation year"
          value={gradYear}
          onChangeText={setGradYear}
          placeholder="e.g. 2027"
          keyboardType="number-pad"
          maxLength={4}
        />
      </Section>

      <Section>
        <Button label="Save" size="lg" fullWidth disabled={!canSave} onPress={save} />
        <Text variant="caption" color={colors.textFaint} align="center">
          {!patch.name ? 'Add your name to continue' : changed ? 'Only your friends see your profile' : 'Nothing changed yet'}
        </Text>
      </Section>
    </Screen>
  );
}
