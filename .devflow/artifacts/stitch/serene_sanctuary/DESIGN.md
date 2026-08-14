---
name: Serene Sanctuary
colors:
  surface: '#fbf9f6'
  surface-dim: '#dbdad7'
  surface-bright: '#fbf9f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f1'
  surface-container: '#efeeeb'
  surface-container-high: '#e9e8e5'
  surface-container-highest: '#e4e2e0'
  on-surface: '#1b1c1a'
  on-surface-variant: '#434843'
  inverse-surface: '#30312f'
  inverse-on-surface: '#f2f0ee'
  outline: '#737872'
  outline-variant: '#c3c8c1'
  surface-tint: '#506354'
  primary: '#334537'
  on-primary: '#ffffff'
  primary-container: '#4a5d4e'
  on-primary-container: '#c0d5c2'
  inverse-primary: '#b7ccb9'
  secondary: '#7d562d'
  on-secondary: '#ffffff'
  secondary-container: '#ffca98'
  on-secondary-container: '#7a532a'
  tertiary: '#553a3e'
  on-tertiary: '#ffffff'
  tertiary-container: '#6e5155'
  on-tertiary-container: '#ecc6ca'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d3e8d5'
  primary-fixed-dim: '#b7ccb9'
  on-primary-fixed: '#0e1f13'
  on-primary-fixed-variant: '#394b3d'
  secondary-fixed: '#ffdcbd'
  secondary-fixed-dim: '#f0bd8b'
  on-secondary-fixed: '#2c1600'
  on-secondary-fixed-variant: '#623f18'
  tertiary-fixed: '#ffd9de'
  tertiary-fixed-dim: '#e3bdc2'
  on-tertiary-fixed: '#2b1519'
  on-tertiary-fixed-variant: '#5b4043'
  background: '#fbf9f6'
  on-background: '#1b1c1a'
  surface-variant: '#e4e2e0'
typography:
  display-lg:
    fontFamily: EB Garamond
    fontSize: 64px
    fontWeight: '400'
    lineHeight: 72px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: EB Garamond
    fontSize: 48px
    fontWeight: '400'
    lineHeight: 56px
  headline-md:
    fontFamily: EB Garamond
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 40px
  headline-sm:
    fontFamily: EB Garamond
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  body-lg:
    fontFamily: Outfit
    fontSize: 20px
    fontWeight: '300'
    lineHeight: 32px
  body-md:
    fontFamily: Outfit
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Outfit
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Outfit
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  section-gap: 80px
  container-padding: 48px
  element-gap: 24px
  gutter: 32px
  max-width: 1200px
---

## Brand & Style

The design system is anchored in the concept of "Digital Respite." It targets individuals seeking a retreat from the overstimulating nature of modern interfaces. The aesthetic direction is a blend of **Minimalism** and **Tactile Softness**, evoking the sensation of high-end apothecary packaging or a secluded wellness retreat.

The UI avoids high-frequency patterns and aggressive transitions. Instead, it prioritizes breathability through expansive whitespace and a rhythmic, slow-paced visual hierarchy. Every interaction should feel intentional and calming, utilizing soft transitions and a limited, nature-inspired palette to lower the user's cognitive load and heart rate.

## Colors

The palette is derived from organic elements: stone, leaf, and earth. 

- **Primary (Deep Sage):** Used for key actions and branding. It represents grounding and growth.
- **Accent (Soft Clay):** Used sparingly for highlighting active states or celebratory moments (e.g., "Session Complete").
- **Neutral Layers:** Alabaster Cream serves as the primary canvas to reduce blue-light strain, while Pure White is reserved for elevated surface containers to create subtle depth.
- **Text (Charcoal Green):** A softened dark tone that provides high legibility without the harshness of pure black.

## Typography

This design system utilizes a sophisticated typographic pairing to balance editorial elegance with functional clarity.

- **Headlines (EB Garamond):** Used for all major headings and "moments of reflection." The serif's classical proportions instill a sense of timelessness and authority. *Note: EB Garamond is used as the closest available substitute for Cormorant Garamond.*
- **Body & UI (Outfit):** A modern, geometric sans-serif with a wide aperture. It remains highly legible even at light weights, maintaining the "airy" feel of the interface.
- **Styling Note:** Ensure ample line height (1.5x - 1.6x) for body text to promote scanning and reduce visual density.

## Layout & Spacing

The layout philosophy follows a **Fixed Grid** model centered on the screen to create a sense of focus and containment. 

- **Generous Margins:** A minimum of 48px padding is required within all container elements. 
- **Section Breathing Room:** Use 80px or more between distinct content sections to prevent the UI from feeling "crowded."
- **Desktop Grid:** A 12-column grid with 32px gutters. Content should ideally occupy the center 8-10 columns for long-form reading to maintain comfortable line lengths.
- **Alignment:** Use asymmetrical layouts occasionally for a more organic, "scrapbook" editorial feel, rather than rigid, repetitive blocks.

## Elevation & Depth

Depth in this design system is achieved through **Tonal Layering** rather than high-contrast shadows.

- **Surfaces:** The background is Alabaster Cream (#F9F6F0). Interactive or content-heavy cards are Pure White (#FFFFFF).
- **Shadows:** Use a single, signature "Whisper Shadow" for floating elements: `0 12px 24px -4px rgba(44, 53, 45, 0.05)`. This shadow should feel like a soft glow rather than a dark void.
- **Borders:** Avoid borders for structural separation. If a border is necessary for accessibility (e.g., input fields), use a 1px stroke of Dusty Sage (#8B978F) at 30% opacity.

## Shapes

The shape language is defined by large, sweeping curves that mimic polished river stones.

- **Main Containers:** All cards, modals, and major sections use a 24px corner radius.
- **Secondary Elements:** Buttons and small input fields use a 12px or 16px radius to maintain harmony with larger components.
- **Icons:** Use "Outlined" or "Lightweight" icons with rounded terminals to match the Outfit typeface. Avoid sharp 90-degree angles in custom iconography.

## Components

### Buttons
Primary buttons use the Deep Sage background with White text. Hover states should subtly darken the background. Secondary buttons use a Soft Clay text label with no background, or a very thin 1px border.

### Input Fields
Inputs are Pure White with a 16px radius. The label sits above in the Label-MD style. Focus states are indicated by a soft 1px border in Soft Clay, never a harsh glow.

### Cards
Cards are the primary container for content. They must always feature the 24px radius and the signature Whisper Shadow. Interior padding should never drop below 32px.

### Chips/Tags
Used for mood tracking or categories. These should be pill-shaped with a Dusty Sage background at 15% opacity and Deep Sage text.

### Imagery
All photography must be desaturated by 10-20% and lean towards warm, natural tones. Use soft-focus backgrounds to maintain the "Serene" atmosphere. Images should also adopt the 24px corner radius.