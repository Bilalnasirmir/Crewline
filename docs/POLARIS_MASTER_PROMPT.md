# Polaris master UI prompt (owner's instruction, 28 Sep 2026, verbatim)

> Given by the owner at the start of the Claude Code phase. It is the binding instruction for everything visual and supersedes the pixel sizes in `DESIGN_SYSTEM.md` (those were measured from screenshots taken at 125% display scaling). See `PROJECT_BRIEF.md` §4 for how it was applied and verified.

---

MASTER SHOPIFY POLARIS UI IMPLEMENTATION PROMPT

You are the lead product designer and frontend engineer for this application.

Your task is to build a production-quality application UI following the CURRENT SHOPIFY ADMIN / SHOPIFY POLARIS visual system as closely as technically possible.

This is a STRICT implementation instruction.

This is NOT a generic design brief.

This is NOT a request to create a “Shopify-inspired” SaaS dashboard.

The Shopify / Polaris design language is the primary visual reference.

The application’s branding, name, logo, content, and product identity must remain ORIGINAL.

Do NOT copy Shopify’s logo, trademarks, proprietary artwork, or brand identity.

Everything else about the interface should follow the current Shopify / Polaris design philosophy as closely as possible.

============================================================

1. ABSOLUTE PRIORITY
    ============================================================

Follow this priority order:

1. Functional requirements
2. Current Shopify Polaris design system
3. Official Polaris typography
4. Official Polaris design tokens
5. Shopify-style layout and information density
6. Shopify-style component behavior
7. Reference screenshots
8. Application-specific content

Do not invent another design language.

Do not redesign the interface according to personal taste.

Do not “improve” the Shopify visual language.

Do not make it more futuristic.

Do not make it more colorful.

Do not make it more spacious.

Do not make it look like an AI-generated SaaS product.

When uncertain, choose the simpler, more restrained Polaris-style solution.

============================================================
02. CRITICAL FONT REQUIREMENT

TYPOGRAPHY IS THE HIGHEST-PRIORITY VISUAL REQUIREMENT.

The current Shopify Admin uses ShopifyInter.

The project does NOT currently contain ShopifyInter font files.

Therefore:

DO NOT pretend that ShopifyInter.woff2 exists.

DO NOT create fake @font-face declarations pointing to nonexistent files.

DO NOT download an unofficial/random ShopifyInter font file.

DO NOT rename Inter to ShopifyInter.

DO NOT create:

font-family: “ShopifyInter”;

and then secretly load Inter.

DO NOT claim that Inter is ShopifyInter.

DO NOT manually guess the ShopifyInter appearance.

Instead:

USE THE OFFICIAL CURRENT POLARIS TYPOGRAPHY IMPLEMENTATION WHENEVER AVAILABLE.

If the official Polaris package/runtime provides the correct typography automatically, USE IT.

If Polaris provides official typography tokens, USE THOSE TOKENS.

If Polaris components provide typography internally, USE THOSE COMPONENTS.

Do not override Polaris typography with a custom font declaration unless absolutely necessary.

============================================================
03. FONT IMPLEMENTATION STRATEGY

Before implementing the UI:

1. Inspect the existing project dependencies.
2. Determine whether Shopify Polaris / Polaris Web Components / official Shopify UI packages are already installed.
3. Determine whether the project’s framework can use the official Polaris implementation.
4. If Polaris provides the correct font and typography automatically, use it.
5. If Polaris provides typography tokens, use those tokens.
6. Do not replace the official implementation with manually guessed CSS.
7. Verify the computed font in the browser.
8. Verify the rendered font weight.
9. Verify the typography tokens being applied.

If the project does NOT have access to the official ShopifyInter implementation:

DO NOT fabricate one.

Use the closest technically appropriate fallback only as a fallback.

The fallback must never be presented as ShopifyInter.

Prefer a neutral, highly compatible sans-serif fallback such as:

Inter,
-apple-system,
BlinkMacSystemFont,
“Segoe UI”,
Roboto,
Helvetica,
Arial,
sans-serif

