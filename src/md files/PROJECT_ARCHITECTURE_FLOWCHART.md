# BinThere - Project Architecture Flowchart

Complete visual representation of component relationships and data flow.

---

## 📊 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          AWS BACKEND LAYER                          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐         │
│  │  DynamoDB    │◄───│  Lambda      │◄───│  API Gateway │         │
│  │  Tables      │    │  Functions   │    │  REST API    │         │
│  └──────────────┘    └──────────────┘    └──────┬───────┘         │
└────────────────────────────────────────────────────┼────────────────┘
                                                     │
                                                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        SERVICES LAYER                                │
│                     /services/api.ts                                 │
│  ┌────────────────────────────────────────────────────────┐         │
│  │ • fetchDustbins()      • deleteDustbins()             │         │
│  │ • addDustbin()         • fetchAnalyticsData()         │         │
│  │ • updateDustbin()      • fetchNotifications()         │         │
│  │ • refreshDustbinData()                                │         │
│  └────────────────────────────────────────────────────────┘         │
└────────────────────────────────────┬────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      FRONTEND APPLICATION                            │
│                         /App.tsx                                     │
│                                                                      │
│  ┌──────────────────┐              ┌──────────────────┐            │
│  │  Landing Page    │─────────────►│ Dustbins Overview│            │
│  └──────────────────┘              └──────────────────┘            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Component Hierarchy Tree

```
/App.tsx (Root)
│
├─► /components/landing-page.tsx
│   │
│   ├─► /components/tips-carousel.tsx
│   │   │
│   │   └─► /components/tip-card.tsx
│   │       └─► UI: Card
│   │
│   └─► UI: Button (Navigate to Dashboard)
│
│
└─► /components/dustbins-overview.tsx
    │
    ├─► /components/header.tsx
    │   │
    │   ├─► UI: Badge (Notifications count)
    │   ├─► UI: Popover (Notifications dropdown)
    │   └─► UI: Button (Refresh)
    │
    ├─► UI: Input (Search bar)
    │
    ├─► /components/dustbin-card.tsx (8x cards in grid)
    │   │
    │   ├─► UI: Card
    │   ├─► UI: Badge (Critical alert)
    │   ├─► UI: Progress (Fill level bar)
    │   └─► Icons: Battery, Wrench, Clock, MapPin, AlertCircle
    │
    ├─► /components/dustbin-detail-modal.tsx
    │   │
    │   ├─► UI: Dialog
    │   └─► Animated vertical progress bars (wet/dry waste)
    │
    ├─► /components/analytics-graph.tsx
    │   │
    │   ├─► UI: Card
    │   ├─► UI: Select (Period dropdown)
    │   ├─► UI: Button (Add/Remove/Edit)
    │   ├─► Recharts: LineChart, Line, XAxis, YAxis, etc.
    │   └─► Legend with color-coded indicators
    │
    └─► /components/manage-dustbin-dialog.tsx
        │
        ├─► UI: Dialog
        ├─► UI: Input (Location input)
        ├─► UI: Checkbox (Multi-select for removal)
        └─► UI: Button (Submit/Cancel)
```

---

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    1. APPLICATION INITIALIZATION                     │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                            ┌───────────────┐
                            │   App.tsx     │
                            │   (Entry)     │
                            └───────┬───────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
        ┌─────────────────────┐       ┌─────────────────────┐
        │  landing-page.tsx   │       │ dustbins-overview   │
        │  (View 1)           │       │  (View 2)           │
        └─────────────────────┘       └──────────┬──────────┘
                                                  │
┌─────────────────────────────────────────────────────────────────────┐
│                    2. DUSTBINS OVERVIEW LOADS                        │
└─────────────────────────────────────────────────────────────────────┘
                                                  │
                                                  ▼
                                      ┌───────────────────────┐
                                      │  useState Hook        │
                                      │  • dustbins[]         │
                                      │  • searchQuery        │
                                      │  • selectedDustbin    │
                                      │  • notifications      │
                                      └───────────┬───────────┘
                                                  │
                                                  ▼
                                      ┌───────────────────────┐
                                      │  Mock Data            │
                                      │  (mockDustbins array) │
                                      └───────────┬───────────┘
                                                  │
