# Design Guidelines: Family Expense Management SaaS

## Design Approach

**System Selected**: Modern SaaS Dashboard System (inspired by Linear, Notion, and Expensify)

**Rationale**: Expense tracking is a utility-focused application requiring efficiency, clarity, and data-dense layouts. The design prioritizes usability, quick data entry, and scannable information hierarchies over visual experimentation.

**Core Principles**:
- Data clarity over decoration
- Immediate affordance (users instantly understand actions)
- Consistent information hierarchy
- Efficient workflows with minimal clicks

---

## Typography

**Font Families**:
- Primary: Inter (Google Fonts) - body text, labels, data
- Display: Inter Bold - headings, section titles, numbers
- Monospace: JetBrains Mono - currency amounts, dates

**Type Scale**:
- Page Headers: text-3xl font-bold (36px)
- Section Headers: text-xl font-semibold (20px)
- Card Titles: text-lg font-medium (18px)
- Body Text: text-base (16px)
- Labels/Captions: text-sm (14px)
- Data Tables: text-sm (14px)
- Large Numbers (dashboard totals): text-4xl font-bold (48px)

**Hierarchy Rules**:
- Currency amounts always use monospace and bold weight
- Category labels use medium weight with subtle letter-spacing
- Timestamps use regular weight in caption size

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, 12, 16, 24**
- Component padding: p-4, p-6, p-8
- Section spacing: space-y-6, space-y-8
- Card gaps: gap-4, gap-6
- Form fields: space-y-4

**Grid Structure**:
- Dashboard: 12-column grid (grid-cols-12)
- Admin view: 3-column stats cards (grid-cols-3 on lg)
- Expense list: Single column with responsive table
- Mobile: All content stacks to single column

**Container Widths**:
- Application shell: max-w-7xl mx-auto
- Form containers: max-w-2xl
- Modals: max-w-lg

---

## Component Library

### Navigation
**Top Navigation Bar**:
- Fixed position with subtle border-bottom
- Logo/app name left-aligned
- User avatar and role badge right-aligned
- Navigation links center (Dashboard, Expenses, Reports for users; +Admin for admins)
- Height: h-16, padding px-6

**Sidebar (Admin View)**:
- Fixed left sidebar (w-64)
- Family member list with avatars and quick expense totals
- Expandable/collapsible on mobile
- Sticky navigation: Dashboard, All Expenses, Reports, Settings

### Dashboard Components

**Stat Cards** (Admin & User Views):
- Elevated card with rounded-lg and p-6
- Icon in circle (w-12 h-12) top-left
- Large number display (text-4xl font-bold)
- Label below (text-sm opacity-75)
- Trend indicator (arrow + percentage)
- Grid layout: 3 cards on desktop, stack on mobile

**Expense List Table**:
- Clean table with hover states on rows
- Columns: Date | Category | Description | Amount | Actions
- Sticky header (sticky top-16)
- Alternating row backgrounds for scannability
- Amount column right-aligned in monospace
- Action buttons (Edit/Delete) appear on row hover

**Chart Component**:
- Monthly expense trends: Line chart
- Category breakdown: Donut chart
- Use Chart.js or Recharts library
- Container: rounded-lg border p-6
- Chart height: h-80

### Forms

**Add/Edit Expense Form**:
- Modal overlay (fixed inset-0 with backdrop blur)
- Form container: max-w-lg rounded-xl p-8
- Field spacing: space-y-4
- Labels: font-medium mb-2
- Inputs: rounded-md border px-4 py-3
- Category dropdown with icons
- Date picker with calendar icon
- Amount input with currency symbol prefix
- Description textarea (h-24)
- Button group: Cancel (secondary) + Save (primary) right-aligned

**Input Components**:
- Text inputs: border rounded-md focus:ring-2
- Select dropdowns: Custom styled with chevron icon
- Date picker: Calendar icon right-side
- Currency input: Dollar sign prefix, monospace font

### Cards & Containers

**Expense Card** (Mobile View):
- rounded-lg border p-4
- Category badge with icon top-left
- Amount bold and large top-right
- Description and date below
- Swipe actions for Edit/Delete

**Category Badge**:
- Inline-flex items with rounded-full px-3 py-1
- Icon (w-4 h-4) + label
- Border variant with transparent background

### Buttons & Actions

**Primary Button**:
- rounded-md px-6 py-3 font-medium
- Examples: "Add Expense", "Save Changes", "Generate Report"

**Secondary Button**:
- Border variant, same sizing as primary
- Examples: "Cancel", "Filter", "Export"

**Icon Buttons**:
- Square (w-10 h-10), rounded-md
- Used for Edit, Delete, More actions
- Appear on hover in tables

### Data Visualization

**Monthly Summary**:
- Bar chart comparing months (h-64)
- Tooltip on hover showing exact amounts
- Grid lines with low opacity

**Category Breakdown**:
- Donut chart with legend
- Percentage labels
- Interactive segments

---

## Page-Specific Layouts

### User Dashboard
- 3 stat cards: Total Spent | This Month | Last Month
- Monthly trend chart (full width)
- Recent expenses table (10 rows)
- "Add Expense" floating action button (bottom-right)

### Admin Dashboard
- 4 stat cards: Total Family | This Month | Most Active User | Top Category
- Family member cards grid showing individual totals
- Consolidated expense chart
- All expenses table with user filter dropdown

### Expense Management Page
- Filter bar: Date range | Category dropdown | Search
- Table view (desktop) / Card view (mobile)
- Pagination at bottom
- Bulk actions: Export, Delete selected

### Reports Page
- Date range selector prominent at top
- Tab navigation: Overview | By Category | By User (admin only)
- Downloadable charts and tables
- Export button (PDF/CSV)

---

## Responsive Behavior

**Breakpoints**:
- Mobile: < 768px (md)
- Tablet: 768px - 1024px (lg)
- Desktop: > 1024px

**Mobile Adaptations**:
- Hide sidebar, show hamburger menu
- Stack stat cards vertically
- Transform tables to card lists
- Floating "Add" button (bottom-right fixed)
- Simplified navigation drawer

**Tablet**:
- 2-column stat card grid
- Condensed sidebar (icons only)
- Maintain table layouts with horizontal scroll

---

## Icons

**Library**: Heroicons (outline and solid variants via CDN)

**Usage**:
- Category icons: Shopping cart, Home, Car, Entertainment, etc.
- Action icons: Plus, Pencil, Trash, Download, Filter
- Status icons: Check circle, X circle, Arrow trending
- Navigation icons: Chart bar, Table cells, Cog

---

## Interactions

**Hover States**:
- Table rows: Subtle background change, show action buttons
- Stat cards: Slight elevation increase
- Buttons: Standard brightness/opacity shifts

**Focus States**:
- Form inputs: Ring with 2px width
- Keyboard navigation: Clear focus indicators

**Loading States**:
- Skeleton screens for data tables
- Spinner for form submissions
- Progress bar for report generation

---

## Role-Based UI Differences

**Admin View**:
- Access to all family members' data
- Sidebar with family member list
- Consolidated reporting
- User management section

**Family Member View**:
- Personal expenses only
- Simplified navigation
- Personal stats and trends
- Cannot see other members' details

---

## Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation for all functions
- Screen reader announcements for data updates
- Sufficient contrast ratios (WCAG AA minimum)
- Form error messages clearly associated with fields