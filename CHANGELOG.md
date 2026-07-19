# Changelog

All notable changes to this project are documented here.

## [Unreleased] - 2026-07-19

### Changed

- **Course builder — setup tab required-field validation**: `price`, `learning_objectives`,
  `prerequisites`, and `audiences` are now required on the course setup form, matching the
  backend's serializer validation. Inline error messages added for each field.
  (`src/components/dashboard/instructor/course-builder/setup-tab.tsx`)
- **Course builder — rich text editors for metadata fields**: `learning_objectives`,
  `prerequisites`, and `audiences` switched from plain `<textarea>` to `RichTextEditor`, matching
  `description`'s existing editing experience. Blank-HTML detection (`isBlankHtml`) added so an
  empty `<p></p>` doesn't pass validation as non-empty.
  (`src/components/dashboard/instructor/course-builder/setup-tab.tsx`)
- **Course builder — price no longer silently defaults**: removed the `form.price || "0"`
  fallback when submitting the course payload; price is now a required field validated before
  submit, not defaulted at the API call site.
  (`src/app/dashboard/instructor/course-builder/page.tsx`)
- **Quiz builder — correct-answer selection simplified**: dropped the manual "demote the
  previously-correct answer" follow-up request. The backend now atomically demotes the prior
  correct answer when a new one is marked correct, so the frontend only needs to send the single
  update. (`src/components/dashboard/instructor/course-builder/quiz-builder.tsx`)
- **Rich text editor — explicit extension configuration**: `TextStyle` and `LineHeight` Tiptap
  extensions now called with `.configure()` instead of passed bare.
  (`src/components/common/rich-text-editor.tsx`)

### Fixed

- **Course categories — pagination bug**: `getCourseCategories()` previously returned only the
  first page of results from `/courses/categories/`. It now follows the paginated `next` link
  until exhausted, so courses with more categories than fit on one page all appear in the
  category picker. (`src/lib/course-api.ts`)

### Dependencies

- `package-lock.json` updated (lockfile churn from the above).