┌─────────────────────────────────────────────────────────────────────┐
│                    3. COMPONENT RENDERING                            │
└─────────────────────────────────────────────────────────────────────┘
                                                  │
                        ┌─────────────────────────┼─────────────────────────┐
                        │                         │                         │
                        ▼                         ▼                         ▼
              ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
              │  Header          │    │  Dustbin Cards   │    │  Analytics Graph │
              │  • Notifications │    │  (Grid of 8)     │    │  • Line Chart    │
              │  • Refresh Btn   │    │  • Battery       │    │  • Period Select │
              └────────┬─────────┘    │  • Maintenance   │    │  • CRUD Buttons  │
                       │              └────────┬─────────┘    └────────┬─────────┘
                       │                       │                        │
┌─────────────────────────────────────────────────────────────────────┐
│                    4. USER INTERACTIONS                              │
└─────────────────────────────────────────────────────────────────────┘
                       │                       │                        │
                       ▼                       ▼                        ▼
          ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
          │  Refresh Click   │    │  Card Click      │    │  Add/Edit/Remove │
          │  └─► Update all  │    │  └─► Open modal  │    │  └─► Open dialog│
          │      timestamps  │    │      with detail │    │      for CRUD    │
          └──────────────────┘    └──────────────────┘    └──────────────────┘
                       │                       │                        │
                       │                       ▼                        │
                       │          ┌──────────────────────┐              │
                       │          │ dustbin-detail-modal │              │
                       │          │ • Wet/Dry progress   │              │
                       │          │ • Animated bars      │              │
                       │          └──────────────────────┘              │
                       │                                                 │
                       ├─────────────────────────────────────────────────┤
                       │                                                 │
                       ▼                                                 ▼
          ┌──────────────────────────┐                  ┌──────────────────────────┐
          │  Notification Click      │                  │ manage-dustbin-dialog    │
          │  • View critical alerts  │                  │ • Add new dustbin        │
          │  • Dismiss notifications │                  │ • Edit location          │
          │  • Clear all             │                  │ • Remove dustbins        │
          └──────────────────────────┘                  └──────────┬───────────────┘
                                                                    │
┌─────────────────────────────────────────────────────────────────────┐
│                    5. STATE UPDATES                                  │
└─────────────────────────────────────────────────────────────────────┘
                                                                    │
                                                                    ▼
                                                    ┌────────────────────────┐
                                                    │  setDustbins()         │
                                                    │  • Add new dustbin     │
                                                    │  • Update location     │
                                                    │  • Remove & renumber   │
                                                    └────────────────────────┘
                                                                    │
                                                                    ▼
                                                    ┌────────────────────────┐
                                                    │  Re-render components  │
                                                    │  • Updated cards       │
                                                    │  • Updated analytics   │
                                                    │  • Updated notifications│
                                                    └────────────────────────┘
```

---

## 🔌 API Integration Flow (Future)

```
┌──────────────────────────────────────────────────────────────────────┐
│                     FRONTEND COMPONENT LAYER                         │
└──────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                        ┌───────────────────────┐
                        │  User Action Trigger  │
                        │  • Page Load          │
                        │  • Refresh Button     │
                        │  • Add/Edit/Delete    │
                        └───────────┬───────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    /services/api.ts (API CLIENT)                     │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Function Calls:                                                     │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ • fetchDustbins()          → GET /dustbins                 │    │
│  │ • addDustbin(location)     → POST /dustbins                │    │
│  │ • updateDustbin(id, loc)   → PUT /dustbins/{id}            │    │
│  │ • deleteDustbins(ids)      → DELETE /dustbins              │    │
│  │ • fetchAnalyticsData()     → GET /analytics?period=...     │    │
│  │ • fetchNotifications()     → GET /notifications            │    │
│  │ • refreshDustbinData()     → POST /refresh                 │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  apiFetch() Helper:                                                  │
│  • Adds API key to headers                                          │
│  • Handles CORS                                                     │
│  • Error handling                                                   │
│  • JSON parsing                                                     │
└──────────────────────────────────┬───────────────────────────────────┘
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        AWS API GATEWAY                               │
│                    https://{api-id}.execute-api...                   │
└──────────────────────────────────┬───────────────────────────────────┘
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│                       AWS LAMBDA FUNCTIONS                           │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │  GetDustbins     │  │  AddDustbin      │  │  UpdateDustbin   │  │
│  │  Lambda          │  │  Lambda          │  │  Lambda          │  │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘  │
│           │                     │                      │             │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │  DeleteDustbins  │  │  GetAnalytics    │  │  GetNotifications│  │
│  │  Lambda          │  │  Lambda          │  │  Lambda          │  │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘  │
│           │                     │                      │             │
└───────────┼─────────────────────┼──────────────────────┼─────────────┘
            │                     │                      │
            └─────────────────────┼──────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         AWS DYNAMODB                                 │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Tables:                                                             │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ • BinThere-Dustbins           (Current dustbin states)     │    │
