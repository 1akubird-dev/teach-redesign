# Handoff Report: E2E Test Review (pairwise.spec.ts)

## 1. Observation
The test file uses inconsistent test IDs for the same user action across different tests. 
- In lines 43, 87, and 106, the test navigates to the library via `await page.getByTestId('nav-books').click();`.
- In lines 126, 151, 163, 184, and 224, it abruptly switches to `await page.getByTestId('btn-library-mode').click();`.
*(Note: A cross-reference grep shows Tier 4 tests use `nav-books-mode`).*

**Logic Chain**: Since these actions are navigating to the same library mode, at least one of these selectors is incorrect for the application. When the tests run, the incorrect selector will throw a Playwright `TimeoutError: locator not found`.
**Caveats**: The application might legitimately have two different buttons for the same action in different contexts, but standard opaque-box test suites should use a consistent ID or action pattern.
**Conclusion**: The inconsistent selector usage is a logical bug that will result in broken tests.
**Verification Method**: Run the suite (`npx playwright test e2e/tier3/pairwise.spec.ts`). One set of tests will consistently fail on the click action.

---

## 2. Observation
In `Library + 3D Covers + A11y` (line 99), the test uses a hardcoded wait before fetching bounding boxes:
```typescript
await page.waitForTimeout(500);
const splitViewBounds = await page.getByTestId('split-view').boundingBox();
expect(splitViewBounds).not.toBeNull();
```
A similar pattern exists in `Sidebar + Teacher Mode + A11y` (line 27).

**Logic Chain**: `boundingBox()` is a synchronous call that returns `null` if the element is not currently visible or attached. Because animations or renders can take longer than the arbitrary 500ms timeout (especially in CI/CD environments), `boundingBox()` can return `null` and immediately crash the test with a failed assertion. 
**Caveats**: The `500ms` wait might be sufficient locally but is an E2E anti-pattern.
**Conclusion**: The E2E tests suffer from race conditions and flakiness due to not waiting for element visibility.
**Verification Method**: Temporarily simulate a slow layout render by throttling the CPU or artificially delaying the `split-view` mount in the app, and observe the test failure on `.boundingBox()`. Fix by adding `await expect(page.getByTestId('split-view')).toBeVisible();` before querying bounds.

---

## 3. Observation
In `Sidebar + Split-View (F1, F6)` (line 41), the test description claims to verify that toggling the sidebar "maintains proportional widths". However, the assertion on line 68 only verifies: 
`expect(leftBounds!.width + rightBounds!.width).toBeLessThanOrEqual(splitViewBounds!.width);`

**Logic Chain**: The assertion strictly tests for overflow (that the panes fit within the container). It completely fails to verify the stated requirement of proportionality (e.g., maintaining a 50/50 or 70/30 layout ratio before and after the sidebar toggle). 
**Caveats**: No caveats. The logic simply does not match the stated test requirement.
**Conclusion**: This is an incomplete assertion. The test lacks the logic to record the initial width ratio prior to the toggle and compare it to the final ratio.
**Verification Method**: Inspect the source code. Observe the absence of ratio calculations. Introduce a bug in the app where the split view abruptly snaps to a 10/90 ratio upon sidebar toggle; the test will still falsely pass.

---

## 4. Observation
In `Highlight-to-Note + A11y (F7, F9)` (lines 173-174), the test simulates text selection, then blindly assumes focus order:
```typescript
await page.keyboard.press('Tab'); // focus highlight menu
await page.keyboard.press('Enter'); // create note
```

**Logic Chain**: This assumes the highlight context menu appears instantaneously and is exactly one `Tab` press away in the DOM order. If there is a slight rendering delay for the menu, `Tab` will move focus to an unrelated DOM element, and `Enter` will silently fail to trigger note creation, causing the subsequent assertion for `note-editor-input` to fail.
**Caveats**: If the app uses a native, blocking prompt, this might work, but modern UI menus are DOM-based and asynchronous.
**Conclusion**: The keyboard interaction sequence is flawed and brittle. It should explicitly wait for the highlight menu to become visible before pressing Tab or Enter.
**Verification Method**: Run the test under CPU throttling. The `Tab` action will execute before the menu mounts, causing the test to timeout waiting for the `note-editor-input`.

---

## 5. Observation
In `Split-View + Highlight-to-Note (F6, F7)` (line 144), the test clicks the highlight menu and verifies the action succeeded using:
```typescript
const newNote = rightPane.getByTestId('note-card').first();
await expect(newNote).toBeVisible();
```

**Logic Chain**: Using `.first().toBeVisible()` simply checks that *at least one* note exists. If the application has pre-existing default notes, or if state leaked from a previous test or standard user data, this assertion will pass even if the "Highlight-to-Note" action completely failed to create a new note.
**Caveats**: If the test environment guarantees a completely empty database on every run, this might pass, but it's fundamentally weak.
**Conclusion**: This is a false-positive vulnerability (incomplete assertion). It fails to verify the *creation* of a new note.
**Verification Method**: Break the highlight-to-note feature in the source code, but seed the database with one existing note. The test will falsely pass. Fix by checking that the note count increased, or that the newly created editor state (`note-editor-input`) is present.

---

## 6. Observation
In `Teacher Mode + Thematic UI (F2, F4)` (line 83), the test enforces a strict CSS rule:
`await expect(themeBg).toHaveCSS('background-color', 'rgb(26, 26, 26)');`

**Logic Chain**: The infrastructure document `TEST_INFRA.md` specifies a "gray dark mode" requirement. Hardcoding an exact RGB triplet string tightly couples the E2E test to superficial design details. Any minor change to the design system's hex values will break the test, which violates opaque-box testing principles.
**Caveats**: Playwright's `toHaveCSS` strictly matches computed string values.
**Conclusion**: This assertion is overly brittle and heavily prone to false-positive failures during visual design updates.
**Verification Method**: Change the app's dark mode background to `rgb(25, 25, 25)`. The app still fulfills the requirement of a dark gray theme, but the test will fail. Use class presence or CSS variable values instead.
