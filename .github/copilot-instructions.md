# Copilot / AI Agent Instructions for class123-clone

Short summary
- This is a small React (Vite) classroom app. The top-level coordinator is `src/App.jsx` which centralizes app state (auth, classes, behaviors) and delegates rendering to components in `src/components`.
- No React Router: navigation is handled by local `view` state in `App.jsx` and by passing callbacks.
- Persistent storage uses `localStorage` with per-user keys: `class123_data_<email>` for classes and `class123_behaviors` for behavior cards.

Key files & responsibilities
- `src/App.jsx` — central state manager and traffic controller. Responsibilities:
  - Keep `user`, `classes`, `behaviors`, `activeClassId`, and `view` state.
  - Persist `behaviors` and per-user `classes` to `localStorage`.
  - Provide callback props expected by child components:
    - `LandingPage` expects `onLoginSuccess(user)` (component located at `src/components/LandingPage.jsx`).
    - `TeacherPortal` expects `classes`, `onSelectClass(classId)`, `onAddClass(newClass)`, `onLogout()`.
    - `ClassDashboard` expects `activeClass`, `behaviors`, `onBack()`, `onOpenEggRoad()`, `onOpenSettings()`, and `updateClasses(updater)`.
    - `SettingsPage` receives `activeClass`, `behaviors`, `onUpdateBehaviors(nextBehaviors)` and `onUpdateStudents(nextStudents)`.

Important data flows & conventions
- Classes are arrays of objects: { id, name, students: [ { id, name, gender, avatar, score } ], ... }.
- Behavior cards are objects: { id, label, pts, type: 'wow' | 'nono', icon } and stored under `class123_behaviors`.
- Per-user classes are stored under `class123_data_<email>`; ensure `App.jsx` reads/writes the same key when signing in/out.
- `updateClasses` is commonly implemented as either a functional updater (prev => next) or a direct value. Child components (e.g., `ClassDashboard`) call `updateClasses` with a functional updater — keep that contract.

Component patterns / gotchas
- Avatar generation uses dicebear seed patterns and sometimes a gender toggle. Example seeds:
  - Boy: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}&hair=short`
  - Girl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}&hair=long`
  - Components `AddStudentModal.jsx` and `StudentCard.jsx` implement this pattern.
- Modals are implemented as simple components returning overlay DOM nodes (no portal). They stopPropagation on inner clicks. Keep that pattern when integrating.
- Many components use inline `styles` objects exported from the same file; copy that style shape if you add new small UI functions.
- The app relies on component-level state for some UIs (e.g., `ClassDashboard` opens internal AddStudentModal and LuckyDrawModal). App-level state should only own data and navigation/state required across screens.

Developer workflows
- Use Vite dev server:

```bash
npm install
npm run dev
```

- Build: `npm run build`; preview: `npm run preview`.
- Lint: `npm run lint` (basic ESLint setup included).

Where to look first when updating features
- If a new feature touches classes or students: update `App.jsx` persistence and the `updateClasses` contract.
- If a component needs to change what props it receives, update `App.jsx` to pass the new callback (keep names consistent — see examples above).
- If a modal or small UI is failing to show/hide, check whether the parent holds the boolean (`isOpen`) or the child uses internal state; prefer parent-owned when multiple components need to coordinate.

Examples (how to call and what to expect)
- Add a new class from `TeacherPortal`:
  - `onAddClass({ id: Date.now(), name: '4A', students: [] })` — App will persist it.
- Update a student's score from `ClassDashboard`:
  - Call `updateClasses(prev => prev.map(c => c.id === activeId ? { ...c, students: c.students.map(s => s.id === sid ? { ...s, score: s.score + 1 } : s) } : c))`.
- Login flow:
  - `LandingPage` calls `onLoginSuccess(user)`; `App.jsx` stores to `localStorage` and loads per-user classes.

Notes for AI contributors
- Preserve storage keys and the `updateClasses` functional-updater contract.
- Avoid introducing React Router or portals unless you also migrate all navigation/state accordingly.
- When refactoring, aim to keep component prop shapes stable to reduce churn.
- If you find mismatched prop names (e.g., `onAuthSuccess` vs `onLoginSuccess`), update `App.jsx` to pass the expected name by the component under `src/components` rather than renaming multiple components at once.

If anything is unclear or you want me to generate a small automated migration (e.g. rename props across files), tell me which change you prefer and I can apply it.
