---
name: Varo
description: Tu gestor de finanzas personales
colors:
  deep-graphite: "#1F2024"
  cool-ash: "#F5F5F7"
  white-surface: "#FFFFFF"
  dark-card: "#27282D"
  dark-raised: "#2E2F34"
  off-white: "#E1E1E1"
  dim-surface: "#EDEDED"
  steel-mist: "#787882"
  steel-mist-dark: "#9898A4"
  border-cool: "#D4D4D8"
  border-dark: "#36373D"
  income-green: "#10B981"
  expense-red: "#F43F5E"
  chart-indigo: "#3C4E9E"
  chart-sage: "#1F9B5C"
  chart-ember: "#BC5A25"
  chart-amber: "#C4A428"
  chart-violet: "#8F52C6"
typography:
  display:
    fontFamily: "Nunito Sans, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Nunito Sans, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "Nunito Sans, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.5
  label:
    fontFamily: "Nunito Sans, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.06em"
rounded:
  none: "0px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
components:
  button-primary:
    backgroundColor: "{colors.deep-graphite}"
    textColor: "{colors.off-white}"
    rounded: "{rounded.none}"
    padding: "6px 10px"
    height: "32px"
  button-primary-hover:
    backgroundColor: "{colors.deep-graphite}"
    textColor: "{colors.off-white}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.deep-graphite}"
    rounded: "{rounded.none}"
    padding: "6px 10px"
    height: "32px"
  button-destructive:
    backgroundColor: "transparent"
    textColor: "{colors.expense-red}"
    rounded: "{rounded.none}"
    height: "32px"
  input-default:
    backgroundColor: "transparent"
    textColor: "{colors.deep-graphite}"
    rounded: "{rounded.none}"
    padding: "4px 10px"
    height: "32px"
  fab:
    backgroundColor: "{colors.deep-graphite}"
    textColor: "{colors.off-white}"
    rounded: "{rounded.full}"
    size: "56px"
---

# Design System: Varo

## 1. Overview

**Creative North Star: "The Quiet Ledger"**

Varo holds one conviction: the numbers are the voice, and the interface whispers. Every element earns its place by making a figure clearer or an action faster. Decoration is not restrained here; it is absent.

