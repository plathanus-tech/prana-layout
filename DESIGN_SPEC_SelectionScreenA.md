# SelectionScreenA — Design Specification
**Padrão A da Jornada de Agendamento (Beneficiário)**

---

## Overview

Mobile service selection screen (375×812px) with minimalist design philosophy:
- No card borders, only subtle dividers
- Pill-shaped buttons for interaction
- Lateral accent bar for selection feedback
- Responsive grid layouts

---

## Viewport
- **Width**: 375px
- **Height**: 812px
- **Background**: #FAFAFA (`var(--color-bg-default)`)

---

## Section 1: Header (0–60px)

### Header Bar
- **Dimensions**: 375×60px
- **Y Position**: 0
- **Background**: #B25557 (`var(--color-brand-500)`)
- **Purpose**: Contains logo/branding

### Logo Text
- **Content**: "Prana"
- **Font**: Roboto, 700 (Bold)
- **Size**: 20px
- **Color**: #FFFFFF (white)
- **Alignment**: Center horizontal
- **Y Position**: 20px (centered vertically within 60px header)

---

## Section 2: Event Banner (60–220px)

### Banner Container
- **Width**: 375px
- **Height**: ~160px
- **Y Position**: 60px
- **Background**: #FFFFFF (white)
- **Padding**: 24px horizontal
- **Border Bottom**: 2px solid #D4B5B8 (`var(--color-brand-200)`)

### 2.1 Event Tag
- **Content**: "EVENTO"
- **Font**: Roboto, 600 (SemiBold)
- **Size**: 10px
- **Color**: #B25557 (`var(--color-brand-500)`)
- **Transform**: uppercase
- **Letter Spacing**: 1.2px
- **Y Offset from banner top**: 16px

### 2.2 Event Title
- **Content**: "Semana do Bem-Estar"
- **Font**: Raleway, 600 (SemiBold)
- **Size**: 28px
- **Color**: #1A1A1A (near-black text)
- **Line Height**: 1.2
- **Y Offset from banner top**: 40px
- **Max Width**: 327px (375 - 48px padding)

### 2.3 Event Metadata
- **Content**: 
  - "10 a 14 de abril de 2026"
  - "Sala de Treinamentos - Bloco A"
- **Font**: Roboto, 400 (Regular)
- **Size**: 12px
- **Color**: #666666 (`var(--color-text-tertiary)`)
- **Line Height**: 16px
- **Y Offset from banner top**: 80px
- **Display**: Two lines with flexbox gap 8px

---

## Section 3: Service Selection (220–650px)

### Section Container
- **Width**: 375px
- **Y Position**: 220px
- **Display**: Flex column
- **Gap**: 16px
- **Padding**: 0 (cards span full width)

### 3.1 Section Title
- **Content**: "Escolha o serviço" (or "Escolha seus serviços" if multiService)
- **Font**: Roboto, 600 (SemiBold)
- **Size**: 10px
- **Color**: #999999 (`var(--color-text-tertiary)`)
- **Transform**: uppercase
- **Letter Spacing**: 1.2px
- **X Padding**: 24px
- **Y Offset from section top**: 0

### 3.2 Service Cards (List of 4)

Each service card has the following structure:

#### Card Wrapper
- **Width**: 375px
- **Background**: transparent (when unselected)
- **Border Bottom**: 1px solid #E2E0DF (`var(--color-border-subtle)`)
- **Border Radius**: 0
- **Transition**: background 150ms ease

**First card only**: `border-top: 1px solid #E2E0DF`

**On hover** (not disabled): `background: #F5F5F5 (var(--color-bg-subtle))`

**When selected** (`.cardSelected`):
- **Background**: #F8F1F1 (`var(--color-bg-brand)`)
- **Padding Left**: Add 3px
- **Border Left**: 3px solid #D4B5B8 (`var(--color-brand-400)`)

**When disabled** (`.cardDisabled`):
- **Opacity**: 0.4
- **Cursor**: not-allowed

