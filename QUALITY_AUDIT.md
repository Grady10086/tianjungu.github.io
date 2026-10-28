# Website Quality Audit

This checklist is the release gate for the academic homepage. Each iteration is reviewed at desktop, tablet, and mobile widths in both light and dark themes.

## Evaluation Model

### Design and craft

- Typography has a deliberate scale, readable measure, and consistent rhythm.
- Color roles remain restrained and pass contrast checks.
- Layout alignment, spacing, image treatment, and interaction states feel intentional.
- Every section belongs to the same visual system.

### Usability and accessibility

- Navigation is immediately understandable and orientation remains clear.
- Keyboard focus, semantic structure, alt text, and touch targets are complete.
- Content remains available without JavaScript.
- Motion respects `prefers-reduced-motion` and never blocks reading.
- Desktop, tablet, and mobile have no overflow or overlapping content.

### Creativity and interactivity

- The signature concept is evidence becoming a revisable world state.
- Interaction clarifies the research story instead of decorating it.
- Scroll, pointer, and keyboard feedback are coherent and restrained.
- The experience remains recognizably Tianjun Gu's academic homepage.

### Content and credibility

- Research claims, publication metadata, links, and dates match the CV.
- Accepted, published, poster, and under-review statuses use consistent language.
- Writing is concise, specific, and appropriate for faculty and research recruiters.
- Every visual is authentic to the work it represents.

### Engineering quality

- No console errors, broken local assets, duplicate IDs, or invalid internal anchors.
- Core content does not depend on third-party scripts.
- Image dimensions are declared and assets are appropriately compressed.
- Page progress, reveal effects, and media motion remain smooth under reduced resources.

## Iteration 1: Interaction Foundation

- [x] Progressive enhancement for reveal animations
- [x] Reduced-motion behavior
- [x] Page progress feedback
- [x] Research-cycle state feedback
- [x] Pointer-aware publication media response
- [x] Improved mobile interaction targets
- [x] Original social sharing preview
- [x] AA-compliant small-text color roles in light and dark themes
- [ ] Automated contrast and performance budget checks
- [ ] Cross-browser verification beyond Chromium

## Iteration 2: Research Identity

- [x] Interactive Observe–Revise–Reason cycle in the first viewport
- [x] Shared state between the hero cycle and Research Focus
- [x] Research-led eyebrow instead of degree-status labeling
- [x] Original social sharing preview and complete Open Graph metadata
- [x] Accessible small-text accent colors

## Iteration 3: Publication Readability

- [x] Persistent publication numbering aligned with the scroll counter
- [x] Higher contrast for inactive publication cards
- [x] Higher contrast for inactive Research Focus entries
- [ ] Verify keyboard navigation in Safari and Firefox

## Iteration 4: Research Trajectory

- [x] Thematic Observe–Revise–Reason matrix for core publications
- [x] Honest separation between core trajectory and earlier work
- [x] Atlas state synchronized with publication scroll focus
- [x] Pointer and keyboard interaction without hover-only content
- [ ] User test the trajectory with faculty and research peers

## Current Assessment

The site has strong content credibility and a coherent editorial foundation. Its largest remaining gap is a distinctive interaction system that connects the research thesis across the whole page. Future iterations should deepen that single concept rather than add unrelated visual effects.
