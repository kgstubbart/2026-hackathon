# StrJava style guide

How StrJava looks, and how to build UI that matches it. If you're adding or changing anything visual, read this first.

**The short version**

1. Every color, font size, spacing value, radius and shadow comes from [`src/constants/theme.ts`](../src/constants/theme.ts). No raw hex codes or magic numbers in screens.
2. Build screens out of the kit in [`src/components/ui/`](../src/components/ui/). Use `<Text>` from the kit, never React Native's `Text`.
3. Icons only through `<Icon name="…" />`. No emoji or unicode glyphs as icons.
4. If the kit doesn't have what you need, add a token or component to the kit. Don't style it one-off in a screen.

---

## 1. Brand

- **Name:** StrJava ("Strava for internships"). Students share internship progress with friends, and friends cheer them on.
- **Wordmark:** "StrJava" with only **Str** crossed out by a single horizontal line. Always render it with `<Wordmark />` from [`src/components/wordmark.tsx`](../src/components/wordmark.tsx); never type the name out in a heavy font yourself.
- **Voice:** warm, short and peer-to-peer. Write like a friend texting, not a recruiter. Use sentence case everywhere ("Share with friends", not "Share With Friends"). Avoid exclamation-mark spam and corporate words ("leverage", "opportunity pipeline").

## 2. Color

Import colors with `import { colors, tones } from '@/constants/theme'`. Use the **semantic** names below. The raw palette names (`colors.indigo`, `colors.paper`, …) exist, but reach for them only when no semantic name fits.

### Neutrals

| Token | Hex | Use for |
| --- | --- | --- |
| `colors.background` | `#F6F5F1` | Screen background (warm paper). Also the fill inside quiet containers on white, such as muted icon buttons and the Search icon circle. |
| `colors.surface` | `#FFFFFF` | Cards, posts, inputs, top and bottom bars |
| `colors.surfaceMuted` | `#EEECE6` | Disabled or "missed" states (for example a missed streak day) |
| `colors.border` | `#E6E3DC` | Every hairline border and divider |
| `colors.text` | `#15141A` | Primary text and icons. Also the selected-chip fill and the bold outlines in Search. |
| `colors.textMuted` | `#5D5B66` | Secondary text: subtitles, meta, notes |
| `colors.textFaint` | `#9C9AA5` | Tertiary text: placeholders, timestamps, field labels, inactive tab icons |

### Brand

| Token | Hex | Use for |
| --- | --- | --- |
| `colors.primary` | `#4F46E5` | Primary buttons, active tab, links, the "congratulated" state, unread badges |
| `colors.primarySoft` | `#ECEBFE` | Secondary button background, selected option background |
| `colors.primaryDeep` | `#2E2A8F` | Rare. Large brand surfaces only. |
| `colors.onPrimary` | `#FFFFFF` | Text and icons placed on `primary`, on a tone's `fg`, or on avatars |

### Update-kind tones

Each kind of update has one tone. A tone is a pair: `fg` for icons and text, `bg` for the soft fill behind them. Always use the pair together.

| Kind | Tone | `fg` | `bg` | Icon |
| --- | --- | --- | --- | --- |
| Application | `sky` | `#2563EB` | `#E5EDFF` | `send` |
| Interview | `amber` | `#B45309` | `#FDF0D5` | `calendar` |
| Assessment | `teal` | `#0E7490` | `#DDF3F7` | `code` |
| Offer | `mint` | `#0F8A5F` | `#DCF4E8` | `trophy` |
| Accepted | `primary` | `#4F46E5` | `#ECEBFE` | `briefcase` |
| Milestone | `rose` | `#D6336C` | `#FDE4EE` | `star` |

The mapping lives in [`src/data/update-kinds.ts`](../src/data/update-kinds.ts). **Never re-map a kind to a color in a screen**; read it from `updateKinds[kind]`:

```tsx
const meta = updateKinds[update.kind];
const tone = tones[meta.tone];
<Icon name={meta.icon} color={tone.fg} />
```

Tones are reserved for update kinds (plus their reuse in `CompanyMark` and profile stats). Don't use mint for a generic "success" toast or rose for errors.

### Streak

| Token | Hex | Use for |
| --- | --- | --- |
| `colors.streak` | `#FC5200` | Streak flame and "Weeks" label only |
| `colors.streakSoft` | `#FF8A4C` | Inner flame highlight |

Orange means *streak*. Don't use it anywhere else.

### Rules

- Text on white is `text`, `textMuted` or `textFaint`. Don't invent grays.
- To tint the background on a highlighted state, use a tone's `bg`, never the `fg` at low opacity.
- Light mode only for now (`userInterfaceStyle: "light"` in `app.json`). Because everything goes through tokens, dark mode later only requires changing `theme.ts`.

## 3. Typography

Always use `<Text variant="…">` from `@/components/ui`. It sets the size, line height, weight and letter spacing together, and defaults to `colors.text`.