#### Card Header (Clickable)
- **Width**: 100%
- **Display**: Flex row
- **Align Items**: center
- **Gap**: 16px
- **Padding**: 16px 12px
- **Background**: none
- **Border**: none
- **Cursor**: pointer

#### Icon (Circular Badge)
- **Width**: 36px
- **Height**: 36px
- **Border Radius**: 50% (circle)
- **Background**: #F5F5F5 (`var(--color-bg-subtle)`)
- **Display**: Flex center
- **Icon Size**: 18px
- **Color**: #999999 (`var(--color-text-tertiary)`)
- **Flex Shrink**: 0
- **Transition**: background 150ms, color 150ms

**When selected** (`.cardIconSelected`):
- **Background**: #F1E3E5 (`var(--color-brand-100)`)
- **Color**: #B25557 (`var(--color-brand-600)`)

#### Card Info (Text Container)
- **Flex**: 1
- **Display**: Flex column
- **Gap**: 2px
- **Min Width**: 0 (text truncation)

##### Service Name
- **Font**: Roboto, 600 (SemiBold)
- **Size**: 16px
- **Color**: #1A1A1A (`var(--color-text-primary)`)

##### Service Meta (Duration + Description)
- **Font**: Roboto, 400 (Regular)
- **Size**: 12px
- **Color**: #666666 (`var(--color-text-secondary)`)
- **Display**: Flex row, gap 8px

##### Service Status (Shown if complete)
- **Font**: Roboto, 500 (Medium)
- **Size**: 12px
- **Color**: #B25557 (`var(--color-brand-600)`)
- **Display**: Flex row, gap 4px
- **Margin Top**: 2px

#### Selector (Radio/Checkbox)
- **Flex Shrink**: 0

##### Radio Button (Single Service)
- **Width**: 20px
- **Height**: 20px
- **Border Radius**: 50%
- **Border**: 2px solid #CCC (`var(--color-border-muted)`)
- **Display**: Flex center
- **Transition**: border-color 150ms, background 150ms

**When selected**:
- **Border Color**: #B25557 (`var(--color-brand-500)`)
- **Background**: #B25557

**Inner dot** (when selected):
- **Width**: 8px
- **Height**: 8px
- **Border Radius**: 50%
- **Background**: white
- **Opacity**: 1

##### Checkbox (Multi Service)
- **Width**: 20px
- **Height**: 20px
- **Border Radius**: 4px (`var(--radius-xs)`)
- **Border**: 2px solid #CCC
- **Display**: Flex center
- **Transition**: border-color 150ms, background 150ms

**When selected**:
- **Border Color**: #B25557
- **Background**: #B25557

**Checkmark** (when selected):
- **Font**: system, 12px
- **Content**: "✓"
- **Color**: white
- **Weight**: 700 (Bold)

#### Card Body (Expandable)
- **Display**: None (until card selected)
- **Padding**: 0 12px 16px
- **Flex Direction**: column
- **Gap**: 16px

---

## Section 4: Waitlist or Scheduler (Conditional, inside Card Body)

### If Waitlist (for Reflexologia)
- **Display**: Flex column
- **Gap**: 8px
- **Padding Top**: 16px

#### Feedback Message
- **Component**: Feedback (type="warning")
- **Title**: "Horários esgotados"
- **Message**: "Todos os horários disponíveis para este serviço estão ocupados."

#### Waitlist Button
- **Text**: "Entrar na lista de espera"
- **Variant**: secondary
- **Size**: sm

### If Scheduler (Day + Time Selection)
- **Display**: Flex column
- **Gap**: 16px
- **Padding Top**: 8px

#### Day Selection Picker
- **Label**: "Escolha o dia"
- **Font**: Roboto, 600 (SemiBold)
- **Size**: 10px
- **Color**: #999999 (tertiary)
- **Transform**: uppercase

