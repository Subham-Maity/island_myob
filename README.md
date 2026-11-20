# Island Myob — Living Habit World Playground

Welcome to **Island Myob**! This is a dedicated, self-contained Next.js (App Router) project designed to visually experiment with, test, and redesign the **Habit Island** ecosystem.

---

## 🚀 Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the local dev server:
   ```bash
   npm run dev
   ```

3. Open your browser:
   Visit **[http://localhost:3000](http://localhost:3000)** to see the live interactive playground!

---

## 🎨 What is in this Project?

Everything you need to redesign is located inside the `island/` folder:

```
test-modules/island_myob/
├── island/
│   ├── island-animation.tsx    <-- [PRIMARY] The Living Isometric Island SVG canvas & Day/Night animation
│   ├── milestone-ribbon.tsx    <-- [PRIMARY] The Net Worth Milestone progress bar & pace text
│   ├── island-hero.tsx         <-- [PRIMARY] The Card container (Header, preview controls, milestone wrapper)
│   ├── island-info-dialog.tsx  <-- The "How it works" popup modal
│   │
│   ├── hero-header.tsx         <-- Streak flame & XP header
│   ├── stat-trio.tsx           <-- 3 metric stat cards
│   ├── quest-card.tsx          <-- Weekly Quest card (progress dots, Swap & Rate buttons)
│   ├── swap-modal.tsx          <-- Modal dialog when clicking Swap Quest
│   ├── today-status-bar.tsx    <-- Daily check-in & No-Spend action button
│   ├── pause-shield-section.tsx<-- Vacation/pause shield
│   └── calm-mode-footer.tsx    <-- Calm mode toggle switch
│
├── app/
│   ├── page.tsx                <-- Interactive test playground with stage switcher & live click feedback
│   └── globals.css             <-- Dark theme styles (#09090b)
└── lib/mock-data.ts            <-- 100% anonymous, safe test data (no real names or credentials)
```

---

## 🕹️ Interactive Playground Controls

When you run `npm run dev` and open `localhost:3000`, you can:
- **Switch Stages:** Tap `[🌱 Stg 0]`, `[🌸 Stg 1]`, `[🌳 Stg 2]`, `[🌲 Stg 3]`, or `[🗼 Stg 4]` to see how the island grows from a tiny sprout to a bustling crystal island with a lighthouse!
- **Toggle Time of Day:** Tap `[☀️ Daytime]` / `[🌙 Resting Twilight]` to see the day/night lighting transition and fireflies.
- **Preview 60s Cycle:** Click the `[👁 Preview 60s]` button on the card to watch the animated growth simulation loop.
- **Randomize:** Tap `[Randomize]` to test different Net Worth numbers and milestone calculations.
- **Click Actions:** Click *Swap Quest*, *Rate (Love it / OK / Meh)*, or *Save Yesterday* to verify live interactive states in the action log.

---

## 🛠️ Design Freedom

You have complete creative freedom:
- Feel free to elevate the visuals, refine the SVG illustrations, add CSS/SVG animations, enhance the progress bars, adjust the typography, or rethink the card hierarchy.
- Once you are happy with your redesign, your work will be integrated directly into production!

