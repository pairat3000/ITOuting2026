# Handoff: Trip Finder — IT Outing 2026

## Overview
**Trip Finder (หาที่พัก)** is a desktop-first web tool that helps an IT team (group of 24 people) find and compare accommodation for their 2026 outing. It pulls accommodation + price data (originally from a Google Sheet) and lets the user **filter** by province / type / date, **sort**, **search**, and **select** a place to see full details and an estimated total cost for the group.

This bundle contains two design references:
1. `Trip Finder.html` — the **applied product redesign** (interactive prototype of the real page).
2. `IT Outing 2026 — Design System.html` — the **design system spec** (tokens, type, components, dark mode, mobile patterns). Use it as the source of truth for styling.

## About the Design Files
The files in this bundle are **design references created in HTML** — prototypes that show the intended look and behavior. They are **not production code to copy directly**. The task is to **recreate these designs in the target codebase** using its established framework and patterns (React, Vue, Svelte, etc.). If no frontend environment exists yet, pick the most appropriate framework for the project and implement the designs there. The vanilla-JS state logic in `Trip Finder.html` is a reference for *behavior*, not an architecture to mirror.

The original production app reads from a **Google Sheet** ("ชีตของ Golf"). The prototype uses 9 hard-coded placeholder records (`DATA` array in `Trip Finder.html`); wire the real data source in its place.

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, radii, shadows, and interactions are all specified below and in the design-system file. Recreate pixel-faithfully using the codebase's component library, then swap placeholder data/images for real ones.

---

## Design Tokens

### Color
| Token | Hex | Use |
|---|---|---|
| `--primary` / Lagoon Teal | `#0F766E` | primary actions, price, links, selected state |
| `--primary-deep` | `#134E4A` | button hard-shadow, price card bg, hero gradients |
| `--accent` / Sunbeam | `#FBBF24` | refresh button, brand chip, accent highlights |
| `--accent` shadow | `#F59E0B` | hard shadow under accent button |
| `--pop` / Coral Pop | `#FB7367` | playful pop, "clear all", chip shadow, favorite icon |

**Teal scale:** 50 `#F0FDFA` · 100 `#CCFBF1` · 200 `#99F6E4` · 300 `#5EEAD4` · 400 `#2DD4BF` · 500 `#14B8A6` · 600 `#0D9488` · 700 `#0F766E` · 800 `#115E59` · 900 `#134E4A`

**Neutrals (cool, faintly teal-tinted):** ink `#0E1F1C` · n-900 `#12241F` · n-700 `#374843` · n-500 `#69807A` · n-400 `#8FA39D` · n-300 `#C5D3CF` · n-200 `#DDE8E5` · n-100 `#EEF4F2` · n-50 `#F6FAF9` · white `#FFFFFF`

**Semantic:** success `#0F9D58` · warning `#F59E0B` · error `#E23B4E` · info `#0EA5E9`

**Status badge palettes (light):**
- `ว่าง` (available): bg `#E7F7EF`, text `#0A7A44`
- `เหลือน้อย` (low): bg `#FEF3C7`, text `#92660B`
- `เต็มแล้ว` (full): bg `#FDE7EA`, text `#B01E2E`

### Dark theme (token overrides)
Applied via `html[data-theme="dark"]`, persisted in `localStorage` key `itouting-theme` (`"dark"` | `"light"`).
```
--ink:#E8F1EE; --white:#13261F (surfaces/cards); --n-50:#0A1714 (page bg);
--n-100:#1A342E; --n-200:#244840 (borders); --n-300:#2E564E; --n-400:#6E8881;
--n-500:#93AAA3; --n-700:#C2D4CE; --n-900:#E8F1EE; --primary:#19C2B0 (lightened for contrast);
```
Status badges get darker variants in dark mode (see CSS `html[data-theme="dark"] .b-ok/.b-warn/.b-err`).

