# E2E Test Infra: TEACH App Redesign

## Test Philosophy
- Opaque-box, requirement-driven. No dependency on implementation design.
- Methodology: Category-Partition + BVA + Pairwise + Workload Testing.

## Feature Inventory
| # | Feature | Source (requirement) | Tier 1 | Tier 2 | Tier 3 |
|---|---------|---------------------|:------:|:------:|:------:|
| 1 | Collapsible Sidebar (Chats & Books access) | ORIGINAL_REQUEST § R1 | 5 | 5 | ✓ |
| 2 | Teacher Mode (Chat-centric layout) | ORIGINAL_REQUEST § R1 | 5 | 5 | ✓ |
| 3 | Books / Library Mode | ORIGINAL_REQUEST § R1 | 5 | 5 | ✓ |
| 4 | Thematic UI (Particle background, gray dark mode) | ORIGINAL_REQUEST § R2 | 5 | 5 | ✓ |
| 5 | 3D Book Covers & Flip-open animation | ORIGINAL_REQUEST § R3 | 5 | 5 | ✓ |
| 6 | Book Detail Split-View (Source / Notes) | ORIGINAL_REQUEST § R3 | 5 | 5 | ✓ |
| 7 | Highlight-to-Note interaction | ORIGINAL_REQUEST § R3 | 5 | 5 | ✓ |
| 8 | "Studio" Control Panel | ORIGINAL_REQUEST § R3 | 5 | 5 | ✓ |
| 9 | Accessibility & Keyboard Nav | ORIGINAL_REQUEST § R4 | 5 | 5 | ✓ |

## Test Architecture
- Test runner: Playwright (`npx playwright test`)
- Pass/fail semantics: Exit code 0 means all pass.
- Directory layout: `/e2e` for Playwright tests, grouped by Tier (`/e2e/tier1`, `/e2e/tier2`, etc.)

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Student prepares for history exam using Book Mode and Chat | F1, F3, F6, F7, F8 | High |
| 2 | Teacher designs lesson plan starting in Chat, moving to Studio | F1, F2, F8 | Medium |
| 3 | Keyboard-only navigation session opening a book and taking notes | F1, F3, F5, F6, F7, F9 | High |
| 4 | Rapid context switching between multiple books and chat sessions | F1, F2, F3, F5 | Medium |
| 5 | Complete session interacting with visual elements without distraction | F4, F5, F6 | Low |

## Coverage Thresholds
- Tier 1: ≥5 per feature (Total: 45)
- Tier 2: ≥5 per feature (where boundaries exist) (Total: 45)
- Tier 3: pairwise coverage of major feature interactions (Total: ~10-15)
- Tier 4: ≥5 realistic application scenarios (Total: 5)