│  │ • BinThere-AnalyticsHistory   (Historical fill counts)     │    │
│  │ • BinThere-IoTSensorLogs      (Raw sensor data)            │    │
│  │ • BinThere-SystemConfig       (Settings & counters)        │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 📦 Component Dependency Map

### Landing Page Components

```
landing-page.tsx
├── uses: tips-carousel.tsx
│   └── uses: tip-card.tsx
│       └── uses: UI/card.tsx
├── uses: UI/button.tsx
└── emits: onNavigate() → triggers navigation to dustbins-overview
```

### Dustbins Overview Components

```
dustbins-overview.tsx
├── imports: DustbinData type from dustbin-card.tsx
├── imports: toast from sonner
├── state:
│   ├── dustbins: DustbinData[]
│   ├── searchQuery: string
│   ├── selectedGraphDustbinId: string | null
│   ├── selectedWetWasteFillLevel: number
│   ├── selectedDryWasteFillLevel: number
│   ├── manageDialogMode: 'add' | 'remove' | 'edit' | null
│   └── dismissedNotifications: Set<string>
│
├── renders:
│   ├── header.tsx
│   │   ├── uses: UI/badge.tsx (notifications count)
│   │   ├── uses: UI/popover.tsx (notifications dropdown)
│   │   ├── uses: UI/button.tsx (refresh button)
│   │   ├── uses: lucide-react icons (Bell, RefreshCw, X, Trash2)
│   │   ├── receives: notifications[] prop
│   │   │   └── generated from critical dustbins (>= 80%)
│   │   ├── emits: onRefresh() → updates lastUpdated timestamps
│   │   ├── emits: onDismissNotification(id) → removes notification
│   │   └── emits: onClearAllNotifications() → clears all
│   │
│   ├── UI/input.tsx (Search bar)
│   │   └── filters dustbins by name, location, or ID
│   │
│   ├── dustbin-card.tsx (x8 cards)
│   │   ├── receives: dustbin prop (DustbinData)
│   │   ├── receives: onClick prop → opens detail modal
│   │   ├── uses: UI/card.tsx
│   │   ├── uses: UI/badge.tsx (critical alert)
│   │   ├── uses: UI/progress.tsx (fill level bar)
│   │   ├── uses: lucide-react icons:
│   │   │   ├── Battery (battery level)
│   │   │   ├── Wrench (maintenance)
│   │   │   ├── Clock (last updated)
│   │   │   ├── MapPin (location)
│   │   │   └── AlertCircle (critical alert)
│   │   └── displays:
│   │       ├── Battery level (color-coded)
│   │       ├── Last maintenance check
│   │       ├── Overall fill level
│   │       └── Last updated timestamp
│   │
│   ├── dustbin-detail-modal.tsx
│   │   ├── uses: UI/dialog.tsx
│   │   ├── receives: isOpen prop
│   │   ├── receives: dustbinName prop
│   │   ├── receives: wetWasteFillLevel prop
│   │   ├── receives: dryWasteFillLevel prop
│   │   ├── emits: onClose() → closes modal
│   │   └── displays: Animated vertical progress bars
│   │
│   ├── analytics-graph.tsx
│   │   ├── uses: UI/card.tsx
│   │   ├── uses: UI/select.tsx (period dropdown)
│   │   ├── uses: UI/button.tsx (Add/Remove/Edit)
│   │   ├── uses: recharts library:
│   │   │   ├── LineChart
│   │   │   ├── Line (wet waste - green)
│   │   │   ├── Line (dry waste - orange)
│   │   │   ├── XAxis, YAxis, CartesianGrid
│   │   │   ├── Tooltip
│   │   │   └── ResponsiveContainer
│   │   ├── receives: dustbins[] prop
│   │   ├── receives: selectedDustbinId prop
│   │   ├── emits: onOpenAddDialog()
│   │   ├── emits: onOpenRemoveDialog()
│   │   ├── emits: onOpenEditDialog()
│   │   └── displays: Dual-line chart with legend
│   │
│   └── manage-dustbin-dialog.tsx
│       ├── uses: UI/dialog.tsx
│       ├── uses: UI/input.tsx (location input)
│       ├── uses: UI/checkbox.tsx (multi-select for remove)
│       ├── uses: UI/button.tsx (submit/cancel)
│       ├── receives: mode prop ('add' | 'remove' | 'edit')
│       ├── receives: isOpen prop
│       ├── receives: dustbins[] prop (for remove mode)
│       ├── receives: editDustbinId prop (for edit mode)
│       ├── emits: onClose()
│       ├── emits: onAdd(location)
│       ├── emits: onRemove(selectedIds)
│       └── emits: onEdit(id, newLocation)
```