### Typography
- **Display / headings / prices:** `Kanit` (Google Font) — weights 400/500/600/700/800
- **UI / body / forms:** `Prompt` (Google Font) — weights 300/400/500/600/700
- **Mono (labels, code, numeric tags):** `JetBrains Mono` — 400/500/600

| Role | Font | Size | Weight | Notes |
|---|---|---|---|---|
| Page title (topbar) | Kanit | 24px | 700 | line-height 1.3 |
| Section / detail name | Kanit | 22–25px | 600–700 | line-height 1.3 |
| Card title | Kanit | 16px | 600 | line-height 1.32 |
| Price (large) | Kanit | 18–30px | 700–800 | |
| Body | Prompt | 14px | 400 | line-height 1.5–1.6 |
| UI labels (filter) | JetBrains Mono | 11px | 500 | uppercase, letter-spacing .5px |
| Caption | Prompt | 12–12.5px | 400 | color n-500 |

> ⚠️ Thai text needs generous line-height (≥1.3 on display sizes) to avoid tone-mark clipping. Don't tighten below this.

### Radius
`--r-xs 6` · `--r-sm 10` · `--r-md 14` · `--r-lg 20` · `--r-xl 28` · `--r-full 999px`. Aesthetic is **chunky / playful** — cards use `--r-lg`/`--r-xl`, pills/buttons use `--r-full`.

### Spacing — 4px base
4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96.

### Elevation (teal-tinted soft shadows)
- `--sh-sm`: `0 1px 2px rgba(15,40,36,.06), 0 1px 1px rgba(15,40,36,.04)`
- `--sh-md`: `0 4px 14px rgba(15,60,52,.10), 0 1px 3px rgba(15,60,52,.06)`
- `--sh-lg`: `0 18px 40px rgba(15,60,52,.14), 0 4px 10px rgba(15,60,52,.08)`
- **Playful "hard" button shadow:** primary `0 4px 0 #134E4A`, accent `0 4px 0 #F59E0B`. On `:active` the button translates down 3px and the shadow shrinks to `0 1px 0` (press-in effect).

---

## Screens / Views

### Screen: Trip Finder (single page, master–detail)
**Purpose:** Browse, filter and pick accommodation; see cost estimate for the group.

**Page layout (desktop-first, max-width 1320px, 24px side padding):**
1. **Topbar** (flex row): brand lockup (left) + theme toggle (right).
2. **Filter bar** (sticky, `top:14px`, `z-index:30`): `title | fields | refresh`.
3. **Chips row**: active filter chips + "ล้างทั้งหมด".
4. **Main grid**: `grid-template-columns: minmax(380px,440px) 1fr; gap:22px; align-items:start;`
   - Left: scrollable accommodation **list** (`max-height: calc(100vh - 80px); overflow-y:auto`).
   - Right: sticky **detail panel** (`position:sticky; top:90px`).
5. **Footer**: source note (dashed top border).
- **Responsive:** below 980px the grid collapses to one column; detail panel becomes static; list max-height removed.

#### Component: Brand lockup
- Chip: 46×46, `--r-md`, bg `--accent`, text `--primary-deep`, Kanit 800/21px, `transform:rotate(-6deg)`, shadow `3px 3px 0 #FB7367`, content `IT`.
- Title: Kanit 700/24px "หาที่พักให้ทริปนี้ ·" (the `·` is colored `--primary`). Subtitle: Prompt 12.5px n-500 "IT Outing 2026 · Trip Finder · กลุ่ม 24 คน".

#### Component: Theme toggle (`.tt`)
Pill, border `2px --n-200`, bg `--white`, Prompt 600/13px, padding 9×15, `--r-full`. Label toggles `🌙 Dark` / `☀️ Light`. Hover: border `--teal-300`.

