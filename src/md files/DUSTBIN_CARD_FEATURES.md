# Dustbin Card Features Documentation

## 📋 Overview

Each dustbin card displays comprehensive information about a smart waste bin, including real-time fill levels, battery status, and maintenance history.

---

## 🎨 Visual Layout

### Normal State (Fill Level < 80%)

```
┌────────────────────────────────────────────────┐
│ 🔋 85%                                         │ ← Battery Level (top-left)
│                                                │
│  Dustbin #001                                  │
│  📍 Central Park North                         │
│                                                │
│  Overall Fill Level              65% 🟢        │
│  ████████████████░░░░░░░░                     │
│                                                │
│  ─────────────────────────────────────────    │
│  🕐 Updated 5 mins ago                         │
│  🔧 Maintenance: 3 days ago                    │
└────────────────────────────────────────────────┘
```

### Critical State (Fill Level ≥ 80%)

```
┌────────────────────────────────────────────────┐
│🔋 85%                                      ❗  │ ← Battery slides left, Alert badge on right
│                           ⚠️                   │ ← Alert icon (top-right)
│  Dustbin #001                                  │
│  📍 Central Park North                         │
│                                                │
│  Overall Fill Level              85% 🔴        │
│  ████████████████████████████░░               │
│                                                │
│  ─────────────────────────────────────────    │
│  🕐 Updated 5 mins ago                         │
│  🔧 Maintenance: 3 days ago                    │
└────────────────────────────────────────────────┘
```

---

## 🔋 Battery Level Indicator

### Position
- **Normal:** Top-left corner at `left: 1rem` (16px)
- **Critical:** Top-left corner at `left: -0.5rem` (-8px)
- **Transition:** Smooth 300ms slide animation

### Color Coding
| Battery % | Color | Background |
|-----------|-------|------------|
| 0-20% | 🔴 Red | Light red background |
| 21-40% | 🟡 Yellow | Light yellow background |
| 41-100% | 🟢 Green | Light green background |

### Format
- Icon: Battery symbol
- Text: Percentage (e.g., "85%")
- Size: Small text (text-xs)

---

## ❗ Critical Alert Badge

### Position
- Top-right corner at `top: -0.5rem`, `right: -0.5rem`

### Display Conditions
- Shows when `wetWasteFillLevel >= 80%` OR `dryWasteFillLevel >= 80%`

### Visual
- Red circular badge with white "!" exclamation mark
- Pulsing animation to draw attention
- Companion alert icon (⚠️) in card header

---

## 🔧 Last Maintenance Check

### Position
- Bottom section of card, below "Updated" timestamp

### Format
- Icon: Wrench symbol
- Text: "Maintenance: {relative time}"
- Examples:
  - "Maintenance: 1 day ago"
  - "Maintenance: 3 days ago"
  - "Maintenance: 2 weeks ago"

### Data Source
- **Field:** `lastMaintenance` from API
- **Type:** String (relative time or ISO date)
- **Optional:** Only displays if `lastMaintenance` field exists

---

## 📊 Fill Level Display

### Color Thresholds
| Fill % | Color | Status |
|--------|-------|--------|
| 0-59% | 🟢 Green | Normal |
| 60-79% | 🟡 Yellow | Warning |
| 80-100% | 🔴 Red | Critical |

### Components
1. Percentage text (right-aligned)
2. Progress bar (gradient fill)
3. Color-coded overlay

---

## 🔄 Auto-Adjust Behavior

### Battery Level Positioning

**When Critical Alert Appears:**
```css
/* Battery slides from right to left */
transition: left 300ms ease-in-out;

/* Normal state */
left: 1rem;  /* 16px from left edge */

/* Critical state */
left: -0.5rem;  /* -8px, partially outside card */
```

**Why it slides:**
- Prevents overlap with critical alert badge
- Creates visual separation between indicators
- Smooth animation draws attention to both indicators

---

## 📡 API Integration