##### Day Strip
- **Display**: Flex row
- **Gap**: 4px
- **Overflow X**: auto (scrollable)
- **Padding Bottom**: 4px
- **Scrollbar**: hidden

##### Day Button
- **Flex Shrink**: 0
- **Display**: Flex column
- **Align**: center
- **Gap**: 1px
- **Padding**: 4px 8px
- **Min Width**: 48px
- **Border Radius**: 100px (pill)
- **Border**: none
- **Background**: #F5F5F5 (`var(--color-bg-subtle)`)
- **Cursor**: pointer
- **Transition**: background 150ms, color 150ms

**On hover**:
- **Background**: #F1E3E5 (`var(--color-brand-100)`)

**When active** (`.dayBtnActive`):
- **Background**: #B25557 (`var(--color-brand-500)`)

###### Day Parts
- **Name** (e.g., "Seg"): 8px font, uppercase, tertiary color
- **Number** (e.g., "13"): 16px font (lg), semibold, primary color
- **Month** (e.g., "abr"): 8px font, tertiary color

**Active state**: All text becomes white

#### Time Selection Grid
- **Display**: Grid
- **Columns**: 4 columns
- **Gap**: 4px
- **Visible only when day selected**

##### Time Button
- **Padding**: 8px 4px
- **Border Radius**: 100px (pill)
- **Border**: none
- **Background**: #F5F5F5 (`var(--color-bg-subtle)`)
- **Font**: Roboto, 400, 12px
- **Color**: #1A1A1A (primary)
- **Cursor**: pointer
- **Transition**: background 150ms
- **Text Align**: center

**On hover** (if available):
- **Background**: #F1E3E5 (`var(--color-brand-100)`)

**When active** (`.timeBtnActive`):
- **Background**: #B25557 (`var(--color-brand-500)`)
- **Color**: white
- **Font Weight**: 600 (semibold)

**On hover** (when active):
- **Background**: #A44A4C (darker brand) !important

**When unavailable** (`.timeBtnUnavailable`):
- **Background**: transparent
- **Color**: #CCCCCC (`var(--color-text-disabled)`)
- **Cursor**: not-allowed
- **Text Decoration**: line-through

---

## Section 5: CTA Bar (750–812px)

### CTA Container
- **Width**: 375px
- **Height**: 62px
- **Y Position**: 750px
- **Padding**: 24px 24px 12px
- **Background**: transparent
- **Border**: none
- **Display**: Flex justify-center

### CTA Inner
- **Max Width**: 600px
- **Width**: 100%
- **Display**: Flex

### CTA Button
- **Variant**: primary
- **Size**: lg
- **Disabled**: true if not all questions answered
- **Text**: "Agendar {serviço/serviços}"

#### Button Styling
- **Padding**: 12px 24px
- **Border Radius**: 8px (`var(--radius-sm)`)
- **Font**: Roboto, 600, 16px
- **Background**: #B25557 (`var(--color-brand-500)`) when enabled
- **Background**: #E0D5D6 (muted) when disabled
- **Color**: white
- **Cursor**: pointer (when enabled) / not-allowed (when disabled)
- **Transition**: background 150ms, color 150ms
- **Width**: 100%

**On hover** (when enabled):
- **Background**: #A44A4C (darker brand)

---

## Colors Reference

| Property | Hex | CSS Variable | Usage |
|---|---|---|---|
| Brand Primary | #B25557 | `--color-brand-500` | Headers, selected states, CTAs |
| Brand Light | #F1E3E5 | `--color-brand-100` | Hover states, icon backgrounds |
| Brand 200 | #D4B5B8 | `--color-brand-200` | Borders, accent lines |
| Brand BG | #F8F1F1 | `--color-bg-brand` | Selected card background |
| Background | #FAFAFA | `--color-bg-default` | Page background |
| Subtle BG | #F5F5F5 | `--color-bg-subtle` | Hover states, badges |
| Border Subtle | #E2E0DF | `--color-border-subtle` | Card dividers |
| Border Muted | #CCC | `--color-border-muted` | Form inputs, radio borders |
| Text Primary | #1A1A1A | `--color-text-primary` | Headings, service names |
| Text Secondary | #666666 | `--color-text-secondary` | Descriptions, metadata |
| Text Tertiary | #999999 | `--color-text-tertiary` | Labels, tags |
| Text Disabled | #CCCCCC | `--color-text-disabled` | Unavailable times |
| White | #FFFFFF | — | Logo, checkmarks |