#### Component: Filter bar (`.filterbar`) — KEY COMPONENT
- Container: bg white, border `1px --n-200`, `--r-xl`, padding 16×18, shadow `--sh-md`, **sticky**.
- Layout: `display:flex; gap:14px; align-items:center; flex-wrap:nowrap;` → `[.fb-title (flex-shrink:0)] [.fb-fields (flex:1, flex-wrap:wrap)] [#refreshBtn (flex-shrink:0)]`.
- **fb-title**: 34×34 accent dot (`--r-md`, rotate -5deg, coral hard shadow, glyph `≡`) + `b` "กรองที่พัก" (Kanit 600/16, `white-space:nowrap`) + `span` live count "พบ N แห่ง" (12px n-500).
- **Fields** (`.field` = label above control):
  - Label: Mono 11px/500, uppercase, n-500.
  - **Select pill** (`.select select`): appearance none, Prompt 14/500, border `2px --n-200`, `--r-full`, padding `10px 36px 10px 15px`, min-width 124. Caret `▼` absolute right, `--primary`. Focus: border `--primary` + ring `0 0 0 4px --teal-100`.
  - **Search** (`.search input`): leading `⌕` icon, padding-left 38, `--r-full`, `flex:1; min-width:150`.
  - Fields: จังหวัด, ประเภท, วันที่, เรียงตาม, ค้นหา (last field flex-grows).
- **Refresh button** (`.btn.btn-accent`): "⟳ รีเฟรช". On click → spinner + "กำลังโหลด..." for ~850ms (simulated fetch), then re-render.

#### Component: Filter chips (`.chip-pill`)
Inline-flex, 13px/500, padding 6×12, `--r-full`, bg `--teal-50`, text `--teal-800`, border `--teal-200`. Trailing `✕` (opacity .55 → 1 on hover) removes that filter. "ล้างทั้งหมด" (`.chip-clear`): Prompt 500/13, color `--pop`, resets all filters + sort.

#### Component: Accommodation list card (`.lc`) — clickable
- `display:flex; gap:13px; padding:11px;` border `1.5px --n-200`, `--r-lg`, shadow `--sh-sm`, cursor pointer.
- Hover: border `--teal-300`, `translateY(-2px)`, shadow `--sh-md`.
- **Selected** (`.sel`): border `--primary`, ring `0 0 0 3px --teal-100` + `--sh-md`.
- **Thumb** (84px wide, `--r-md`): diagonal teal stripe placeholder (45° `repeating-linear-gradient` using a per-id hue + `--teal-50`) with a centered emoji glyph. **Replace with real photo.**
- **Body**: title (Kanit 600/16, lh 1.32) + status badge (top-right) · province line "📍 {prov} · {type}" (12px n-500, nowrap+ellipsis) · meta row "👥 {cap} คน/หลัง", "🚗 {dist} กม.", star rating (`★` × rating, color `--sun-500`) · foot: price (Kanit 700/18 `--primary` + "/ คืน") and "฿{price×2×rooms} โดยประมาณ".

#### Component: Detail panel (`.detail`)
Sticky white card, `--r-xl`, shadow `--sh-md`, min-height 540.
- **Empty state** (`.d-empty`, shown when nothing selected): 90px dashed teal icon tile (rotate -4deg, glyph 🗺️) + Kanit 600/22 "เลือกสถานที่จากรายการ" + n-500 helper text.
- **Hero** (230px): stripe placeholder + emoji (54px), bottom gradient overlay, top-left status badge(s), top-right favorite button (40px circle, coral heart), bottom-left name (Kanit 700/25, white, text-shadow) + "📍 {prov} · {type}" + stars.
- **Body**:
  - **Meta pills** (`.metapill`): "👥 {cap} คน / หลัง", "🚗 {dist} กม. จากจุดนัดพบ", "🏠 ใช้ {rooms} หลัง สำหรับ 24 คน".
  - **เกี่ยวกับที่พัก**: description paragraph (14px n-700, lh 1.6).
  - **สิ่งอำนวยความสะดวก**: 2-col grid; each amenity = emoji + label; amenities the place lacks render greyed + strike-through (`.a.off`). Full set: WiFi 📶, สระว่ายน้ำ 🏊, ที่จอดรถ 🅿️, ครัว 🍳, แอร์ ❄️, คาราโอเกะ 🎤, จุดปิ้งย่าง 🔥, ห้องประชุม 📊, อาหารเช้า 🥐.
  - **ที่ตั้ง**: 120px CSS grid-pattern map placeholder with 📍 pin + "{prov} · {dist} กม." label. **Replace with real map embed.**
  - **Price card** (`.pcard`, bg `--primary-deep`, white text): rows → "ราคาต่อหลัง / คืน", "จำนวนหลัง (24 ÷ {cap})", "จำนวนคืน"; divider; **total** "รวมโดยประมาณ" with the math caption `{price}×{rooms}×{nights}` and big value (Kanit 800/30).
  - **Actions**: "♡ บันทึก" (ghost) + "เลือกที่พักนี้ →" (primary). When status = full → primary disabled + label "เต็มแล้ว".