### Required Fields from Database

```typescript
interface DustbinData {
  id: string;
  name: string;
  location: string;
  overallFillLevel: number;
  wetWasteFillLevel: number;
  dryWasteFillLevel: number;
  lastUpdated: string;
  batteryLevel?: number;        // ← Battery indicator
  lastMaintenance?: string;     // ← Maintenance check
  criticalTimestamp?: number;   // ← Critical alert timing
}
```

### Sample API Response

```json
{
  "dustbins": [
    {
      "id": "001",
      "name": "Dustbin #001",
      "location": "Central Park North",
      "overallFillLevel": 85,
      "wetWasteFillLevel": 78,
      "dryWasteFillLevel": 92,
      "lastUpdated": "2025-10-27T10:35:00Z",
      "batteryLevel": 85,
      "lastMaintenance": "2025-10-24T08:00:00Z",
      "criticalTimestamp": 1729854900000
    }
  ]
}
```

---

## 🎯 Implementation Details

### Component: `dustbin-card.tsx`

**Key Features:**
1. **Dynamic Battery Position:**
   ```tsx
   className={`absolute -top-2 transition-all duration-300 ${
     hasAlert ? '-left-2' : 'left-4'
   }`}
   ```

2. **Battery Color Logic:**
   ```tsx
   function getBatteryColor(percentage: number): string {
     if (percentage <= 20) return 'text-red-600';
     if (percentage <= 40) return 'text-yellow-600';
     return 'text-green-600';
   }
   ```

3. **Conditional Rendering:**
   ```tsx
   {dustbin.lastMaintenance && (
     <div className="flex items-center gap-1 text-gray-500">
       <Wrench className="w-4 h-4" />
       <span className="text-sm">Maintenance: {dustbin.lastMaintenance}</span>
     </div>
   )}
   ```

---

## 🎨 Tailwind Classes Used

### Battery Indicator
- `absolute -top-2` - Positioned above card
- `transition-all duration-300` - Smooth animation
- `px-2 py-1 rounded-full` - Pill-shaped badge
- `border border-gray-200 shadow-sm` - Subtle borders/shadow

### Color Variants
- **Green:** `text-green-600`, `bg-green-100`
- **Yellow:** `text-yellow-600`, `bg-yellow-100`
- **Red:** `text-red-600`, `bg-red-100`

### Icons
- Battery: `<Battery className="w-3 h-3" />`
- Wrench: `<Wrench className="w-4 h-4" />`
- Clock: `<Clock className="w-4 h-4" />`
- MapPin: `<MapPin className="w-4 h-4" />`

---

## 🔄 Refresh Behavior

When the "Refresh" button in the header is clicked:
1. API fetches latest dustbin data
2. Battery levels update to current values
3. Last maintenance dates update
4. Battery indicator re-evaluates color
5. Position re-adjusts if critical status changed

---

## 📱 Responsive Design

- Cards use flexbox grid layout
- Battery indicator scales proportionally
- Text remains readable on mobile
- Touch targets are adequately sized

---

## ♿ Accessibility

- Color-coded indicators have text labels
- Icons have semantic meaning
- Hover states provide visual feedback
- Click targets are large enough (min 44x44px)

---

## 🧪 Testing Scenarios

### Scenario 1: Low Battery + Critical Fill
- Battery: 15% (red)
- Fill: 92% (red)
- Expected: Battery at left edge, critical badge visible, both red

### Scenario 2: Good Battery + Normal Fill
- Battery: 85% (green)
- Fill: 45% (green)
- Expected: Battery at normal position (left: 1rem), no alert badge

### Scenario 3: Medium Battery + Warning Fill
- Battery: 35% (yellow)
- Fill: 65% (yellow)
- Expected: Battery at normal position, no critical alert

---

**Last Updated:** October 27, 2025  
**Component:** `/components/dustbin-card.tsx`  
**API Service:** `/services/api.ts`