ONLY when the actual Polaris typography cannot be used.

Important:

The fallback exists because the actual font asset is unavailable.

Do NOT modify font sizes and spacing in an attempt to artificially make the fallback look like ShopifyInter.

============================================================
04. FONT VERIFICATION

Typography must be verified, not assumed.

After implementation, inspect browser-computed styles.

Verify:

font-family
font-size
font-weight
line-height
letter-spacing

Verify that the intended font resource is actually being used.

If Polaris is responsible for loading the typography, verify that Polaris has loaded it correctly.

If the browser is falling back to another font, identify why.

Do NOT continue visual tuning while the wrong font is being rendered.

FONT FIRST.

SPACING SECOND.

This rule is mandatory.

============================================================
05. TYPOGRAPHY MUST BE TOKEN-BASED

Never scatter typography values throughout the application.

Create or use centralized typography tokens.

The typography system must control:

font family
font size
font weight
line height
letter spacing
text color

Use semantic typography roles.

Examples:

page title
heading
subheading
body
body emphasis
label
caption
button
navigation
table
input
helper text
error text

Do not randomly create font sizes.

Do not use arbitrary values such as:

17px
19px
21px
23px
27px

unless the official Polaris system or reference implementation specifically requires them.

============================================================
06. DO NOT GUESS FONT SIZE

Font size is a critical requirement.

Do not estimate font size merely from screenshots when official Polaris typography tokens/components are available.

Use the actual Polaris typography scale/tokens.

If a screenshot is supplied:

Use it for visual verification.

Do not use it as the sole source of truth for typography when official Polaris tokens exist.

If a typography value differs visually from the screenshot, investigate:

font family
font weight
line height
letter spacing
browser rendering
container width

before randomly changing font size.

============================================================
07. TYPOGRAPHY HIERARCHY

Maintain a disciplined hierarchy.

PAGE TITLE:

* prominent
* restrained
* semibold where appropriate
* compact line-height
* never oversized

SECTION TITLE:

* clear hierarchy
* semibold
* restrained

BODY:

* readable
* regular
* compact
* consistent

BODY EMPHASIS:

* medium or semibold

LABEL:

* compact
* readable
* medium/semibold where appropriate

CAPTION:

* smaller
* subdued
* still legible

BUTTON:

* compact
* medium/semibold
* never oversized

TABLE:

* compact
* highly scannable

NAVIGATION:

* compact
* readable

INPUT:

* consistent with body typography

============================================================
08. TEXT COLORS

Use official Polaris semantic color tokens whenever possible.

Do not invent arbitrary text colors.

Create/use semantic roles:

primary text
secondary text
subdued text
disabled text
interactive text
critical text
success text
warning text
info text

Do not use pure #000000 as the default interface text unless the official system specifically calls for it.

Do not use colorful text merely for decoration.

============================================================
09. COLOR SYSTEM

Use the current Polaris color philosophy.

Centralize colors into semantic tokens.

Required categories:

background
surface
surface-secondary
surface-tertiary
text-primary
text-secondary
text-subdued
text-disabled
border
border-subdued
interactive
interactive-hover
interactive-active
focus
success
warning
critical
info

Do not invent random colors.

Do not use a giant color palette.

Do not use gradients as decoration.

Do not use AI-purple.

Do not use neon colors.

Do not use colorful backgrounds without semantic purpose.

============================================================
10. SPACING SYSTEM

Use the Shopify / Polaris 4px spacing foundation.

Prefer consistent values based on the 4px grid.

Examples:

4
8
12
16
20
24
28
32
36
40
48
56
64

Use official Polaris spacing tokens whenever available.

Do not create random spacing values.

Avoid arbitrary:

7px
11px
13px
17px
19px
23px

unless required by a specific component or technical constraint.

============================================================
11. INFORMATION DENSITY

The application must have Shopify-like information density.

Do NOT create excessive whitespace.

Do NOT turn every section into a giant card.

Do NOT make tables unnecessarily tall.

Do NOT make buttons oversized.