---

## 🎨 UI Component Library Usage

### Shadcn/UI Components Used

```
/components/ui/
├── badge.tsx
│   └── Used in: header.tsx, dustbin-card.tsx
│       ├── Notification count badge
│       └── Critical alert badge
│
├── button.tsx
│   └── Used in: landing-page.tsx, header.tsx, analytics-graph.tsx, manage-dustbin-dialog.tsx
│       ├── Navigation button
│       ├── Refresh button
│       ├── CRUD buttons (Add/Remove/Edit)
│       └── Dialog action buttons
│
├── card.tsx
│   └── Used in: tip-card.tsx, dustbin-card.tsx, analytics-graph.tsx
│       ├── Tip cards on landing page
│       ├── Dustbin cards (main cards)
│       └── Analytics graph container
│
├── checkbox.tsx
│   └── Used in: manage-dustbin-dialog.tsx
│       └── Multi-select dustbins for removal
│
├── dialog.tsx
│   └── Used in: dustbin-detail-modal.tsx, manage-dustbin-dialog.tsx
│       ├── Dustbin detail modal
│       └── Add/Edit/Remove dialogs
│
├── input.tsx
│   └── Used in: dustbins-overview.tsx, manage-dustbin-dialog.tsx
│       ├── Search bar
│       └── Location input field
│
├── popover.tsx
│   └── Used in: header.tsx
│       └── Notifications dropdown
│
├── progress.tsx
│   └── Used in: dustbin-card.tsx, dustbin-detail-modal.tsx
│       ├── Horizontal fill level bars
│       └── Vertical wet/dry waste bars
│
├── select.tsx
│   └── Used in: analytics-graph.tsx
│       └── Period selector dropdown
│
└── sonner.tsx (Toast)
    └── Used in: App.tsx
        └── Global toast notifications
```

### Lucide React Icons Used

```
lucide-react
├── Bell → header.tsx (notifications)
├── RefreshCw → header.tsx (refresh button)
├── X → header.tsx (dismiss notification)
├── Trash2 → header.tsx (clear all notifications)
├── Battery → dustbin-card.tsx (battery level)
├── Wrench → dustbin-card.tsx (maintenance)
├── Clock → dustbin-card.tsx (last updated)
├── MapPin → dustbin-card.tsx (location)
├── AlertCircle → dustbin-card.tsx (critical alert)
├── Search → dustbins-overview.tsx (search bar)
├── ArrowLeft → dustbins-overview.tsx (back button)
├── Plus → analytics-graph.tsx (add button)
├── Minus → analytics-graph.tsx (remove button)
├── Pencil → analytics-graph.tsx (edit button)
├── TrendingUp → analytics-graph.tsx (graph indicator)
└── Leaf, Recycle, Droplets, etc. → landing-page.tsx, tip-card.tsx
```

---

## 🗂️ Type Definitions Flow

```
/types/api.types.ts
│
├── Exported Types:
│   ├── Dustbin
│   │   └── Used in:
│   │       ├── /services/api.ts (API responses)
│   │       ├── /components/dustbin-card.tsx (DustbinData)
│   │       └── /components/dustbins-overview.tsx (state)
│   │
│   ├── Notification
│   │   └── Used in:
│   │       └── /components/header.tsx (notifications prop)
│   │
│   ├── AnalyticsDataPoint
│   │   └── Used in:
│   │       └── /components/analytics-graph.tsx (chart data)
│   │
│   ├── ApiResponse<T>
│   │   └── Used in:
│   │       └── /services/api.ts (generic responses)
│   │
│   └── Various Request/Response Types
│       └── Used in:
│           └── /services/api.ts (function signatures)
```

---

## 🔐 State Management Flow

