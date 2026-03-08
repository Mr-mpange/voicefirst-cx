

# AI Voice Customer Care Platform — Full Build Plan

## Overview
Build all 5 pages with shared layout, dark theme, and navigation. All data is mock/static with simulated animations.

## Architecture

### Routes & Layout
- `/` — Customer Voice Assistant
- `/dashboard` — Agent Dashboard
- `/admin` — Admin Analytics
- `/knowledge-base` — Knowledge Base Management
- `/system-status` — System Status

Shared `DashboardLayout` component with sidebar navigation wraps all pages except `/` (voice assistant is full-screen standalone).

### Design System Changes (`index.css`)
Override CSS variables for dark enterprise theme:
- Background: `#0f1729`, Cards: `#1e293b`, Primary: `#3b82f6`
- Add custom keyframes: `pulse-ring` (mic button), `waveform` (bars), `thinking` (AI processing dots)

### Tailwind Config
Add custom animations: `pulse-ring`, `waveform-1` through `waveform-5` (staggered bar animations), `float`

---

## Shared Components

1. **`VoiceWaveform`** — 5-7 animated vertical bars with staggered heights, accepts `active` prop to toggle animation
2. **`MetricCard`** — Icon, label, value, optional trend indicator and sparkline
3. **`StatusBadge`** — Colored dot + text badge (Listening/Processing/Speaking/Healthy/Warning/Critical)
4. **`CallCard`** — Caller name, duration, AI confidence score, status badge, action buttons
5. **`TranscriptFeed`** — Scrollable list of messages with speaker labels (AI/Customer) and timestamps
6. **`AIAvatar`** — Circular avatar with animated ring that changes color based on AI state
7. **`DashboardLayout`** — Sidebar + header + main content area using SidebarProvider

---

## Page Details

### 1. Customer Voice Assistant (`/`)
Full-screen dark page, centered layout:
- `AIAvatar` at top with state-dependent animation
- `StatusBadge` showing current state (cycles through Idle → Listening → Processing → Speaking on click)
- Large circular mic button with `pulse-ring` animation when active
- `VoiceWaveform` below mic, animates during Listening/Speaking states
- Live transcription area with fade-in messages
- Call timer (top-right), "End Call" and "Connect to Human" buttons at bottom
- State machine managed with `useState` + `useEffect` timers to simulate the flow

### 2. Agent Dashboard (`/dashboard`)
Three-column layout inside `DashboardLayout`:
- **Top stats bar**: 4 `MetricCard`s (Active: 12, AI-Handled: 847, Waiting: 3, Escalated: 2)
- **Center**: List of `CallCard`s with expandable detail showing `TranscriptFeed` and `VoiceWaveform`
- **Right panel**: Selected caller details — contact info, call history, AI suggestion panel with recommended responses
- Mock data array of 6-8 calls with various statuses

### 3. Admin Analytics (`/admin`)
Inside `DashboardLayout`:
- **KPI row**: 4 `MetricCard`s (Total Calls, AI Resolution Rate, Avg Duration, CSAT)
- **Charts** (Recharts): Line chart (calls/hour), Bar chart (AI vs Human weekly), Area chart (latency), Pie chart (call categories)
- AI training section with accuracy trend link

### 4. Knowledge Base (`/knowledge-base`)
Inside `DashboardLayout`:
- Search bar + category filter tabs
- Card grid of FAQ entries with title, category badge, preview text, edit/delete buttons
- "Add Entry" button opens Dialog with form fields (title, category select, answer textarea)
- Document upload drop zone (visual only)
- Mock data: 8-10 FAQ entries across categories

### 5. System Status (`/system-status`)
Inside `DashboardLayout`:
- Grid of `MetricCard`s with `StatusBadge`: Voice Latency (23ms/Healthy), AI Load (67%/Healthy), Active Users (1,247), API Usage (84%), Uptime (99.97%)
- Each card includes a small sparkline (Recharts `LineChart` mini)
- Simulated real-time updates with `setInterval`

---

## File Structure
```
src/
  components/
    layout/DashboardLayout.tsx
    layout/AppSidebar.tsx
    voice/VoiceWaveform.tsx
    voice/AIAvatar.tsx
    voice/TranscriptFeed.tsx
    dashboard/CallCard.tsx
    dashboard/MetricCard.tsx
    dashboard/StatusBadge.tsx
  pages/
    Index.tsx          (Voice Assistant)
    Dashboard.tsx
    Admin.tsx
    KnowledgeBase.tsx
    SystemStatus.tsx
  lib/
    mockData.ts        (all mock data)
```

## Implementation Order
1. Design system (CSS variables, animations, tailwind config)
2. Shared components (MetricCard, StatusBadge, VoiceWaveform, AIAvatar, etc.)
3. DashboardLayout + AppSidebar with navigation
4. All 5 pages
5. Route registration in App.tsx

