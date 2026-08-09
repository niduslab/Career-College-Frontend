# Changelog — Learner Dashboard, Wishlist, Notes & Course Q&A

File-by-file record of the frontend work wiring the learner dashboard surface to the
backend. Companion to the backend's own `CHANGELOG_LEARNER_DASHBOARD.md`
(`Career-College-Backend/docs/CHANGELOG_LEARNER_DASHBOARD.md`), which built the
endpoints this consumes.

**Why this work happened:** most of the learner dashboard rendered hardcoded arrays —
stats, streak, activity, upcoming, certificates, wishlist, notes, Q&A threads, live
sessions, and payment history were all static mock data, some of it invented (XP,
ratings, invoice numbers, badges) with no backing field anywhere. This connects every
one of those pages to a real endpoint and removes what can't be honestly rendered
instead of leaving it fake.

**Scope deliberately excluded:** XP/gamification, badges, price-drop alerts,
recommendations — none of these exist server-side yet (see backend `FEATURE_STATUS.md`).

---

## New files

| File | What it does |
|---|---|
| `src/lib/wishlist-api.ts` | `getWishlist`, `addToWishlist`, `removeFromWishlist` — thin wrappers over `/courses/wishlist/` and `/courses/<slug>/wishlist/`. |
| `src/lib/notes-api.ts` | Full notes CRUD (`getNotes`/`getNote`/`createNote`/`updateNote`/`deleteNote`) plus the filter/ordering param types mirroring the backend's `NOTE_ORDERING_OPTIONS`. |
| `src/lib/certificates-api.ts` | `getMyCertificates` plus `certificateUrl()`, which turns the backend's relative `download_url`/`verify_url` into an absolute link by stripping `/api/v1` off `config.apiBaseUrl` — those two paths are the only certificate URLs that are server-relative rather than full media URLs. |
| `src/lib/learner-dashboard-api.ts` | `getLearnerSummary`, `getLearnerActivity`, `getLearnerUpcoming`, `getContinueLearning` — one function per dashboard aggregate, typed to match the backend response exactly, including the fields that flag a number as approximate (`day_streak_is_approximate`) or absent (no `total_xp` field at all). |
| `src/lib/course-qa-api.ts` | Question/reply CRUD and upvote calls for the per-course Q&A board. Its top comment records the two things the backend deliberately withholds — an author avatar and a per-viewer "did I upvote" flag — so nothing downstream tries to fabricate them. |
| `src/lib/webinars-api.ts` | Webinar catalog, own-registrations, and register calls. Two distinct shapes on purpose: `WebinarSummary` (public, no `meeting_url`) vs. `RegistrantWebinar` (carries the join link) — the API only ever returns the join link on the registrant payload. |
| `src/hooks/use-wishlist.ts` | `useWishlist` + `useToggleWishlist`. The toggle is optimistic across **two** caches (the wishlist list and the catalog's `is_wishlisted` flag) since the heart appears in both places and used to be pure local state — an unadorned mutation would make it visibly lag a round-trip. |
| `src/hooks/use-notes.ts` | Query + 4 mutations, each patching the notes cache in `onMutate` and rolling back `onError`, matching the instant feel the old local-state version had. No optimistic insert on create — a placeholder note would need a fabricated id. |
| `src/hooks/use-certificates.ts` | `useMyCertificates`. |
| `src/hooks/use-learner-dashboard.ts` | One hook per aggregate. |
| `src/hooks/use-course-qa.ts` | Question/reply queries and mutations, plus an optimistic upvote (increment-only, since the backend has no per-viewer vote row to read back). |
| `src/hooks/use-webinars.ts` | Catalog/detail/my-webinars queries, registration mutation. Registration is **not** optimistic — it can legitimately fail on capacity or price, so the button shows a pending state instead of guessing the outcome. |
| `src/components/common/query-states.tsx` | `CardGridSkeleton`, `ListSkeleton`, `StatsSkeleton`, `EmptyState`, `ErrorState` — every page below needed the same loading/empty/error presentation, previously reinvented (or, more often, absent) per page. |

## Modified files

| File | What changed |
|---|---|
| `src/app/dashboard/learner/page.tsx` | Greeting and streak line now read `useAuth`/`useLearnerSummary` instead of the hardcoded "Al Amin" / "27-day streak". |
| `src/components/dashboard/learner/sidebar.tsx` | Nav label "Discussions" → "Course Q&A" — the board is scoped per course, not a site-wide forum, and the page now picks one enrolled course at a time. |
| `src/components/dashboard/learner/stats-cards.tsx` | **5 tiles → 4.** XP is gone (no ledger backs it); the per-tile "+340 this week" deltas are gone (the summary endpoint carries totals, not week-over-week change). The streak tile shows "approx. · `<timezone>`" when the backend flags it approximate. |
| `src/components/dashboard/learner/continue-learning.tsx` | Hero card now shows the real resume target (`useContinueLearning`) with three explicit states — next lecture to watch, course finished, or next section still locked (`locked_until`) — instead of one hardcoded course/progress bar. "Upcoming" list switched from 4 fabricated events to `useLearnerUpcoming({ days: 7, limit: 4 })`, keyed off the 4 real `UpcomingType`s. |
| `src/components/dashboard/learner/recent-activity.tsx` | Feed now reads `useLearnerActivity`. Two mock rows are gone outright — "Unlocked badge" and "+150 XP earned" — because no badge or XP event exists to source them. Quiz/coding rows compute a headline (`Scored 94%`, `Passed 8/10 tests`) only when the backend's `meta` actually carries the numbers, never a fabricated default. |
| `src/components/dashboard/learner/certificates/index.tsx` | Reads `useMyCertificates`. Dropped the LinkedIn share button and the QR-code placeholder — neither is backed by any endpoint. Card shows `course_title` (the frozen award-time snapshot), not the live course title, matching the backend's explicit split. |
| `src/components/dashboard/learner/wishlist/index.tsx` | Reads `useWishlist`; remove button calls `useToggleWishlist`; enroll button reuses the catalog's free-enroll-then-fall-back-to-checkout flow. Star rating and review count are gone from the card — the catalog serializer has never returned them. |
| `src/components/dashboard/learner/course-catalog/index.tsx` | Wishlist heart is no longer local `useState` — it reads `course.is_wishlisted` from the server and patches optimistically through `useToggleWishlist`. `useMyCourses` call now passes `page_size: ALL_ENROLLMENTS_PAGE_SIZE` (see bug below). |
| `src/components/dashboard/learner/my-courses-page.tsx` | Tabs and their counts now come from the server (`?status=`, `status_counts`) instead of filtering a locally-fetched page. See **Bug 2 and 3** below — this is the fix. |
| `src/components/dashboard/learner/discussions/*` (`index.tsx`, `data.ts`, `types.ts`, `thread-card.tsx`, `thread-drawer.tsx`, `new-thread-modal.tsx`) | Entire board rewired from a flat mock `THREADS` array to the per-course Q&A API. Category chips are gone — the course *is* the scope now, selected via a course picker built on `useMyCourses`. Tags are gone (the API has none). Author avatar images replaced with initials (the API returns no avatar). Upvote button disables itself after one click per session — the backend has no per-viewer vote row, so it can't tell the UI whether *this* viewer already voted; that state is client-only and only prevents an accidental double-count within the session, not across reloads. |
| `src/components/dashboard/learner/notes/index.tsx` | Rewired from mock notes to `useNotes` + create/update/delete mutations. Tag input capped at 10 (matches the backend's `MAX_NOTE_TAGS`). Course/lecture anchor picker built on `useMyCourses`. The old "category" concept is gone — the backend only has free-form tags. |
| `src/components/dashboard/learner/live-sessions/index.tsx` | Rewired from mock sessions to `useWebinarCatalog` + `useMyWebinars` + `useRegisterForWebinar`. Attendee counts, capacity bars and reminder toggles are gone: the catalog exposes `max_capacity` but no registered-attendee count, so a "spots left" figure can't be computed. The join link (`meeting_url`) only ever appears on `useMyWebinars`' registrant payload, never on the public catalog — unregistered learners get the register/buy flow instead of a link. Register button falls back to checkout for a paid webinar exactly like the course-catalog enroll button falls back for a paid course. |
| `src/components/dashboard/learner/payment-history/index.tsx` | Rewired from a mock `PAYMENTS` array to `useMyOrders`. Fabricated `invoiceId`s (`INV-2026-0041`, ...) and the "Download invoice" button are gone — the backend has no invoice numbering or invoice document, only an order/`tran_id`. Row title now reads `course_title ?? webinar_title ?? "Order <tran_id>"`. Status filter/search/sort now run client-side over one large page (`page_size` capped at 100 server-side) because the orders endpoint has no search or sort param and the stat tiles need counts across the whole history, not one page. |
| `src/hooks/use-course-catalog.ts` | `useMyCourses` takes `{ status, page, page_size }` now; exports `ALL_ENROLLMENTS_PAGE_SIZE = 100` for callers that need every enrollment rather than one page. |
| `src/hooks/use-payments.ts` | `useMyOrders` takes `{ status, page, page_size }`. |
| `src/lib/course-api.ts` | `CatalogCourse` gained `is_wishlisted`. `getMyCourses` gained `status`/paginated response fields (`MyCoursesResponse` extends the paginated envelope with `status_counts`). |
| `src/lib/payments-api.ts` | `Order` gained `course_title` / `course_slug` / `webinar_title` / `webinar_slug` (exactly one pair populated, per `item_type`); `getMyOrders` gained `status`/`page`/`page_size` params. |

---

## Three bugs this surfaced (all backend-side, fixed there — see the backend changelog)

The frontend was either the cause or the first visible symptom of three bugs fixed in
this same effort on the backend:

**Bug 1 — completed courses silently un-completed.** Not a frontend bug, but the new
`courses_completed` stat tile is what made it visible: a course could show 100% done
one day and drop out of "Completed" the next if an instructor added one lecture.

**Bug 2 — My Courses only ever loaded one page.** `my-courses-page.tsx` used to call
`/my-courses/` with no `page_size`, then filter and paginate the tabs *client-side* over
whatever the server's default page (10) happened to return — so enrollment 11 onward was
unreachable in every tab, and the tab counts were wrong for anyone with more than 10
enrollments. The same silent cap was hiding in three other callers of `useMyCourses`
with no `page_size` override: the catalog's enrolled-course flags, the Q&A course
picker, and the notes course picker. Fixed by moving `status` filtering and count
computation server-side (`?status=`, `status_counts`) and by adding
`ALL_ENROLLMENTS_PAGE_SIZE` for the three callers that need the whole set rather than a
page.

**Bug 3 — a completed-then-unenrolled course vanished from My Courses.** Surfaced by
inspecting real data while building the certificates list: a certificate with no course
row to open it from in My Courses, because the list filtered `is_active=True` and
unenrolling flips that flag even though `completed_at` and the certificate both survive.
Fixed backend-side; the frontend change here is just `my-courses-page.tsx` now trusting
the server's `status_counts` instead of recomputing a (wrong) count itself.

---

## Design decisions worth keeping

**Nothing renders a number the backend didn't send.** Where a mock value had no
backing field — XP, star ratings on wishlist/catalog-adjacent cards, badge unlocks,
week-over-week deltas, invoice numbers, attendee/capacity counts, viewer-upvoted state —
the UI element is removed, not replaced with a zero or a guess. Follow this when adding
the next card: if the API doesn't carry it, the field doesn't render.

**Optimistic updates only where the action can't meaningfully fail.** Wishlist toggle
and note edits are optimistic (pure local-data mutations). Webinar registration and
checkout are not — they can fail on capacity, price, or gateway errors, so those buttons
show a pending state and surface the real error via `notify.error`, using `ApiError` to
distinguish a server message from a network failure.

**The upvote-disable-after-click is a known compromise.** Because the backend counter
has no per-user vote row, "have I upvoted this" cannot be answered after a page reload —
only within the current session, client-side. This is documented in `use-course-qa.ts`
and `thread-card.tsx` rather than silently relied upon.

---

## Verification

Manual — no automated frontend test suite exists in this repo. Each rewired page was
checked against its backend contract in `Career-College-Backend/docs/api-testing/
postman-learner-dashboard.md` (dashboard, certificates, wishlist, notes) and the
pre-existing `postman-discussion.md` / `postman-webinars.md` / `postman-payments.md`
guides for Q&A, live sessions, and payment history respectively.
