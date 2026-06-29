# Acceptance Checklist — Jemon P4 Design Set

Run every item before merging or presenting generated dashboard code.

---

## 1. Build

- [ ] `pnpm --filter @jemon/ui build` exits 0 with no TypeScript errors
- [ ] `dist/scenes/index.js` and `dist/scenes/index.d.ts` exist after build
- [ ] No `any` casts introduced in `src/scenes/**`

## 2. Scene correctness

- [ ] `CampusScene` renders with `frameloop="demand"` (on-demand, not continuous)
- [ ] Camera is `OrthographicCamera` at isometric angle `[12, 12, 12]`, zoom 52
- [ ] Each building has a body mesh, horizontal ledge strips, and a roof accent
- [ ] Roof accent colour matches `utilColor(cpu)` for the building
- [ ] Roof accent pulses (via `useFrame`) when CPU > 80 %
- [ ] Metric card shows CPU / MEM / NET / TEMP with colour-coded progress bars
- [ ] Progress bar colours match status thresholds from `design-system.md`
- [ ] Dark background `#0a0e1a` visible around all buildings

## 3. Package exports

- [ ] `package.json` has `"./scenes"` in `exports` map
- [ ] `exports["./scenes"].import` resolves to `./dist/scenes/index.js`
- [ ] `exports["./scenes"].types` resolves to `./dist/scenes/index.d.ts`
- [ ] `src/index.ts` (P3 barrel) is **not modified**

## 4. Dependency hygiene

- [ ] No AGPL, SSPL, commercial, or proprietary licenses added
- [ ] `three`, `@react-three/fiber`, `@react-three/drei`, `react`, `react-dom` are `peerDependencies`
- [ ] Same packages appear in `devDependencies` for build-time type checking
- [ ] `pnpm check:licenses` exits 0

## 5. Design system compliance

- [ ] All colours match tokens in `.claude/design-system.md`
- [ ] Font stack uses `ui-monospace, "Cascadia Code", monospace` for metric cards
- [ ] No inline `#fff` or `#000` — use palette tokens

## 6. Documentation

- [ ] `.claude/design-system.md` committed
- [ ] `.claude/components.md` committed with up-to-date prop tables
- [ ] `.claude/skills/image-to-dashboard.md` committed
- [ ] `.claude/templates/dashboard.tsx.hbs` committed
- [ ] `.claude/golden/campus-example.md` committed with working code example
- [ ] `docs/design-set.md` committed with reference2 rack reproduction guide

## 7. Code quality

- [ ] No debug `console.log` / `console.warn` left in src/
- [ ] All exported functions and interfaces have JSDoc summaries
- [ ] `noUnusedLocals` and `noUnusedParameters` pass (enforced by tsconfig)
- [ ] No stubs, TODOs, or placeholder implementations in shipped code

---

Checklist passes when all items are checked. One unchecked item = not ready.
