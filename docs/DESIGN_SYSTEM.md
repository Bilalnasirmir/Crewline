MASTER UI DESIGN SYSTEM PROMPT

Use the attached/reference screenshots as the visual reference for the UI system.

IMPORTANT:
Do NOT copy Shopify branding, logos, product names, illustrations, trademarks, or proprietary assets. Recreate the underlying visual design language, layout principles, spacing, typography, component geometry, interaction patterns, and overall UI quality using completely original branding and assets.

The goal is to build a premium enterprise SaaS/admin dashboard that follows the same visual design language as the reference screenshots.

==================================================
1. OVERALL DESIGN LANGUAGE
==================================================

Create a clean, premium, modern enterprise SaaS/admin interface.

Visual characteristics:

- Professional
- Minimal
- Functional
- High information density without feeling crowded
- Neutral grayscale foundation
- Extremely clean hierarchy
- Soft rounded corners
- Thin subtle borders
- Very restrained shadows
- Compact controls
- Strong typography hierarchy
- Large amounts of intentional whitespace
- No unnecessary decoration
- No excessive gradients
- No glassmorphism
- No neon effects
- No giant typography
- No excessive pills
- No exaggerated animations

The UI should feel like a mature enterprise product rather than a marketing website.

The design should feel calm, precise, polished, predictable, and expensive.

==================================================
2. COLOR SYSTEM
==================================================

Use this color foundation:

--color-bg: #F1F1F1
--color-surface: #FFFFFF
--color-surface-subdued: #F6F6F6
--color-sidebar: #EBEBEB

--color-topbar: #0A0A0A
--color-dark-surface: #202020
--color-dark-hover: #1A1A1A

--color-text: #303030
--color-text-secondary: #616161
--color-text-subdued: #707070
--color-text-disabled: #8C8C8C
--color-text-inverse: #FFFFFF

--color-border: #E1E3E5
--color-border-subtle: #E6E6E6

Semantic colors:

--color-info: #2C6ECB
--color-success: #008060
--color-warning: #B98900
--color-critical: #D72C0D

The interface must remain predominantly grayscale.

Use accent colors only when they communicate meaning, state, status, selection, information, success, warning, or critical conditions.

Do not make the dashboard overly colorful.

==================================================
3. TYPOGRAPHY
==================================================

Use:

"ShopifyInter", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif

If ShopifyInter is unavailable, use Inter.

Typography must be clean, highly readable, and compact.

Font weights:

400 = regular
500 = medium
600 = semibold
700 = bold

Typography scale:

12px = tiny metadata
13px = secondary UI
14px = primary UI/body
16px = emphasized text
18px = card/section headings
20px = major headings
24px = page headings

Typical line heights:

12px → 16px
13px → 18px
14px → 20px
16px → 22px
18px → 24px
20px → 26px
24px → 30px

Primary UI text should generally be 14px.

Page headings should generally be 24px / 600.

Section headings should generally be 18–20px / 600.

Do NOT use huge 48px–72px SaaS headings inside the application.

==================================================
4. SPACING SYSTEM
==================================================

Use a 4px base spacing system.

Tokens:

4px
8px
12px
16px
20px
24px
28px
32px
40px
48px
64px

Most UI spacing should use:

8px
12px
16px
20px
24px
32px

Avoid arbitrary spacing values.

Maintain consistent spacing throughout the entire application.

==================================================
5. BORDER RADIUS
==================================================

Use:

6px = small elements
8px = buttons/inputs
10–12px = controls
14–16px = cards
16–20px = large containers
999px = badges/status pills only

Do not make every element pill-shaped.

Buttons should normally be rounded rectangles, not pills.

==================================================
6. GLOBAL APPLICATION LAYOUT
==================================================

Use a desktop application layout.

Top navigation:

height: approximately 64px
background: #0A0A0A

Sidebar:

width: approximately 268px
background: #EBEBEB

Main content:

background: #F1F1F1
padding: approximately 24px

Structure:

APP
├── TopBar
├── Sidebar
└── MainContent

The sidebar remains fixed on desktop.

The main content scrolls independently.

==================================================
7. TOP BAR
==================================================

Create a black global top navigation bar.

Height:

64px

Layout:

LEFT:
- brand/logo

CENTER:
- global search

RIGHT:
- utility icon
- notifications
- avatar
- account/store name

Search:

height: 40px
width: approximately 550–650px
background: #202020
border: 1px solid #363636
border-radius: 12px

Search text:

14–16px
color: #FFFFFF

Placeholder:

subdued white/gray

Keyboard shortcut badge:

small dark capsule
font-size: 11px
font-weight: 600
padding: 2px 6px
border-radius: 5px

Top bar must feel compact and professional.

==================================================
8. SIDEBAR
==================================================

Sidebar:

background: #EBEBEB
width: 268px

Navigation items:

height: approximately 36px
padding: 8px 12px
border-radius: 9px

Text:

14px
font-weight: 500

Icons:

18px

Primary navigation should be compact.

Example structure:

Home
Orders
    Drafts
    Abandoned checkouts
Products
    Collections
    Inventory
    Purchase orders
    Transfers
    Gift cards
Customers
Growth
Discounts
Content
Markets
Analytics
    Reports
    Live View

Nested navigation should be indented approximately 36–40px.

ACTIVE NAVIGATION:

background: #FFFFFF
border-radius: 9px
font-weight: 500–600

Do not use a large colored active indicator.

The active state should primarily be communicated through the white surface and stronger contrast.

Hover:

background: rgba(255,255,255,0.55)

==================================================
9. PAGE HEADER
==================================================

Typical page header:

[icon] Page Name                         [Actions]

Page title:

24px
font-weight: 600
line-height: 30px
color: #303030

Icon:

18–20px

Actions aligned to the right.

Maintain approximately 24px spacing below the header.

==================================================
10. BUTTON SYSTEM
==================================================

Primary button:

height: 36–40px
padding: 0 14px
border-radius: 8px
font-size: 14px
font-weight: 600

Primary:

background: #303030
color: #FFFFFF

Hover:

background: #1A1A1A

Secondary:

background: #FFFFFF
color: #303030
border: 1px solid #C9CCCF

Tertiary:

transparent
no visible border

Buttons must feel compact.

Avoid oversized buttons.

Avoid pill-shaped buttons except when semantically appropriate.

==================================================
11. CARDS
==================================================

Cards:

background: #FFFFFF
border: 1px solid #E1E3E5
border-radius: 14–16px

Padding:

16–24px

Use extremely subtle shadows.

Default:

box-shadow: 0 1px 2px rgba(0,0,0,0.04)

Do not use large floating shadows.

Cards should look mostly flat.

==================================================
12. METRIC CARDS
==================================================

Analytics/dashboard metric cards should use:

white background
subtle border
14–16px radius
16–20px padding

Title:

14px
font-weight: 500

Value:

20–24px
font-weight: 600

Supporting information:

12–14px
color: #616161

Information icon:

16px

Desktop metric grid:

4 columns

gap:

16px

Responsive:

2 columns on tablet
1 column on mobile

==================================================
13. EMPTY STATES
==================================================

Empty states should never simply say:

"No data."

Instead provide:

- illustration
- heading
- explanation
- primary action

Example structure:

[Illustration]

Heading

Short explanation describing what the user can do here.

[Primary Action]

Everything centered when using a centered empty state.

Illustrations should be simple, clean, flat/vector-style, and use restrained colors.

Do not use photorealistic imagery inside administrative empty states.

==================================================
14. ONBOARDING CARDS
==================================================

Onboarding cards should contain:

Heading
Description
Illustration
CTA

Use a 3-column grid on desktop.

gap:

16px

Cards:

white
border
14–18px radius

Illustrations should occupy the lower/right portion of the card when appropriate.

Onboarding content should feel useful, not promotional.

==================================================
15. TABLES
==================================================

Tables must be clean and dense.

Header:

font-size: 13–14px
font-weight: 500
color: #616161

Rows:

height: approximately 42–48px

Borders:

1px solid #E1E3E5

Avoid strong grid lines.

Avoid excessive zebra striping.

Use whitespace and typography for hierarchy.

Table columns must align precisely.

==================================================
16. BADGES / CHIPS
==================================================

Use pill-shaped badges only for statuses/categories.

Example:

Acquisition
Behavior
Active
Pending
Completed

Style:

padding: 3px 9px
border-radius: 999px
font-size: 12px
font-weight: 500

Default neutral badge:

background: #E8E8E8
color: #616161

Semantic badges should use subtle semantic backgrounds rather than saturated backgrounds.

==================================================
17. INPUTS
==================================================

Inputs:

height: 40px
background: #FFFFFF
border: 1px solid #C9CCCF
border-radius: 8px
padding: 0 12px
font-size: 14px

Focus:

2px subtle blue outline