---

## Typography

| Use Case | Family | Weight | Size | Line Height |
|---|---|---|---|---|
| Page Title | Raleway | 600 | 28px | 1.2 |
| Section Header | Roboto | 600 | 10px | — |
| Service Name | Roboto | 600 | 16px | — |
| Service Meta | Roboto | 400 | 12px | — |
| Button Text | Roboto | 600 | 16px | — |
| Tag/Label | Roboto | 600 | 10px | — |
| Body Text | Roboto | 400 | 14px | 1.5 |
| Small Text | Roboto | 400 | 12px | 1.33 |

---

## Spacing System

| Value | CSS Variable | Usage |
|---|---|---|
| 4px | `--spacing-xs` | Minimal gaps |
| 8px | `--spacing-sm` | Small gaps, compact spacing |
| 12px | `--spacing-md` | Medium gaps, padding |
| 16px | `--spacing-lg` | Standard gaps, padding |
| 24px | `--spacing-xl` | Large gaps, section padding |
| 32px | `--spacing-2xl` | Extra large spacing |

---

## Animations & Transitions

| Property | Duration | Easing | Usage |
|---|---|---|---|
| Background | 150ms | ease | Hover states |
| Color | 150ms | ease | Text color changes |
| Border | 150ms | ease | Border color changes |
| Scale | 150ms | ease | Button interactions |

---

## Responsive Behavior

### Mobile (375px - Current Design)
- Single column layout
- Full-width cards
- Touch-friendly padding (24px horizontal)
- Pill buttons with larger tap targets (48px min-width)

### Desktop (via `viewport` prop = 'desktop')
- Identical layout (single column maintained for focus)
- Could extend to multiple columns if needed
- Same typography and spacing

---

## Service Data Structure

```typescript
interface Service {
  id: string;
  name: string;
  duration: number;           // minutes
  description: string;
  Icon: React.ComponentType;  // lucide-react icon
  waitlistOnly: boolean;
}

const SERVICES = [
  { id: 'massage',     name: 'Quick Massage',      duration: 15, Icon: Sparkles,  description: 'Massagem nas costas e pescoço', waitlistOnly: false },
  { id: 'manicure',    name: 'Manicure',           duration: 30, Icon: Scissors,  description: 'Cuidado completo para as unhas', waitlistOnly: false },
  { id: 'reflexology', name: 'Reflexologia Podal', duration: 20, Icon: Activity,  description: 'Massagem nos pontos de pressão dos pés', waitlistOnly: true },
  { id: 'meditation',  name: 'Meditação Guiada',   duration: 20, Icon: Wind,      description: 'Sessão de relaxamento e atenção plena', waitlistOnly: false },
];
```

---

## Implementation Notes

1. **Day Generation**: Generate working days (Mon-Fri) starting from April 11, 2026
2. **Time Slots**: Base slots are fixed (09:00–15:30, 30-min intervals), availability randomized per day/service
3. **Validation**: 
   - Single service: Must select service + day + time
   - Multi service: Can add to waitlist without schedule
4. **State Management**: Track selected services and their schedules separately
5. **Accessibility**: 
   - Radio/checkbox labels associated with service names
   - Keyboard navigation for day/time selection
   - ARIA labels for icon-only content

---

**Last Updated**: 2026-04-20  
**Component**: SelectionScreenA (Padrão A)  
**Status**: Production-Ready