The palette is a cool graphite study. Neutrals carry a blue undertone throughout, running from the near-black of Deep Graphite (#1F2024) to the near-white of Cool Ash (#F5F5F7). Two functional accents, Income Green and Expense Red, carry the entire emotional signal of the product. Nothing competes with them.

Typography runs through a single face, Nunito Sans, across its full weight range (300–800). The hierarchy is built through weight contrast, not size steps: a compressed scale suits a data-dense tool designed for a phone screen viewed at arm's length. Inputs and interactive surfaces are square-cornered. The grid is tight. White space is earned, not assumed.

This system explicitly rejects: the rigid corporate blue of BBVA and Santander, the chart-splash green-and-dashboard SaaS aesthetic of Mint and YNAB, and the neon-on-black energy of crypto products. If a design choice could appear in any of those three without revision, it is wrong here.

**Key Characteristics:**
- Cool graphite neutrals throughout; no warm tints anywhere in the system
- Two semantic accents only: Income Green and Expense Red; nothing decorative
- Single typeface (Nunito Sans), hierarchy through weight alone
- Square corners (0px radius) on all interactive elements except the circular FAB
- Tonal surface lift in place of decorative shadows; shadows are reserved for portals and active lifts

## 2. Colors: The Cool Graphite Study

A near-monochromatic palette that refuses warmth. Income and expense are the only saturated values on screen; everything else is a controlled neutral.

### Primary
- **Deep Graphite** (#1F2024): Primary foreground in light mode; page background in dark mode. The governing value of the system. Never approximated with a generic #000.
- **Off-White** (#E1E1E1): Foreground in dark mode; text on primary buttons. Cool, not warm. Not #FFFFFF.
- **Cool Ash** (#F5F5F7): Page background in light mode. Near-white with a barely-perceptible cool shift.
- **White Surface** (#FFFFFF): Cards and tonal surface layer in light mode.
- **Dark Card** (#27282D): Elevated surfaces in dark mode (equivalent of White Surface).
- **Dark Raised** (#2E2F34): Secondary and muted backgrounds in dark mode; the deepest tonal step.

### Neutral
- **Steel Mist** (#787882): Secondary text in light mode: labels, metadata, helper copy. Cool blue-gray.
- **Steel Mist Dark** (#9898A4): Steel Mist's dark-mode equivalent.
- **Dim Surface** (#EDEDED): Muted and secondary backgrounds in light mode.
- **Border Cool** (#D4D4D8): Dividers, input outlines, card borders in light mode.
- **Border Dark** (#36373D): Same role in dark mode.

### Semantic
- **Income Green** (#10B981): Income values, positive balances, savings totals. Used only where the meaning is explicitly positive. Never decorative.
- **Expense Red** (#F43F5E): Expense values, negative balances, destructive actions. Same constraint.

### Chart Palette
Five values used exclusively within Recharts data visualization. Never applied to UI chrome. Canonical values are OKLCH (defined in `globals.css`); hex approximations are stored in the frontmatter for tooling compatibility.
- Indigo (`oklch(0.42 0.13 264)` / #3C4E9E)
- Sage (`oklch(0.55 0.15 155)` / #1F9B5C)
- Ember (`oklch(0.55 0.19 27)` / #BC5A25)
- Amber (`oklch(0.72 0.17 54)` / #C4A428)
- Violet (`oklch(0.60 0.18 300)` / #8F52C6)

### Named Rules
**The Two-Color Rule.** Income Green and Expense Red are the only saturated colors permitted in the product UI. Their emotional signal depends entirely on their scarcity. A third accent erases the signal.

**The Cool Purity Rule.** No warm tints. No beige, no cream, no amber-shifted neutrals. If a gray looks warmer than raw steel, it is not in this system.

## 3. Typography

**Body Font:** Nunito Sans (Google Fonts), weights 300–800, latin subset
**Mono Font:** System stack via `--font-mono` (`ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace`). Defined but rarely used in UI; available as a heading variant via `--font-heading`.

**Character:** Nunito Sans is humanist and legible at small sizes. At 12px/500, body copy holds on a phone screen without strain. At 800 weight, the balance figure asserts itself without theatrics. The weight range (300 to 800) gives the system all the hierarchy it needs from a single typeface.

### Hierarchy
- **Display** (800, 2.25rem/36px, leading 1.15): The total balance figure. One instance per screen, maximum.
- **Title** (700, 0.8125rem/13px, leading 1.3): Section headings, navigation tab labels, modal titles.
- **Body** (500, 0.75rem/12px, leading 1.5): Transaction names, amounts, form labels, most running text.
- **Label** (600, 0.6875rem/11px, letter-spacing 0.06em, uppercase): Section meta-labels ("INGRESOS", "GASTOS", "AHORRO TOTAL"). Uppercase tracking is intentional and limited to this role.

### Named Rules
**The Weight-Is-Hierarchy Rule.** Size stays compressed. Weight does the work. A 13px/700 title above a 12px/500 body creates a clear level change without widening the scale. Adding font-size steps to a dense mobile tool is wasteful.

## 4. Elevation

Varo is a tonal system. Surfaces rise through background color steps, not shadow. In light mode: page (Cool Ash #F5F5F7) sits below cards (White Surface #FFFFFF). In dark mode: page (Deep Graphite #1F2024) sits below cards (Dark Card #27282D) below raised elements (Dark Raised #2E2F34). These tonal steps convey hierarchy without any box-shadow at rest.

### Shadow Vocabulary
Shadows appear only when elements float above the page:
- **Active lift** (`box-shadow: 0 2px 6px rgba(0,0,0,0.08)`, Tailwind `shadow-md`): Active NavigationTab, raised above its sibling.
- **Floating element** (`box-shadow: 0 4px 16px rgba(0,0,0,0.10)`, Tailwind `shadow-lg shadow-black/10`): Portal-rendered context menus, the pull-to-refresh indicator. Used sparingly.

### Named Rules
**The Flat-By-Default Rule.** A shadow is a claim that something floats above the page. Make that claim only for elements that genuinely do: portals, overlays, and state-lifted surfaces. Everything at rest is flat.

## 5. Components

### Buttons
**Shape:** Square (0px radius). All variants.
- **Primary:** Deep Graphite background (#1F2024), Off-White text (#E1E1E1), 6px/10px padding, 32px height. No rounding. Hover at 90% opacity.
- **Ghost:** Transparent background, foreground text. Muted background on hover. Foreground border and ring on focus.
- **Destructive:** Transparent background, Expense Red text (#F43F5E). Expense Red at 10% opacity on hover; 20% on dark.
- **Focus (all variants):** 1px border at ring color; `box-shadow: 0 0 0 1px rgba(var(--ring), 0.5)`. A quiet signal, not a colored flash.
- **Active:** `transform: translateY(1px)`. Submits the press without bouncing.

### Inputs / Fields
**Shape:** Square (0px radius). Height 32px, 12px font, transparent background.
- **Border:** 1px Border Cool (#D4D4D8) at rest.
- **Focus:** Border shifts to foreground color; 1px ring at 50% opacity.
- **Error:** Border and ring shift to Expense Red (#F43F5E).
- **Placeholder:** Steel Mist (#787882).
- **Disabled:** 50% opacity; background tints slightly to Border Cool at 50%.

### Navigation Tabs
The primary view-switching pattern. Two large cards occupying the full width beneath the header. Each shows a label, a secondary descriptor, and a category icon anchored bottom-right at reduced opacity.
- **Active:** White Surface background, Border Cool border, `shadow-md` lift. Label in Deep Graphite, descriptor in Steel Mist, icon at full opacity.
- **Inactive:** Transparent background, border at 40% opacity, label at 55% opacity, icon at 35% opacity.
- **Transition:** `transition-all` on all properties. `active:scale-[0.97]` gives tactile press feedback.
- **Current corner radius:** rounded-xl (14px). Per the Sharp Edge Rule, target: 0px on next refactor.

### Transaction Items
Horizontal rows in the transaction list. Category icon left, name and badge center, amount right.
- **Default:** White Surface background, no visible border (`border-transparent`).
- **Selected:** Dim Surface background, Border Cool border visible.
- **Category Icon:** 36x36px container, category color at 10% opacity (`hex + 1A`), icon at full category color.
- **Category Badge:** 10px/600, pill-shaped (rounded-full), category color at 9% opacity background, full color text.
- **Amount:** Body/700, Income Green for positive, Expense Red for negative.
- **Current corner radius:** rounded-xl (14px). Target: 0px per the Sharp Edge Rule.

### Floating Action Button
56x56px circle. The one explicit exception to the Sharp Edge Rule: the FAB is circular by function, not aesthetics. Deep Graphite background, Off-White plus icon, fixed bottom-right on mobile. Hidden on desktop (header button handles the same action).

### Context Menu (Tap-to-Select)
Portal-rendered action overlay appearing above or below a selected transaction row. Contains Edit and Delete actions separated by a 1px vertical divider.
- **Container:** Secondary background (Dim Surface / Dark Raised), Border Cool border, `shadow-lg shadow-black/10`.
- **Buttons:** Ghost style for Edit; Destructive style for Delete. 12px/700.
- **Animation:** Spring entry from the transaction's position (cubic-bezier(0.34, 1.56, 0.64, 1), 400ms). Distinct above/below variants.
- **Current corner radius:** rounded-2xl. Target: 0px per the Sharp Edge Rule.

## 6. Do's and Don'ts

### Do:
- **Do** use Income Green (#10B981) and Expense Red (#F43F5E) exclusively for their semantic roles: income/positive and expense/negative/destructive.
- **Do** use 0px radius for all new interactive elements. The FAB (circular by function) is the sole exception.
- **Do** differentiate surfaces through tonal background steps, not added shadows.
- **Do** use weight contrast (500/700/800) to build typographic hierarchy. Avoid expanding the size scale.
- **Do** write all UI copy in Spanish. The product is native to Spanish, not translated from English.
- **Do** gate every animation behind `@media (prefers-reduced-motion: reduce)`. The keyframes in `globals.css` already do this.

### Don't:
- **Don't** introduce a third saturated accent. The signal of Income Green and Expense Red depends on their being the only two.
- **Don't** apply warm tints to any neutral. No beige, no cream, no amber. Every gray runs cool.
- **Don't** use gradient fills, decorative blurs, or glassmorphism. The system is opaque and flat.
- **Don't** stripe list items or callouts with a left or right border accent wider than 1px. Use background tints or nothing.
- **Don't** apply gradient text (background-clip: text). Amounts are bold and single-color.
- **Don't** look to BBVA/Santander for compositional cues (rigid corporate blue, formal serif logotypes, horizontal rules used as decoration). Avoid Mint/YNAB chart-splash layouts (hero metric with gradient accent, identical stat-card grids). Avoid crypto neon-on-black energy entirely.
- **Don't** use rounded corners wider than 0px on new components. The category badge pill (rounded-full) and the FAB are the only grandfathered exceptions.
- **Don't** add shadows to components at rest. If something is flat, it has no shadow.