| Variant | Size / line | Weight | Use for |
| --- | --- | --- | --- |
| `display` | 32 / 38 | 800 | Screen titles (via `ScreenHeader`) and big stat numbers. One per screen. |
| `title` | 22 / 28 | 700 | Profile name, large card titles |
| `headline` | 17 / 23 | 600 | Names, post headlines, section headers, list-row titles, button labels |
| `body` | 15 / 21 | 400 | Notes, messages, paragraphs. This is the default. |
| `callout` | 14 / 19 | 500 | Secondary row text, chips, small button labels, counts |
| `caption` | 12 / 16 | 500 | Meta info (school, time, term), badges |
| `label` | 11 / 14 | 700, UPPERCASE, +0.8 tracking | Eyebrows above titles and form field labels |

```tsx
<Text variant="headline">{author.name}</Text>
<Text variant="caption" color={colors.textMuted}>{author.school}</Text>
```

- Change color with the `color` prop and alignment with `align`. Use `style` only for layout (margins, flex) or a one-off weight change (`fontWeight: '700'`).
- Don't set `fontSize` in screens. If you truly need a new size, add a variant.
- Uppercase is only for the `label` variant.
- Exceptions: avatar and company-mark initials scale with the component's `size`, and the number inside the streak flame is sized to fit the drawn flame. Keep exceptions like these inside the component.

## 4. Spacing and layout

`spacing`: `xxs 2 · xs 4 · sm 8 · md 12 · lg 16 · xl 20 · xxl 24 · xxxl 32`

| Situation | Value |
| --- | --- |
| Screen side gutter | `layout.gutter` (20) |
| Max content width (tablet and web) | `layout.maxContentWidth` (640), centered |
| Padding inside a card or post | `lg` (16) horizontal (posts use the gutter) |
| Gap between related items (icon and label, avatar and name) | `xs` to `md` |
| Gap between fields in a form | `lg` |
| Space above a section header | `xxl` (via `SectionHeader`) |
| Gap between feed posts | `sm` (8), the gray background shows through |

- Use `gap` on flex containers instead of adding margins to children.
- Combining tokens is fine (`spacing.md + 2`); raw numbers like `13` are not.
- Rows people can tap need a touch target of at least 44pt. Add `hitSlop` on small icons.
- Horizontal scrolling rows (chips) should run edge to edge: `<ChipGroup bleed />`.

## 5. Shape and elevation

`radius`: `sm 10 · md 14 · lg 20 · xl 28 · pill 999`

| Element | Radius |
| --- | --- |
| Buttons, chips, search pill, badges | `pill` |
| Inputs, option tiles, small icon tiles, menu items | `md` |
| Cards, the Search field box, stat tiles, the feed menu | `lg` |

- Borders are `StyleSheet.hairlineWidth` in `colors.border`. Use `1.5` only for selected or outlined states.
- Shadows: `shadow.card` for floating cards and the feed menu, and `shadow.raised` for the main call to action (the large primary button and the center Share tab). Nothing else gets a shadow; feed posts and list rows are flat.

## 6. Icons

```tsx
<Icon name="briefcase" size={16} color={tone.fg} />
```

- Every icon is listed in [`src/components/ui/icon.tsx`](../src/components/ui/icon.tsx), which maps one name to an SF Symbol (iOS) and a Material Symbol (Android and web). TypeScript checks both names.
- **Adding an icon:** add `name: ['sf.symbol.name', 'material_name']` to the map. Look names up in Apple's SF Symbols app and at fonts.google.com/icons.
- Sizes: 22 for tab bar and row icons, 18 to 20 for buttons, 12 to 16 inline with text.
- Material Symbols render as outlines, so don't rely on a "filled" look for meaning. When you need a solid shape (like the streak flame), draw it with Views.
- Never use emoji or characters like ♨ ◎ ⌕ as icons.

## 7. Components

Import from `@/components/ui`.