Do NOT create huge page headers.

The user should be able to scan a large amount of information efficiently.

This is an application UI.

It is NOT a marketing website.

============================================================
12. ZERO GENERIC AI UI

The following are prohibited unless explicitly required:

NO glassmorphism.

NO frosted glass.

NO blurred translucent panels.

NO neon gradients.

NO purple/blue AI gradients.

NO glowing buttons.

NO glowing borders.

NO gradient buttons.

NO gradient page backgrounds.

NO giant rounded cards.

NO excessive border radius.

NO huge hero sections.

NO oversized headings.

NO excessive shadows.

NO floating-card-heavy layouts.

NO decorative blobs.

NO decorative 3D graphics.

NO random illustrations.

NO excessive icons.

NO random badges.

NO excessive pills.

NO excessive status chips.

NO giant statistics cards.

NO futuristic dashboards.

NO “premium SaaS” styling.

NO Dribbble-style decoration.

NO generic Tailwind template appearance.

NO Material Design styling.

NO Bootstrap styling.

NO Ant Design styling.

NO Apple-style redesign.

NO Linear-style redesign.

NO Stripe-style redesign.

NO Vercel-style redesign.

NO Notion-style redesign.

NO unnecessary animation.

NO excessive micro-interactions.

NO decorative motion.

NO visual effects added simply because they look impressive.

If something looks like it came from an AI UI generator, REMOVE IT.

============================================================
13. APPLICATION SHELL

The application shell should feel like a mature Shopify Admin-style application.

Structure:

Application frame
→ Navigation
→ Header
→ Page context
→ Page actions
→ Main content
→ Supporting sections

The shell must be:

compact
structured
predictable
functional

Do not make the shell visually dramatic.

============================================================
14. NAVIGATION

Navigation must follow a restrained admin-product pattern.

Use:

clear hierarchy
consistent spacing
subtle active state
consistent icon treatment
compact typography

Avoid:

giant icons
giant navigation text
glowing active states
gradient active states
floating glass navigation
excessively rounded navigation items

Navigation should be easy to scan.

============================================================
15. HEADER

The top/header area should be functional.

It may contain:

navigation context
search
global actions
notifications
account/context controls

Do not make the header a hero section.

Do not use giant typography.

Do not add decorative backgrounds.

============================================================
16. PAGE HEADER

Page headers should contain:

title
optional description
primary action
secondary actions when necessary

Keep the hierarchy restrained.

No marketing-style hero.

No giant title.

No decorative illustration.

============================================================
17. BANNERS

Banners are functional communication components.

Use them for:

information
success
warnings
critical issues
important contextual information
system notices

A banner may contain:

icon
title
description
action
dismiss control

Banners must use semantic colors.

Do not create:

gradient banners
giant rounded banners
glass banners
decorative banner artwork
heavy shadows

Banners must communicate information immediately.

============================================================
18. BUTTONS

Create a reusable Button system.

Variants:

Primary
Secondary
Tertiary
Plain
Critical

All buttons must share the same typography system.

Control:

font family
font size
font weight
line height
height
padding
border
radius
background
text color
hover
active
focus
disabled

Do not create gradient buttons.

Do not create giant buttons.

Do not make all buttons pills.

Do not add unnecessary icons.

============================================================
19. INPUTS

Create reusable input components.

Every input must share:

font
font size
weight
height
padding
border
radius
focus
error
disabled state

Components include:

Text input
Textarea
Select
Combobox
Search
Checkbox
Radio
Switch
Date input

Do not create one-off input designs.

============================================================
20. FORMS

Forms should be compact and easy to scan.

Use:

label
input
supporting text
error state
required state

Group related fields.

Do not place every individual field inside a separate card.

============================================================
21. TABLES

Tables should be dense and highly scannable.

Use:

consistent row height
compact typography
subtle separators
clear alignment
semantic status
predictable actions

Avoid:

giant rows
excessive padding
large rounded cells
huge badges
decorative backgrounds
excessive icons

============================================================
22. FILTERS AND TOOLBARS

