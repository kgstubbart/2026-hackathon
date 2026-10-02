@../AGENTS.md

## Product

- **StrJava** — "Strava for internships." Students share internship progress with friends (applied, interviewing, offer, accepted, milestones) and friends cheer them on with congrats.
- Wordmark: "StrJava" with only "Str" struck through by a single horizontal line (`src/components/wordmark.tsx`). Always render the name through this component in UI.
- Pages are listed once in `src/constants/pages.ts`; the tab bar and the feed menu both read from it. Tabs: Feed (`/`), Search (`/search`), Share (`/share`, center + button), Chats (`/messages`), Profile (`/profile`).
- Friends (`/friends`) is a route but not a tab: it has a hidden `TabTrigger` and is reached from the feed header's friends button and Search's "Find people to follow" row.
- Search is modeled on Uber's "Where to?" search: a bordered box of stacked fields (Company, optional Role via the + button, "Where to?" location) joined by a dot–line–square rail, and a flat list of results (icon, matched text in bold, subtitle, hairline dividers). It only searches friends' posts; tapping a result expands it into the full post.
- Feed: StrJava header bar (menu button on the left that lists every page from `src/constants/pages.ts`, centered wordmark, a friends button on the right that opens `/friends`), a Strava-style weekly streak card on top, then a plain chronological feed. No filters, summary boxes, or "recent wins" strips.
- The feed only shows interviews, assessments, offers and accepted offers (`feedKinds`). Applications and milestones never appear in the feed. Interview and assessment posts list their round, type or format and questions under the sentence.
- Feed posts are full-width white sections separated by thin gaps, LinkedIn/Threads style: author header (avatar, name, major · school, time · audience), one sentence with the kind in bold, e.g. "Got an **Interview** at {company} for the {role} position!" (`postSentence`), an optional comment from the poster, and an icon action row (congrats, comment, send). No colored attachment box. Not floating rounded cards.
- Streak: flame with consecutive-week count (Strava orange `colors.streak`) and Mon–Sun circles; a day is filled when the user logged an update that day.
- Share lets the user log four things: application (company, position), interview (company, position, round, type: behavioral / technical / mixed, questions each with an optional difficulty; a question may be difficulty-only; difficulty only appears for technical or mixed interviews, never behavioral), assessment (company, position, timed or take-home, questions or task) and offer (company, position). Applications are never posted to the feed; they are private tracking that counts toward the streak. The other three always post to the feed. Company, position and round are `ComboField`s (suggestions appear only while typing, no dropdown arrow, any typed answer is accepted); the round count is open-ended (type any number) with a Final option. Type, format and difficulty are chip options; questions are plain text. Round is a narrow field and the type chips fill the rest of the same row. The page is laid out like the feed: a `TopBar`, then full-width white `Section`s with thin gaps, no rounded cards or bordered tiles; the kind picker is a flat tab-like row (icon over label, selected underlined in its tone). No audience picker and no preview on this page.
- Data is mock and in-memory (`src/data/mock-data.ts`, `src/data/store.tsx`); there is no backend yet.

## Design system

Full rules live in `docs/style-guide.md`. Follow it for any UI work and update it when you add tokens, components or patterns.

- All colors, type, spacing, radii and shadows come from `src/constants/theme.ts`. Never hardcode hex values, font sizes or spacing in screens; add a token instead.
- Build screens from the kit in `src/components/ui/` (`Text`, `Button`, `IconButton`, `Chip`, `Card`, `Avatar`, `CompanyMark`, `TextField`, `ComboField`, `SearchField`, `Screen`, `ScreenHeader`, `SectionHeader`, `TopBar`, `Section`).
- Icons only via `<Icon name=… />` (`src/components/ui/icon.tsx`), which maps a name to SF Symbols (iOS) and Material Symbols (Android/web). Add new icons to that map; never use unicode glyphs or emoji as icons.
- Update kinds (label, icon, tone color) are defined once in `src/data/update-kinds.ts`; reuse `KindBadge` for kind labels.
- Primary color is indigo; each update kind has its own tone (sky, amber, teal, mint, primary, rose). Light mode only for now.

## Commits

- Commit after each completed unit of work; keep commits small and focused.
- Name every commit in the format `<type>: <description>`, e.g. `fix: tab bar overlap`, `feat: login screen`, `chore: expo scaffold`.
- The description is a minimal, incomplete phrase: lowercase, no trailing period, no full sentences.
- Subject line only; no commit body.
- Never include an AI co-author or any AI attribution (no `Co-Authored-By` trailer, no "Generated with" line).
