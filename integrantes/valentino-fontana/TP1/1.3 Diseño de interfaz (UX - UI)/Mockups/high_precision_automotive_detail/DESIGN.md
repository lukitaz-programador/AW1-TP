---
name: High-Precision Automotive Detail
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#424752'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#727784'
  outline-variant: '#c2c6d4'
  surface-tint: '#115cb9'
  primary: '#003f87'
  on-primary: '#ffffff'
  primary-container: '#0056b3'
  on-primary-container: '#bbd0ff'
  inverse-primary: '#acc7ff'
  secondary: '#006e25'
  on-secondary: '#ffffff'
  secondary-container: '#80f98b'
  on-secondary-container: '#007327'
  tertiary: '#722b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#983c00'
  on-tertiary-container: '#ffc2a7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d7e2ff'
  primary-fixed-dim: '#acc7ff'
  on-primary-fixed: '#001a40'
  on-primary-fixed-variant: '#004491'
  secondary-fixed: '#83fc8e'
  secondary-fixed-dim: '#66df75'
  on-secondary-fixed: '#002106'
  on-secondary-fixed-variant: '#00531a'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb694'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7b2f00'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  headline-lg:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-sm:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  max-width: 1280px
---

## Brand & Style
The design system is engineered for the premium automotive detailing sector, targeting discerning vehicle owners who value precision, protection, and professional-grade results. The brand personality is **modern, trustworthy, and high-tech**, reflecting the chemical science and meticulous craftsmanship behind elite car care.

The visual style is **Corporate / Modern** with a focus on high-utility layouts and technical clarity. It avoids excessive ornamentation in favor of a "lab-grade" aesthetic—clean white spaces, structured information density, and subtle technical accents that evoke the feeling of a premium garage or a high-performance engineering studio.

## Colors
The palette is anchored by **Corporate Blue**, a color that establishes immediate authority and reliability. This is contrasted by **Bright Green**, reserved exclusively for high-priority calls to action (CTAs) and "success" states, symbolizing the pristine "green light" of a finished, protected vehicle.

- **Primary (Corporate Blue):** Used for headers, primary buttons, and navigational anchors.
- **Accent (Bright Green):** Used for "Book Now" buttons, service confirmations, and highlighting premium protection packages.
- **Backgrounds:** A tiered system of neutral grays (`#F8F9FA`, `#E9ECEF`) and pure white to create a clinical, high-end environment that allows high-resolution photography of gloss and paintwork to stand out.

## Typography
This design system employs a dual-font strategy to balance impact with legibility. 

**Montserrat** is used for headlines to provide a bold, geometric, and modern architectural feel. It conveys the strength of the brand. **Inter** is utilized for body text and functional labels; its systematic and neutral character ensures that technical service descriptions and pricing data are easy to digest at any scale. Use `label-caps` for small metadata, such as vehicle classes or service categories, to enhance the technical aesthetic.

## Layout & Spacing
The layout follows a **fixed-width grid** for desktop to maintain a premium, editorial feel, while transitioning to a fluid model for mobile devices. 

- **Grid:** 12-column system on desktop, 4-column on mobile.
- **Rhythm:** An 8px base unit governs all dimensions. Elements should be separated by increments of 8px (16, 24, 32, 48, 64) to maintain a rigorous, engineered structure.
- **Sectioning:** Large vertical padding (80px–120px) should be used between major sections to emphasize whitespace and high-end positioning.

## Elevation & Depth
To maintain a high-tech and "clean" appearance, depth is handled primarily through **low-contrast outlines** and **tonal layers** rather than heavy shadows.

- **Surface Tiers:** Use subtle gray backgrounds (`#F1F3F5`) to distinguish container areas from the main white page background.
- **Ghost Borders:** Cards and inputs should use a 1px border (`#DEE2E6`) to define shape. 
- **Active Elevation:** Only use shadows for "active" or "floating" elements like dropdown menus or hovered service cards. These shadows should be extremely diffused (Blur: 20px, Opacity: 8%, Color: Corporate Blue) to create a soft, sophisticated lift without looking muddy.

## Shapes
The shape language is defined by a **Rounded (8px)** corner radius. This choice strikes a balance between the "sharpness" of precision tools and the "smoothness" of a polished vehicle surface. 

Large-scale containers (like Hero images) may use `rounded-xl` (24px) to frame content more softly, while functional elements like inputs and small buttons stay strictly at the base 8px radius to retain a technical, mechanical character.

## Components
- **Buttons:** Primary buttons use a solid Corporate Blue fill with white Montserrat text. The Accent (CTA) button uses the Bright Green fill. All buttons should have a subtle 2px inset border on hover to simulate a "mechanical press."
- **Cards:** Used for service packages (e.g., Ceramic Coating, Paint Correction). Use a 1px light gray border and 24px internal padding. Headlines should be Montserrat Bold.
- **Input Fields:** Flat white background with a 1px border. On focus, the border transitions to Corporate Blue with a 2px thickness. Use Inter for placeholder text.
- **Service Chips:** Small, 8px rounded capsules with a light blue background and dark blue text, used to denote features like "UV Protection" or "5-Year Warranty."
- **Status Indicators:** Use the Bright Green for "Available" or "Completed" statuses to reinforce the positive, high-action nature of the accent color.
- **Before/After Slider:** A custom component specific to this design system. A high-contrast vertical line with a central handle used to compare paint conditions; the handle should use the Corporate Blue color.