Toolbars should prioritize:

search
filter
sort
bulk actions
primary actions

Keep controls compact.

Do not create enormous search bars.

Do not create decorative filter cards.

============================================================
23. CARDS

Cards are grouping mechanisms.

They are NOT decoration.

Use cards when they provide meaningful separation.

Prefer:

neutral surface
subtle border
restrained radius
consistent padding
minimal elevation

Do not make every section a card.

Avoid card-inside-card-inside-card.

============================================================
24. MODALS

Modals should be functional.

Structure:

title
optional description
content
actions

Maintain clear action hierarchy.

Avoid giant modal windows.

Avoid glass effects.

Avoid decorative gradients.

============================================================
25. DRAWERS

Use drawers when contextual editing or secondary content benefits from preserving the underlying page.

Keep:

clear hierarchy
compact spacing
strong title
clear actions

Do not overuse drawers.

============================================================
26. DROPDOWNS AND POPOVERS

Use appropriate elevation.

Maintain:

compact spacing
consistent typography
clear hover
keyboard accessibility
restrained radius

No glassmorphism.

No excessive shadows.

============================================================
27. TABS

Tabs must be functional and restrained.

Active state should be clear.

Do not turn every tab into a giant pill.

Do not use gradients.

============================================================
28. BADGES

Badges communicate status.

They are not decoration.

Use semantic states:

neutral
success
warning
critical
info

Do not turn every label into a badge.

============================================================
29. EMPTY STATES

Empty states should explain:

what is missing
why it matters
what the user can do next

Use a clear action when appropriate.

Do not add giant decorative illustrations simply to fill space.

============================================================
30. LOADING

Use restrained loading states.

Prefer:

skeleton
spinner
progress

Do not create flashy animations.

============================================================
31. ERROR AND SUCCESS STATES

Errors:

clear
semantic
actionable

Success:

clear
restrained
useful

Avoid:

confetti
giant graphics
dramatic animations

unless specifically required by the product.

============================================================
32. ICONS

Use one consistent icon system.

Do not mix random icon libraries.

Do not use emojis as interface icons.

Do not add icons simply because there is empty space.

Icons should communicate meaning.

Maintain consistent:

size
stroke/fill
alignment
optical weight

============================================================
33. BORDERS

Use subtle borders.

Do not use thick borders.

Do not use colorful borders unless they carry semantic meaning.

Do not outline every element.

============================================================
34. BORDER RADIUS

Use restrained radius values from Polaris tokens where available.

Do NOT automatically use:

16px
20px
24px

on every component.

Do not make every element a pill.

Radius must be component-specific.

============================================================
35. SHADOWS

Use elevation only when it communicates layering.

Examples:

popover
dropdown
modal
floating menu

Avoid heavy card shadows.

Avoid colored shadows.

Avoid glowing shadows.

============================================================
36. ANIMATION

Animations must communicate functionality.

Appropriate uses:

opening
closing
loading
state changes
feedback
navigation

Animation must be:

subtle
short
predictable

Prohibited:

bounce
elastic animation
large scale effects
glow effects
parallax
dramatic page transitions
decorative motion

Do not animate components merely because an AI design generator would.

============================================================
37. HOVER

Hover states should be subtle.

Do not dramatically scale elements.

Do not create glow.

Do not create large shadows.

Do not transform cards unnecessarily.

============================================================
38. FOCUS

Focus states are mandatory.

They must be:

visible
accessible
consistent

Never remove focus indication without replacing it with an accessible alternative.

============================================================
39. RESPONSIVE DESIGN

Support:

desktop
tablet
mobile

Do not simply shrink desktop.

Adapt:

navigation
tables
forms
toolbars
columns
actions
spacing

Maintain the same design language at every breakpoint.

============================================================
40. ACCESSIBILITY

Mandatory:

semantic HTML
keyboard navigation
visible focus
accessible labels
sufficient contrast
logical tab order
accessible errors
accessible status communication

Do not sacrifice accessibility for visual similarity.