Do not use glowing focus effects.

Inputs should feel compact and enterprise-grade.

==================================================
18. DROPDOWNS / POPOVERS
==================================================

Dropdown:

background: #FFFFFF
border: 1px solid #E1E3E5
border-radius: 12px

Shadow:

0 4px 12px rgba(0,0,0,0.10)

Menu item:

height: 36–40px
padding: 8px 12px
border-radius: 7px

Hover:

background: #F6F6F6

Animation:

150–200ms

opacity 0 → 1
translateY(-4px) → translateY(0)

==================================================
19. TOGGLES
==================================================

Toggle:

width: approximately 36px
height: 20px
border-radius: 999px

Knob:

16px

Keep toggle design minimal.

No gradients.

==================================================
20. BANNERS
==================================================

Informational banners should be subtle.

Example:

background: very light blue
border-radius: 10px
padding: 12px 16px

Structure:

[icon] Message                         [close]

Semantic variations:

INFO → blue
SUCCESS → green
WARNING → yellow/orange
CRITICAL → red

Do not use highly saturated backgrounds.

==================================================
21. ICON SYSTEM
==================================================

Use one consistent icon library.

Icons should be:

- outline-oriented
- simple
- monochrome
- compact
- consistent

Sizes:

16px = utility
18px = navigation
20px = page-level
24px = major actions

Stroke approximately:

1.8–2px

Never mix random icon styles.

Do not use colorful 3D icons.

==================================================
22. AVATARS
==================================================

Avatar:

34–36px
border-radius: 10px

Use the application's own brand color.

Initials should be centered.

==================================================
23. TABS
==================================================

Tabs should be compact.

Height:

36–40px

Padding:

0 12px

Selected:

background: #F1F1F1
border-radius: 9px

Do not use oversized tab controls.

==================================================
24. CHARTS
==================================================

Charts should be extremely subtle.

Grid lines:

#E6E6E6

Axis labels:

12px
color: #707070

Chart lines:

thin

Avoid:

- 3D charts
- glowing charts
- heavy gradients
- excessive data labels
- decorative chart effects

Charts should prioritize readability.

==================================================
25. MOTION / ANIMATION
==================================================

Animations should be functional, subtle, and fast.

Never use bouncy, playful, exaggerated animations.

Tokens:

--duration-fast: 120ms
--duration-standard: 180ms
--duration-slow: 240ms

Easing:

--ease-standard: cubic-bezier(.2, 0, .2, 1)
--ease-enter: cubic-bezier(.16, 1, .3, 1)
--ease-exit: cubic-bezier(.4, 0, 1, 1)

Use animation for:

- hover
- focus
- dropdown opening
- dropdown closing
- modal opening
- modal closing
- sidebar expansion
- selection
- loading
- success/error feedback
- expand/collapse

Avoid animations on static content.

Motion should communicate state, not decoration.

==================================================
26. HOVER STATES
==================================================

Hover states must be subtle.

Buttons:

slightly darker

Navigation:

slightly lighter background

Cards:

very subtle elevation or background change

Never make elements jump, scale dramatically, or glow.

==================================================
27. SHADOW SYSTEM
==================================================

Default:

none

Level 1:

0 1px 2px rgba(0,0,0,0.05)

Level 2:

0 4px 12px rgba(0,0,0,0.10)

Level 3:

0 12px 32px rgba(0,0,0,0.14)

Use shadows primarily for:

- dropdowns
- popovers
- modals
- floating elements

Normal cards should remain almost flat.

==================================================
28. RESPONSIVE DESIGN
==================================================

Desktop:

sidebar visible
4-column metric grids
3-column onboarding cards

Tablet:

sidebar may collapse
2-column grids

Mobile:

sidebar becomes drawer
1-column cards
1-column metrics
full-width controls
tables become horizontally scrollable
page actions may stack

Do not simply shrink desktop UI.

The layout must intelligently reflow.

==================================================
29. ACCESSIBILITY
==================================================

Maintain:

- keyboard navigation
- visible focus states
- accessible labels
- semantic HTML
- minimum usable click targets
- sufficient text contrast
- aria labels for icon-only buttons
- reduced-motion support

Respect:

prefers-reduced-motion

When reduced motion is enabled, minimize or remove non-essential animations.

==================================================
30. COMPONENT ARCHITECTURE
==================================================

Build reusable components rather than designing each page independently.

Create:

AppShell
TopBar
GlobalSearch
Sidebar
SidebarSection
SidebarItem
PageHeader
PageActions
Button
SecondaryButton
IconButton
Dropdown
Popover
Modal
Tooltip
Input
Select
SearchInput
Tabs
Tab
Badge
StatusBadge
Banner
Card
MetricCard
EmptyState
Illustration
DataTable
TableHeader
TableRow
Pagination
Chart
ChartCard
OnboardingCard
Toggle
Avatar
Divider
Toast
LoadingSkeleton

Every page must reuse these components.

Do not create slightly different versions of the same component.

==================================================
31. DESIGN TOKENS
==================================================

Use these tokens globally:

:root {
  --color-bg: #F1F1F1;
  --color-surface: #FFFFFF;
  --color-surface-subdued: #F6F6F6;
  --color-sidebar: #EBEBEB;

  --color-topbar: #0A0A0A;
  --color-dark-surface: #202020;

  --color-text: #303030;
  --color-text-secondary: #616161;
  --color-text-subdued: #707070;
  --color-text-disabled: #8C8C8C;
  --color-text-inverse: #FFFFFF;

  --color-border: #E1E3E5;
  --color-border-subtle: #E6E6E6;

  --color-info: #2C6ECB;
  --color-success: #008060;
  --color-warning: #B98900;
  --color-critical: #D72C0D;

  --font-family:
    "ShopifyInter",
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;

  --font-size-xs: 12px;
  --font-size-sm: 13px;
  --font-size-base: 14px;
  --font-size-md: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 20px;
  --font-size-2xl: 24px;

  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-pill: 999px;

  --topbar-height: 64px;
  --sidebar-width: 268px;

  --duration-fast: 120ms;
  --duration-standard: 180ms;
  --duration-slow: 240ms;

  --ease-standard: cubic-bezier(.2, 0, .2, 1);
  --ease-enter: cubic-bezier(.16, 1, .3, 1);
  --ease-exit: cubic-bezier(.4, 0, 1, 1);
}

==================================================
32. VISUAL QUALITY RULES
==================================================

The final UI must satisfy all of these:

- Clean
- Premium
- Consistent
- Dense but comfortable
- Extremely polished
- Minimal
- Enterprise-grade
- Visually quiet
- Easy to scan
- Easy to navigate
- Strong hierarchy
- Consistent spacing
- Consistent typography
- Consistent iconography

Every component must look like it belongs to the same product.

==================================================
33. DO NOT DO THESE THINGS
==================================================

DO NOT:

- use excessive gradients
- use glassmorphism
- use neon colors
- use giant headings
- use giant buttons
- use excessive rounded pills
- use thick borders
- use heavy card shadows
- use random colors
- use inconsistent icon sets
- use decorative animations
- use bouncing UI
- use oversized cards
- use unnecessary illustrations
- use excessive whitespace that makes the dashboard inefficient
- make every component look like a floating card
- use random spacing
- create inconsistent button heights
- create inconsistent border radii
- create inconsistent typography
- use startup landing-page aesthetics inside the dashboard

==================================================
34. CORE DESIGN PRINCIPLE
==================================================

The interface should feel like a mature enterprise operating system for a business.

Prioritize:

Hierarchy
→ clarity
→ consistency
→ usability
→ information density
→ polish
→ subtle motion

Do not prioritize decoration.

The UI should look extremely close in visual language to the provided reference screenshots while remaining an original product with its own branding and identity.

==================================================
35. IMPLEMENTATION INSTRUCTION
==================================================

Before building individual pages:

1. Create the global design tokens.
2. Create the typography system.
3. Create the color system.
4. Create the spacing system.
5. Create the radius system.
6. Create the shadow system.
7. Create the motion system.
8. Build the AppShell.
9. Build the TopBar.
10. Build the Sidebar.
11. Build the reusable component library.
12. Build responsive behavior.
13. Then build individual screens using those components.

Do NOT hard-code a different style for every page.

The design system must be centralized so changing one token updates the entire application.

==================================================
FINAL INSTRUCTION
==================================================

Treat the provided screenshots as the visual source of truth for:

- overall proportions
- density
- hierarchy
- component appearance
- spacing relationships
- navigation structure
- card treatment
- button treatment
- typography hierarchy
- table treatment
- empty states
- analytics layout
- onboarding cards
- visual restraint
- interaction style

Recreate the same level of visual polish and consistency, but use original branding, original content, original icons where necessary, and original illustrations.

The result should look like a premium enterprise SaaS product designed by a top-tier product design team.