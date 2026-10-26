# Thunder Linter (fork of obsidian-linter)

This is Thunder's own version of Obsidian Linter. Upstream is
platers/obsidian-linter. This fork keeps upstream's code and adds only
Thunder's custom rules and settings, so a monthly sync can pull upstream
updates and reapply the custom work on top.

Branch layout:

- `master`: tracks upstream, no Thunder edits. Never commit custom work here.
- `thunder`: Thunder's branch. All custom files live here. BRAT installs
  from releases built from this branch.

Custom files, and only these files, are Thunder's. Everything else in a
monthly sync should come from upstream:

- `src/rules/thunder-heading-table-spacing.ts`
- `__tests__/thunder-heading-table-spacing.test.ts`
- `src/lang/locale/en.ts` (only the `thunder-*` entries)
- `thunder-preset.json`
- `THUNDER.md` (this file)
- `.github/workflows/thunder-release.yml`
- `scripts/thunder-monthly-sync.sh`
- `thunder-sync-state.json`

## Install with BRAT

BRAT (Beta Reviewers Auto-update Tool) installs from GitHub releases, not
from a branch. That is why this fork has a release workflow. Do not
install by copying source files into the vault.

1. Install BRAT from Obsidian Community Plugins.
2. In BRAT settings, Add Beta Plugin, and enter the fork repository URL
   (your GitHub fork of obsidian-linter).
3. BRAT installs the latest release from the fork. Enable Linter in
   Community Plugins.
4. The plugin id stays `obsidian-linter`, so your existing
   `.obsidian/plugins/obsidian-linter/data.json` is preserved. BRAT does
   not overwrite settings.
5. One time only: quit Obsidian completely, back up
   `.obsidian/plugins/obsidian-linter/data.json`, copy
   `thunder-preset.json` from this repo over it keeping the name
   `data.json`, then reopen Obsidian. This is needed because Linter
   loads saved settings as a whole; changing code defaults would not
   change settings you already have, and it would break upstream tests
   if it were done in code. After this one copy, later BRAT updates from
   the fork keep your settings, because updates replace code files only.

To make a new BRAT release from this branch, push to `thunder` or run
the Thunder Release workflow by hand. It builds, runs the Thunder tests,
sets the release manifest version to the thunder tag, and creates a
non-draft release with `main.js`, `manifest.json`, and `styles.css`.
BRAT picks up the latest release from the fork.

## Thunder preset: what is on, and what the skill maps to

`thunder-preset.json` starts from Thunder's vault settings (Linter
1.31.2, untouched in his vault at fork time) and changes only what the
obsidian-markdown skill and the Thunder heading/table work require.

Kept on from his vault, unchanged: capitalize-headings (Title Case,
his ignore list), compact-yaml, empty-line-around-horizontal-rules,
footnote-after-punctuation, headings-start-line,
move-footnotes-to-the-bottom, proper-ellipsis, re-index-footnotes,
remove-trailing-punctuation-in-heading, and
space-between-Chinese-Japanese-or-Korean-and-English-or-numbers.
Lint on save and lint on file change stay on, as in his vault.

Skill rule, and how it is enforced here:

- Headings: one blank before, none after. Thunder heading/table rule.
  Upstream heading-blank-lines is off in the preset, because the Thunder
  rule replaces it.
- Tables: one blank before, nothing forced after. Thunder heading/table
  rule, plus align-table-columns on for column alignment and trimmed
  cell content. Upstream empty-line-around-tables is off in the preset,
  because the Thunder rule replaces it for top-level tables.
- Table directly under a heading: the one blank line is kept, because
  that blank is the table's blank, not the heading's. A linter cannot
  invent the short prose line the skill tells a human to write, so this
  is the only lossless machine choice. If you write the prose line,
  both rules hold literally and the exception never fires.
- No em dashes anywhere: not automated, and deliberately not in this
  fork. The obsidian-markdown skill says no em dashes in new writing,
  but a rule that strips them on Lint Whole Vault would rewrite your
  whole vault at once, including notes where you meant them. That is a
  human rule for new notes, not a vault-wide rewrite.
- Lists: unordered-list-style on, marker `-`; ordered-list-style on,
  ascending numbers with `.`; space-after-list-markers on. The skill
  does not name a marker, so `-` and ascending `.` are the fork's
  chosen defaults, not a skill quote.
- Code fences: language label always. Not automated, on purpose.
  Linter's default-language rule would invent a language for a fence
  that has none, which is worse than leaving it blank. Add the language
  yourself; the skill's rule stays a human rule.
- Wikilinks for internal refs: not automated. No Linter rule safely
  converts a Markdown link to a wikilink without breaking external
  links, so this stays a human rule.
- Single line break between linked ideas, double between distinct
  ideas: not automated, on purpose. Paragraph-blank-lines is off in
  the preset, because it would force a blank between every paragraph
  and destroy the single-break linked case. Only the author knows
  whether two lines are linked or distinct.
- Direct verbs, colons, minimal adverbs: style guidance, not a rule.

Known gaps in the fork preset, stated plainly:

- Blockquote and callout tables are out of scope for the Thunder
  heading/table rule. A plain empty line before a `> |` table would
  break the quote. Upstream empty-line-around-tables handles those, but
  it is off in the preset to avoid fighting the Thunder rule. If a
  callout table needs a blank, add it by hand or turn that one upstream
  rule back on and check heading-to-table cases after.
- Stacked headings stay stacked. `# Title` directly above `## Subtitle`
  gets no blank between them. The Thunder rule has a
  Blank between headings toggle, default off, if you want it the other
  way.

## Monthly heartbeat and upstream sync

The monthly heartbeat is a standing process, not just this fork. It
runs on the last Friday of the month, at the Friday 6pm tick, and its
report goes into the Friday briefing. This fork is its first process.
Leave room in the heartbeat for more processes; do not hard-code this
fork as the only monthly job.

Monthly sync for this fork, in order:

1. Check upstream platers/obsidian-linter for a newer version or new
   commits since `thunder-sync-state.json` last synced upstream
   version. If nothing changed, report that, and change nothing.
2. Merge upstream `master` into `thunder`. Conflicts in Thunder's
   custom files keep Thunder's version. Conflicts anywhere else take
   upstream's version, then the custom files are re-checked and
   reapplied if upstream touched them.
3. Run the Thunder tests and build. If either fails, stop, do not push,
   and report the failure in the Friday briefing with the failing test
   or build step named.
4. Push `thunder`, trigger the Thunder Release workflow, and verify a
   new release exists with `main.js`, `manifest.json`, and
   `styles.css`.
5. Update `thunder-sync-state.json` with the new upstream version and
   the date, and report in the Friday briefing: upstream version before
   and after, what changed in upstream that matters, whether the
   Thunder rules still pass, and the new BRAT release tag. If nothing
   changed upstream, the report is one line saying so.

The script `scripts/thunder-monthly-sync.sh` documents these steps for
a human or a monthly agent run. It does not push on its own; the
monthly agent reviews its output before pushing, because a push to a
BRAT release updates every vault that tracks the fork.

## If you update from the community plugin browser by mistake

Installing Linter from Obsidian's community browser replaces the fork
build with upstream's build, in the same `obsidian-linter` folder.
Your settings in `data.json` survive, but the Thunder rules disappear
until you reinstall from BRAT. Do not do both: track the fork in BRAT,
and do not update Linter from the community browser.