============================================================
41. DESIGN TOKENS

Use centralized design tokens.

Typography:

font-family
font-size
font-weight
line-height
letter-spacing

Colors:

background
surface
text
border
interactive
success
warning
critical
info

Spacing:

4px-based spacing tokens

Radius:

component-specific radius tokens

Borders:

border tokens

Elevation:

shadow tokens

Component dimensions:

button height
input height
navigation width
header height
table row height

Do not scatter values throughout the code.

============================================================
42. COMPONENT REUSE

Create reusable components.

Examples:

Button
Input
Select
Checkbox
Radio
Switch
Badge
Banner
Card
Table
Tabs
Modal
Popover
Tooltip
Dropdown
Navigation
PageHeader
Toolbar
EmptyState
LoadingState
ErrorState

Do not create visually different versions of the same component without a legitimate variant.

============================================================
43. DESIGN CONSISTENCY

Once a component has been established:

Do not change its:

font
size
weight
height
radius
padding
border
color
shadow

on another page unless it is an intentional variant.

The entire application must feel like one design system.

============================================================
44. REFERENCE SCREENSHOTS

When screenshots are provided:

Analyze them carefully.

Compare:

font family
font weight
font size
line height
letter spacing
text color
spacing
component dimensions
alignment
density
border
radius
shadow
icons
navigation
buttons
forms
tables
banners
modals

But do NOT use screenshot estimation as a replacement for official Polaris tokens.

Use screenshots primarily for visual validation.

============================================================
45. VISUAL VALIDATION LOOP

After implementing each major page:

1. Run the application.
2. Render at the reference viewport size.
3. Capture a screenshot.
4. Compare against the reference.
5. Identify differences.
6. Fix them.
7. Capture again.
8. Repeat.

Prioritize:

1. FONT FAMILY
2. FONT LOADING
3. FONT WEIGHT
4. FONT SIZE
5. LINE HEIGHT
6. LETTER SPACING
7. TEXT COLOR
8. COMPONENT DIMENSIONS
9. SPACING
10. ALIGNMENT
11. BORDERS
12. RADIUS
13. SHADOWS
14. ICONS
15. ANIMATION

IMPORTANT:

If typography is wrong, DO NOT compensate by changing spacing.

Fix the typography first.

============================================================
46. NO RANDOM MAGIC NUMBERS

Avoid:

margin: 13px
padding: 19px
font-size: 17px
border-radius: 23px

when a design token exists.

Use:

var(–space-)
var(–font-size-)
var(–radius-)
var(–color-)

Prefer system tokens over one-off values.

============================================================
47. NO DESIGN DRIFT

Do not gradually introduce new styles as development continues.

Before creating a new visual treatment:

1. Search existing components.
2. Search existing tokens.
3. Check Polaris patterns.
4. Reuse an existing component if possible.

Do not create another variation just because it looks slightly different.

============================================================
48. BRANDING

The application’s identity must remain original.

DO NOT copy:

Shopify logo
Shopify wordmark
Shopify trademarks
Shopify proprietary illustrations
Shopify marketing artwork
Shopify brand identity

You MAY follow:

typography principles
layout principles
spacing
component hierarchy
information density
interaction patterns
color-system philosophy
border treatment
radius philosophy
shadow philosophy
banner treatment
table treatment
form treatment
navigation structure
overall visual discipline

The result should feel like a product built with the same design-system philosophy, not a Shopify counterfeit.

============================================================
49. CONTENT

Do not invent unnecessary content.

Do not change content merely to improve appearance.

Do not add:

fake statistics
fake testimonials
marketing slogans
decorative descriptions
unnecessary labels

The UI should support the user’s actual task.

============================================================
50. DECISION RULE

When you are uncertain:

FIRST:
Check Polaris.

SECOND:
Check existing project tokens.

THIRD:
Check existing components.

FOURTH:
Check reference screenshots.

FIFTH:
Choose the simplest restrained solution.

NEVER choose a visually exciting solution simply because it looks impressive.

============================================================
51. FINAL ANTI-AI UI AUDIT

