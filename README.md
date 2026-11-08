# dsh-question

Ask-and-wait question cards for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (DSH).

`dsh-question` renders a question from the model as a card you answer in place: pick an option, hover
for the full explanation, or type your own answer. The card holds the turn until you submit, then the
answer goes back to the model and work continues.

[English](README.md) | [中文](README.zh.md)

![Question card](docs/card.png)

![Hover tooltip](docs/hover.png)

| Single-select radio (8×) | Multi-select |
| --- | --- |
| ![radio](docs/radio-zoom.png) | ![multi](docs/multi.png) |

## Features

- **Key-point options** — each option row shows only the short label, clamped to two lines;
- **Hover details** — hovering or focusing an option opens a floating tooltip with the full
  explanation; a truncated label gets its complete text on the tooltip's first line;
- **Free-form answers** — the custom row reads “其他：” or “Other: ” and takes typed input directly,
  no pencil icon needed;
- **Single & multi select** — 26px circular radios for single-select, native checkboxes for multi-select;
- **Keyboard shortcuts** — `1`–`9` select/toggle, `Enter` runs the primary action (submit / next),
  `←`/`→` switch between questions of a multi-question batch, `Esc` collapses the card without
  cancelling the batch;
- **Multiple questions, switchable** — a batch shows one question at a time; use the visible pager
  buttons or `←`/`→` to move back and forth, and every answer draft is kept;
- **Waits for you** — the turn stays paused until you submit; countdown, skip and paging keep working;
- **Automatic Chinese / English** — the UI string follows the DSH interface language, switching live;
  no manual edit or config.

The plugin only renders the question card and its interactions; the model-facing tool contract is
unchanged.

## Installation

### From npm

```powershell
dsh plugin --profile <profile> add dsh-question
```

### From GitHub

```powershell
dsh plugin --profile <profile> add github:1234ab484/dsh-question
```

### From a local checkout

```powershell
git clone https://github.com/1234ab484/dsh-question
dsh plugin --profile <profile> add "link:<path-to-this-repo>"
```

### Manual

1. Add `"dsh-question": "<npm version | github spec | link:<path>>"` to the profile's `package.json`
   dependencies;
2. Append `dsh-question` to `dsh.profile.bundles`;
3. Run `pnpm install` in the profile directory.

Uninstall: `dsh plugin --profile <profile> remove dsh-question`.

The package carries `dsh.bundle.patch` (`cordis.patch.yml`, which inserts the `question-card` loader
entry) and `dsh.client` (`platform: "web"`, serving `./client` → `lib/client.js`). Profiles with client
HMR apply it live.

## Language

The plugin follows the DSH interface language automatically:

| DSH language | Custom row prefix |
| --- | --- |
| 中文 | 其他： |
| English | Other: |

All other text on the card (question, options, descriptions) comes from the model and is shown as-is.

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| `1`–`9` | Select the Nth option (single-select) / toggle it (multi-select) |
| `Enter` | Run the primary footer action: submit on the last question, next otherwise |
| `←` / `→` (or `PageUp` / `PageDown`) | Switch to the previous / next question in the same batch |
| `Esc` | Collapse the card (same as the header collapse button; never cancels the batch) |

Shortcuts only act while a question card is visible, never while focus is inside `input`,
`textarea`, or a content-editable area, and never with `Ctrl`/`Alt`/`Cmd` held.

## How it works

1. **Stylesheet** (`lib/dsh-question.css`, injected as `<style data-plugin="dsh-question">`) — scoped to
   `[data-question-key]`; hides the inline `*_description`, clamps labels, draws the circular radios,
   the `其他/Other` prefix and the tooltip.
2. **Interaction** (`lib/client.js`) — delegated `mouseover`/`focusin` listeners plus a `position: fixed`
   tooltip reading the description text still present in the DOM; keyboard handling; the prefix follows
   `<html lang>` through a `MutationObserver`.
3. **HMR-safe** — `apply()` disposes the previous generation (`window.__DSH_QUESTION_CARD__`), so a
   reloaded bundle never stacks listeners.

## Requirements

- DSH **0.2.1-rc.x** Web / Desktop client;
- Node.js ≥ 20 only when building the bundle yourself (the published bundle is plain JavaScript).

Selectors match DSH's CSS-module class **suffixes** (`_optionLabel`, `_description`, `_customRow`, …)
and the `data-question-key` attribute, so a DSH CSS hash change is harmless — a structural UI refactor
is not.

## Development

```bash
npm run build   # src/*.js + lib/dsh-question.css -> lib/client.js
npm run check   # node --check
npm test        # node:test static contract tests
```

Open `dev/preview.html` in a browser for a standalone replica of the card DOM (no DSH required); hover
an option to see the tooltip.

```
src/10-helpers.js   DOM helpers and language detection
src/20-tooltip.js   tooltip element, stylesheet injection
src/30-mount.js     apply(): listeners, language sync, idempotent teardown
src/40-keys.js      keyboard shortcuts
```

## Known limitations

- The custom-row prefix is Chinese or English only; other locales fall back to English.
- Tooltip content comes from the asker's `description`; without one, only a truncated label falls back
  to the tooltip.
- Plan-review (`exit_plan_mode`) cards are intentionally untouched.
- Depends on DSH's internal class suffixes and `data-question-key`; a structural refactor of the question
  card needs selector updates.

## License

[MIT](LICENSE)