```
App.tsx
└── currentView: 'landing' | 'dustbins'
    ├── Controls which page is displayed
    └── Updated by navigation handlers

dustbins-overview.tsx (Main State Container)
├── dustbins: DustbinData[]
│   ├── Source: mockDustbins (will be from API)
│   ├── Updated by:
│   │   ├── handleAddDustbin()
│   │   ├── handleRemoveDustbins()
│   │   ├── handleEditDustbinLocation()
│   │   └── handleRefresh()
│   └── Passed to:
│       ├── dustbin-card.tsx (individual cards)
│       ├── analytics-graph.tsx (for chart data)
│       └── manage-dustbin-dialog.tsx (for editing)
│
├── searchQuery: string
│   ├── Updated by: Search input onChange
│   └── Filters: dustbins array for display
│
├── selectedGraphDustbinId: string | null
│   ├── Updated by: Analytics graph dustbin selector
│   └── Controls: Which dustbin's data is shown in graph
│
├── selectedWetWasteFillLevel: number
│   ├── Updated by: Clicking dustbin card
│   └── Passed to: dustbin-detail-modal.tsx
│
├── selectedDryWasteFillLevel: number
│   ├── Updated by: Clicking dustbin card
│   └── Passed to: dustbin-detail-modal.tsx
│
├── manageDialogMode: 'add' | 'remove' | 'edit' | null
│   ├── Updated by: CRUD button clicks
│   └── Controls: Which dialog mode is active
│
└── dismissedNotifications: Set<string>
    ├── Updated by: Dismiss notification actions
    └── Filters: notifications array for display
```

---

## 📡 Future API Integration Points

```
Component                        API Function Called                  Endpoint
─────────────────────────────────────────────────────────────────────────────
dustbins-overview.tsx (mount)    fetchDustbins()                     GET /dustbins
header.tsx (mount)               fetchNotifications()                GET /notifications
header.tsx (refresh click)       refreshDustbinData()                POST /refresh
analytics-graph.tsx (mount)      fetchAnalyticsData(period)          GET /analytics
manage-dustbin-dialog (add)      addDustbin(location)                POST /dustbins
manage-dustbin-dialog (edit)     updateDustbin(id, location)         PUT /dustbins/{id}
manage-dustbin-dialog (remove)   deleteDustbins([ids])               DELETE /dustbins
```

---

## 📁 File Import/Export Relationships

```
App.tsx
├── imports: LandingPage from './components/landing-page'
├── imports: DustbinsOverview from './components/dustbins-overview'
└── imports: Toaster from './components/ui/sonner'

landing-page.tsx
├── imports: TipsCarousel from './tips-carousel'
├── imports: Button from './ui/button'
└── exports: default LandingPage

tips-carousel.tsx
├── imports: TipCard from './tip-card'
├── imports: various icons from 'lucide-react'
└── exports: default TipsCarousel

tip-card.tsx
├── imports: Card from './ui/card'
└── exports: default TipCard

dustbins-overview.tsx
├── imports: Header from './header'
├── imports: DustbinCard, DustbinData from './dustbin-card'
├── imports: AnalyticsGraph from './analytics-graph'
├── imports: ManageDustbinDialog from './manage-dustbin-dialog'
├── imports: Input from './ui/input'
├── imports: toast from 'sonner@2.0.3'
└── exports: default DustbinsOverview

header.tsx
├── imports: Badge from './ui/badge'
├── imports: Button from './ui/button'
├── imports: Popover from './ui/popover'
├── imports: various icons from 'lucide-react'
└── exports: default Header

dustbin-card.tsx
├── imports: Card from './ui/card'
├── imports: Progress from './ui/progress'
├── imports: Badge from './ui/badge'
├── imports: various icons from 'lucide-react'
├── exports: interface DustbinData
└── exports: default DustbinCard

dustbin-detail-modal.tsx
├── imports: Dialog from './ui/dialog'
└── exports: default DustbinDetailModal

analytics-graph.tsx
├── imports: Card from './ui/card'
├── imports: Select from './ui/select'
├── imports: Button from './ui/button'
├── imports: recharts components
└── exports: default AnalyticsGraph

manage-dustbin-dialog.tsx
├── imports: Dialog from './ui/dialog'
├── imports: Input from './ui/input'
├── imports: Checkbox from './ui/checkbox'
├── imports: Button from './ui/button'
└── exports: default ManageDustbinDialog

services/api.ts
├── imports: types from '../types/api.types'
├── exports: interface Dustbin
├── exports: various API functions
└── exports: default API client object

types/api.types.ts
├── exports: interface Dustbin
├── exports: interface Notification
├── exports: interface AnalyticsDataPoint
└── exports: various Request/Response types
```

---

## 🎯 Event Flow Chart