---

## Interactions & Behavior
- **Filtering** (province / type / date): updates list, count ("พบ N แห่ง"), and chips immediately. Date filter matches places whose `dates[]` include the selection.
- **Sorting**: `ต้นฉบับ` (original order) · `ระยะทาง น้อย→มาก` · `ความจุ มาก→น้อย` · `ราคา น้อย→มาก` · `ชื่อ ก→ฮ` (Thai locale compare).
- **Search**: case-insensitive substring on name; live on input.
- **Select card**: highlights card, renders detail panel; selection persists across filter/sort (but the card may leave the filtered list).
- **Refresh**: spinner + 4 skeleton rows (`shimmer` animation, 1.4s loop) for ~850ms, then re-render. In production, trigger the real data refetch here.
- **Clear filters**: removes individual filter (chip `✕`) or all + resets sort (`ล้างทั้งหมด`).
- **Theme toggle**: flips `data-theme` on `<html>`, persists to `localStorage`.
- **Button press**: hard-shadow buttons depress on `:active` (translateY 3px, shadow → `0 1px 0`).
- **Transitions**: most are `.15–.16s`; theme switch animates `background`/`color` over `.25s`.

## State Management
Single state object: `{ prov, type, date, sort, q, sel, loading }`.
- `prov/type/date/q` ('' = no filter) → drive `results()` (filter then sort).
- `sort` → ordering key.
- `sel` → selected accommodation id (or null) → detail panel.
- `loading` → shows skeletons.
- **Derived:** `rooms(cap) = ceil(24 / cap)`; estimate `= price × nights × rooms` (nights default **2**).
- **Data fetching:** replace the static `DATA` array with the Google Sheet fetch. Each record needs: `id, name, prov, type, cap (capacity/unit), dist (km), price (per night), rating (1–5), status ('ok'|'warn'|'full'), amen[] (keys), dates[], desc, photo`.

## Responsive Behavior
Desktop-first. ≤980px: single column, detail panel static below the list. The design-system file (`#mobile` section) shows the intended **mobile pattern**: filter bar collapses to a horizontal-scroll pill row with a "ตัวกรอง" button (count badge) that opens a **bottom sheet** containing all filters + an "apply" button.

## Assets
- **Fonts:** Kanit, Prompt, JetBrains Mono (Google Fonts) — already linked; install/self-host in production.
- **Images:** none real. All thumbnails/hero use CSS diagonal-stripe placeholders with emoji glyphs — **replace with real accommodation photos** (16:9 hero, square-ish thumbs).
- **Map:** CSS grid placeholder — replace with a real map (Google Maps / Leaflet) using each place's coordinates.
- **Icons:** currently emoji (matches the playful brand). Swap for an icon set if the codebase has one, keeping the same metaphors.

## Files
- `Trip Finder.html` — interactive product prototype (all behavior + styling inline).
- `IT Outing 2026 — Design System.html` — design-system spec: full color scales, type scale, spacing/radius/elevation, component specs, dark mode, and mobile patterns. **Primary styling reference.**