| Component | Use it for | Notes |
| --- | --- | --- |
| `Screen` | Every standard screen | Handles the safe area, scrolling, gutter and max width. `scroll={false}` for chat-like layouts. |
| `ScreenHeader` | Screen title | Optional `eyebrow` (label above the title) and a `right` slot for `IconButton`s |
| `SectionHeader` | Titles inside a screen | Optional `action` (usually a small `Button`) |
| `Text` | All text | See Typography |
| `Button` | Actions | `variant`: `primary` (one main action per screen), `secondary`, `outline`, `ghost`. `size`: `sm`, `md`, `lg`. Optional `icon`. |
| `IconButton` | Icon-only actions | Always pass `label` for accessibility. `tone`: `surface` (bordered white), `muted` (gray fill, used for the feed header's friends button), `plain`. |
| `Chip` / `ChipGroup` | Single-choice pickers (term, stage) | Selected chip = dark fill. Not for filtering the feed; the feed has no filters. |
| `Card` / `Divider` | Grouped content | `flush` for lists of rows separated by `Divider` |
| `Avatar` | People | Initials on the user's color. Optional `ring` color. |
| `CompanyMark` | Companies | First letter on white, colored from the tones |
| `TextField` / `FieldLabel` | Forms | `label` renders in the `label` variant above the input |
| `ComboField` | Share form fields | A dropdown you can type into: suggestions filter as you type and open inline under the field; a typed answer that matches nothing is kept as is. |
| `SearchField` | Simple pill search | The Search tab uses its own Uber-style field box instead |

App-level components:

| Component | Where |
| --- | --- |
| `UpdateCard`, `KindBadge` | [`src/components/update-card.tsx`](../src/components/update-card.tsx): the feed post and the kind pill. Reuse `KindBadge` anywhere you label an update kind. |
| `StreakCard` | [`src/components/streak-card.tsx`](../src/components/streak-card.tsx) |
| `Wordmark` | [`src/components/wordmark.tsx`](../src/components/wordmark.tsx) |

## 8. Screen patterns

These are deliberate. Keep new work consistent with them.

- **Feed:** a fixed white header bar with exactly three things: the menu (`NavMenu`) on the left, the centered `Wordmark`, and one friends `IconButton` on the right that opens `/friends`. Don't add more header buttons. Below it, the `StreakCard`, then posts in chronological order. **No filters, summary banners or highlight carousels.**
- **Feed content:** only interviews, offers and accepted offers (`feedKinds` in `update-kinds.ts`). Applications and milestones never appear in the feed.
- **Menu** (`src/components/nav-menu.tsx`): a dropdown below the header listing every page in `src/constants/pages.ts`, with the current page highlighted in `primarySoft`. When you add a page, add it to `pages.ts`; set `tab: true` only if it belongs in the tab bar.
- **Feed posts** (LinkedIn and Threads style): full-width white sections, not floating rounded cards. From top to bottom:
  1. Author header: avatar, name, "major · school", "time · audience icon", and a `more` icon on the right.
  2. One sentence from `postSentence()`, in the `headline` variant at regular weight with only the kind in bold: "Got an **Interview** at {company} for the {role} position!", "Got an **Offer** from …", "**Accepted** an offer at …".
  3. The poster's optional comment (`body`, `textMuted`).
  4. Action row: icons with counts (congrats, comment, send), with no text labels.

  No colored box, company mark or kind badge inside posts; the bold keyword carries the kind.
- **Streak** (Strava style): "Your streak" plus an outline Share button. On the left, the flame with the week count and "Weeks" underneath. On the right, Mon–Sun circles: done = dark fill with an icon, today = bold outline, missed = `surfaceMuted` fill, upcoming = hairline outline.
- **Search** (Uber "Where to?" style): a bordered `lg` box of stacked fields linked by a dot, line and square rail. A round "+" beside the box adds a field. Results are flat rows: an icon on the left, the title with the **matched text in bold**, a muted subtitle, and hairline dividers that start at the text column.
- **Forms** (Share): question → option tiles → `Card` of `ComboField`s (and a second `Card` for a repeatable list, like interview questions) → one large primary button with a one-line caption underneath. Disable the button until required fields are filled, and say why in the caption. No audience picker and no preview: applications are always private, everything else always posts to the feed.
- **Lists** (Friends, Chats): rows inside a `flush` `Card`, separated by `Divider`s, with the avatar on the left and a single action or meta element on the right.

## 9. Interaction and accessibility

- Every `Pressable` gives pressed feedback: `opacity: 0.6`–`0.75` (buttons also scale to `0.98`).
- Icon-only controls need an `accessibilityLabel`. Toggles need `accessibilityState={{ selected }}`.
- Empty states are one muted, centered `body` line that says what to do next ("Nothing here yet. Check back soon.").
- Timestamps use `timeAgo()` (`18m`, `2h`, `3d`), and headlines use `headlineFor()`. Both are in `update-kinds.ts`. Don't hand-format these.
- Join meta fields with ` · ` (a middle dot with spaces).

## 10. Checklist before you open a PR

- [ ] No hex codes, `rgba()` or raw `fontSize` values outside `theme.ts` (the `grep` below is clean)
- [ ] Text uses `<Text variant>` from the kit, and icons use `<Icon>`
- [ ] New colors, sizes and icons were added as tokens or icon-map entries, not inline
- [ ] Update kinds use `updateKinds` and `tones`, not new color choices
- [ ] Icon-only buttons have labels, and touch targets are at least 44pt
- [ ] Looks right on iOS, Android and web (Material icons are outlines)
- [ ] `npx tsc --noEmit` and `npx expo lint` pass

```bash
# should only print theme.ts and mock user avatar colors
grep -rn "'#[0-9A-Fa-f]\{3,8\}'\|rgba(" src
```
