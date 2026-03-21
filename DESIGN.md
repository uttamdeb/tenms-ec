# Design System Document: EC Data Agent

## 1. Creative North Star: "The Kinetic Monolith"
The design system for EC Data Agent is built upon the concept of **Kinetic Monolithism**. In a world of cluttered data, this system acts as a singular, sophisticated lens. It rejects the "standard dashboard" aesthetic in favor of a high-end editorial experience.

By utilizing heavy glassmorphism, we move away from static boxes to a UI that feels like light passing through polarized glass. The "Kinetic" aspect is achieved through intentional asymmetry and high-contrast typography, while "Monolithism" is represented by the deep, authoritative charcoal surfaces. This system is designed to feel like a premium tool for decision-makers—minimal, precise, and undeniably modern.

---

## 2. Color & Surface Architecture

The palette is rooted in deep blacks and charcoals to provide a canvas where data can "glow."

### Palette Definition
- **Primary:** `#FBBF24` (The vibrant spark in a dark environment)
- **Background:** `#0E0E0E` (The void)
- **Surface Container Lowest:** `#000000` (Recessed areas)
- **Surface Container High:** `#20201F` (Elevated cards/sections)

### The "No-Line" Rule
To achieve a signature look, **1px solid borders for sectioning are strictly prohibited.** Do not use lines to separate the sidebar from the main chat or the chat input from the history.
- **Method:** Define boundaries using color shifts. Place a `surface-container-low` panel against a `surface` background.
- **Exception:** Only use "Ghost Borders" (see Elevation) for specific glass containers.

### The "Glass & Gradient" Rule
Floating elements (Modals, Profile Settings, Popovers) must use **Glassmorphism**.
- **Recipe:** `surface-container-highest` at 60% opacity + `backdrop-blur(12px)`.
- **CTA Soul:** Main buttons should not be flat. Use a subtle linear gradient from `primary` (#fcc025) to `primary-container` (#e6ad03) at a 135° angle to give the element "weight" and polish.

---

## 3. Typography Scale

We pair **Manrope** (for structural authority) with **Inter** (for high-density data legibility).

| Level | Font | Size | Use Case |
| :--- | :--- | :--- | :--- |
| **Display-LG** | Manrope | 3.5rem | Hero data points or branding |
| **Headline-MD** | Manrope | 1.75rem | Chat section headers |
| **Title-SM** | Inter | 1.0rem | Active chat titles / Sidebar items |
| **Body-MD** | Inter | 0.875rem | Standard chat bubbles / Data tables |
| **Label-SM** | Inter | 0.6875rem | Captions / Metadata / Chart axis |

**Editorial Intent:** Use wide letter-spacing (0.05em) for `Label-SM` in uppercase to create a premium, "technical" feel. Use `Headline-LG` for the primary response from the AI to emphasize the "Agent's" voice.

---

## 4. Elevation & Depth: Tonal Layering

Traditional shadows are replaced by **Ambient Luminance**.

- **The Layering Principle:**
1. Base: `surface` (#0e0e0e).
2. Sidebar: `surface-container-low` (#131313).
3. Content Cards: `surface-container-high` (#20201f).
- **Ghost Borders:** For glass containers, use `outline-variant` (#484847) at **15% opacity**. This creates a shimmer effect that mimics a glass edge without looking like a "box."
- **Ambient Shadows:** For floating profile menus, use a 40px blur with 6% opacity of `on-surface` (#ffffff). This creates a "glow" rather than a dark shadow, making the menu appear to emit light.

---

## 5. Components

### Chat Interface
- **User Input:** No border. Use `surface-container-highest` with a `xl` (0.75rem) roundedness.
- **AI Response Bubbles:** Use a "No-Line" approach. The bubble is simply a shift to `surface-container-low`.
- **User Bubbles:** Utilize the `primary` color but with a high-contrast `on-primary` (#563e00) text for immediate distinction.

### Data Tables & Charts
- **Tables:** Forbid divider lines between rows. Use alternating background shifts (`surface-container-low` vs `surface-container-lowest`) or purely vertical whitespace (spacing `4`).
- **Charts:** Use the `primary` yellow for the main data series. Secondary series should use `secondary-dim` (#efc930).
- **Tooltips:** Always glassmorphic. Dark background, 80% opacity, white text.

### Action Elements
- **Primary Button:** Gradient fill, `full` roundedness, no border.
- **Secondary/Ghost Button:** Text-only with `primary` color. On hover, apply a `surface-variant` background at 10% opacity.
- **Chips:** Used for data tags. `surface-container-highest` background with `sm` (0.125rem) roundedness for a sharper, more professional "industrial" look.

---

## 6. Do's and Don'ts

### Do
- **DO** use the `24` (6rem) spacing for major section breathing room.
- **DO** use asymmetry. For example, the Profile settings menu should feel like it's floating freely, not snapped to a grid line.
- **DO** use Manrope for any text that serves as a "Header" to maintain the editorial vibe.

### Don't
- **DON'T** use 100% white text on a black background for long-form reading. Use `on-surface-variant` (#adaaaa) to reduce eye strain.
- **DON'T** use standard 1px borders to separate chat history from the main stage. Use a subtle tonal step-down in the background color.
- **DON'T** use "Help Center" or "Templates" in the navigation. Keep the sidebar strictly focused on Chat History and the "New Chat" action.

---

## 7. Interaction Micro-patterns
- **Glass Hover:** When hovering over a sidebar item (Chat History), the background should transition to a 10% white overlay with a `backdrop-blur(4px)`.
- **The "Focus" State:** When the chat input is focused, the "Ghost Border" should increase in opacity from 15% to 40% using the `primary` color token.