```
USER ACTIONS                    COMPONENT HANDLERS                   STATE CHANGES
─────────────────────────────────────────────────────────────────────────────────

[Landing Page]
Click "View Dashboard"  ────►  onNavigate()  ────►  setCurrentView('dustbins')
                                                                      │
                                                                      ▼
[Dashboard Loads]  ◄────────────────────────────────────  dustbins-overview.tsx
                                                                      │
                                                                      ▼
                                                          Render all components
                                                                      │
        ┌─────────────────────────────────────────────────────────┬─┘
        │                                                           │
        ▼                                                           ▼
[Search Input]                                          [Click Dustbin Card]
Type query  ────►  onChange  ────►  setSearchQuery()   Click  ────►  onClick()
                        │                                               │
                        ▼                                               ▼
                Filter dustbins                            setSelectedWetWasteFillLevel()
                Re-render cards                            setSelectedDryWasteFillLevel()
                                                                       │
                                                                       ▼
                                                           Open dustbin-detail-modal
                                                                       │
[Refresh Button]                                                       │
Click  ────►  onRefresh()  ────►  Update lastUpdated  ◄───────────────┘
                                  for all dustbins
                                  Re-render all cards

[Notification Bell]
Click  ────►  Open popover  ────►  Display notifications
                                            │
                                            ├─► Click X  ────►  onDismissNotification(id)
                                            │                           │
                                            │                           ▼
                                            │                   Add to dismissedNotifications Set
                                            │                   Re-render notifications
                                            │
                                            └─► Click Clear All  ────►  onClearAllNotifications()
                                                                                │
                                                                                ▼
                                                                        Clear all notifications

[Analytics Graph]
Click Add  ────►  onOpenAddDialog()  ────►  setManageDialogMode('add')
                                                     │
                                                     ▼
                                            Open manage-dustbin-dialog
                                                     │
                                         Enter location, click Submit
                                                     │
                                                     ▼
                                            handleAddDustbin(location)
                                                     │
                                                     ▼
                                            Create new dustbin object
                                            Add to dustbins array
                                            Show success toast
                                            Re-render all components

Click Remove  ────►  onOpenRemoveDialog()  ────►  setManageDialogMode('remove')
                                                           │
                                                           ▼
                                                  Open dialog with checkboxes
                                                           │
                                                Select dustbins, click Remove
                                                           │
                                                           ▼
                                                handleRemoveDustbins(selectedIds)
                                                           │
                                                           ▼
                                                  Filter out selected dustbins
                                                  Renumber remaining dustbins
                                                  Update dustbins array
                                                  Show success toast
                                                  Re-render all components

Click Edit  ────►  onOpenEditDialog()  ────►  setManageDialogMode('edit')
                                                       │
                                                       ▼
                                              Open dialog with location input
                                                       │
                                              Enter new location, click Update
                                                       │
                                                       ▼
                                          handleEditDustbinLocation(id, newLocation)
                                                       │
                                                       ▼
                                              Update dustbin location in array
                                              Show success toast
                                              Re-render all components
```

---

## 📊 Component Size & Complexity

```
Component                        Lines of Code    Complexity    Dependencies
──────────────────────────────────────────────────────────────────────────────
App.tsx                          ~30              Low           2 components
landing-page.tsx                 ~150             Low           1 component, UI
tips-carousel.tsx                ~120             Medium        1 component
tip-card.tsx                     ~40              Low           UI only
dustbins-overview.tsx            ~400             High          6 components, logic
header.tsx                       ~200             Medium        UI, notifications
dustbin-card.tsx                 ~120             Medium        UI, formatting
dustbin-detail-modal.tsx         ~150             Medium        UI, animations
analytics-graph.tsx              ~300             High          Recharts, UI
manage-dustbin-dialog.tsx        ~250             High          Forms, validation
services/api.ts                  ~350             Medium        Types, fetch
types/api.types.ts               ~150             Low           Type definitions
```

---

## 🔄 Re-render Triggers

```
State Change                      Components Re-rendered
──────────────────────────────────────────────────────────────────
setCurrentView()                  App.tsx (switches view)
setDustbins()                     All dustbin-card.tsx, analytics-graph.tsx, header.tsx
setSearchQuery()                  Filtered dustbin-card.tsx only
setSelectedGraphDustbinId()       analytics-graph.tsx only
setManageDialogOpen()             manage-dustbin-dialog.tsx only
setDismissedNotifications()       header.tsx (popover content) only
```

---

**Last Updated:** October 27, 2025  
**Total Components:** 13 main components + 40+ UI components  
**Total Lines:** ~2,500+ lines of code