Before completing the page, inspect it specifically for AI-generated visual patterns.

Ask:

Does this look like a generic AI dashboard?

If YES:
REMOVE those patterns.

Are there unnecessary gradients?

REMOVE them.

Are there giant rounded cards?

REDUCE them.

Are there excessive shadows?

REMOVE them.

Is the typography oversized?

CORRECT it.

Is spacing excessively generous?

TIGHTEN it.

Are there too many colors?

SIMPLIFY them.

Are there too many pills?

REMOVE unnecessary ones.

Are there too many icons?

REMOVE unnecessary ones.

Are there decorative elements with no functional purpose?

REMOVE them.

Does every section look like a separate card?

SIMPLIFY the grouping.

Does the interface look like an AI-generated SaaS template?

REDESIGN it toward Polaris.

============================================================
52. FINAL TYPOGRAPHY AUDIT

Before shipping:

CHECK THE ACTUAL RENDERED FONT.

Do not trust the CSS declaration alone.

Check:

computed font-family
loaded font resource
computed font-size
computed font-weight
computed line-height
computed letter-spacing

Confirm that the official Polaris typography implementation is being used whenever available.

If the official font is unavailable:

Use the declared fallback honestly.

Do NOT call the fallback ShopifyInter.

Do NOT manipulate the fallback with arbitrary letter spacing or font-size changes to pretend it is ShopifyInter.

============================================================
53. FINAL QUALITY CHECK

TYPOGRAPHY:

✓ Correct Polaris typography implementation
✓ Correct font loading
✓ Correct font family
✓ Correct font weight
✓ Correct font size
✓ Correct line height
✓ Correct letter spacing
✓ Correct text color

LAYOUT:

✓ Shopify-like information density
✓ Consistent spacing
✓ Clear hierarchy
✓ Correct alignment
✓ Responsive behavior

COMPONENTS:

✓ Buttons consistent
✓ Inputs consistent
✓ Cards consistent
✓ Tables consistent
✓ Banners consistent
✓ Navigation consistent
✓ Modals consistent
✓ Badges consistent

VISUAL:

✓ No generic AI styling
✓ No unnecessary gradients
✓ No excessive shadows
✓ No excessive radius
✓ No excessive whitespace
✓ No random colors
✓ No random typography
✓ No decorative UI

INTERACTION:

✓ Hover
✓ Active
✓ Focus
✓ Disabled
✓ Loading
✓ Error
✓ Success

ACCESSIBILITY:

✓ Keyboard accessible
✓ Semantic
✓ Readable
✓ Sufficient contrast
✓ Visible focus

============================================================
54. MOST IMPORTANT RULE

DO NOT GENERATE A GENERIC “NICE LOOKING” UI.

DO NOT GENERATE AN AI UI.

DO NOT CREATE YOUR OWN DESIGN LANGUAGE.

DO NOT GUESS THE FONT.

DO NOT PRETEND INTER IS SHOPIFYINTER.

DO NOT DOWNLOAD RANDOM UNOFFICIAL FONT FILES.

USE THE OFFICIAL POLARIS TYPOGRAPHY IMPLEMENTATION WHENEVER POSSIBLE.

USE OFFICIAL POLARIS TOKENS WHENEVER POSSIBLE.

USE REUSABLE COMPONENTS.

USE THE 4PX SPACING FOUNDATION.

MAINTAIN SHOPIFY-LIKE INFORMATION DENSITY.

KEEP THE UI RESTRAINED.

KEEP THE UI FUNCTIONAL.

KEEP THE UI CONSISTENT.

THE FONT IS A FIRST-CLASS REQUIREMENT.

THE TYPOGRAPHY IS A FIRST-CLASS REQUIREMENT.

THE DESIGN SYSTEM IS THE SOURCE OF TRUTH.

WHEN IN DOUBT:

DO NOT INVENT.

CHECK POLARIS.

REUSE THE SYSTEM.

SIMPLIFY.

============================================================
END OF MASTER UI INSTRUCTION
