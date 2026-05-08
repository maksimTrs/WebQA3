# CLAUDE.md — Playwright Test Automation Framework (API + UI)

## About the User

The user is a **Senior QA / SDET** building production-grade Playwright test frameworks
(API, UI, or both — depends on the project).

- **Experience:** senior-level test automation, design patterns, architecture, CI/CD.
- **New to:** TypeScript and Playwright — both the language and the framework from scratch.
- **Goal:** SDET-quality framework code — clean architecture, proper abstractions,
  maintainable and scalable. Not "just make it work" tutorials.

**Important:** The user has NOT read Playwright or TypeScript documentation and does not plan to.
Explain ALL TS and Playwright concepts in detail — fixtures, request context, test lifecycle,
type system features, etc. Don't assume familiarity with any TS/Playwright-specific mechanism.
But the user understands engineering depth — explain with nuance, trade-offs, and "why",
not in a dumbed-down way.

## IDE

The user works in **WebStorm** (JetBrains). Do NOT assume VS Code.

## Communication Language

- **Chat messages:** Russian. Explanations, commentary, callout blocks — all in Russian.
- **Code files:** everything in English — code, comments, variable names, strings.
  Code will be pushed to remote repositories, so no Russian in source files.
- Technical terms (fixture, assertion, request context, etc.) stay in English everywhere.

## Teaching Style

### Core Principles

- **Always explain "why"** — don't just show code. Why this type? Why this pattern?
  What bug does it prevent?
- **Bridge from JavaScript** — when a TS concept is rooted in JS behavior, explain the JS part too.
- **Stay focused** — deep on one topic, not wide on many. If a related topic would help,
  ask the user first via AskUserQuestion tool before expanding.
- **One best practice per answer** — mention naturally when relevant, don't dump lists.

### Formatting

- **Theory first** — before code, explain what and why (even when asked to "just write code").
  Code files can have concise comments, but the chat message must have the full explanation.
- **> ОБРАТИ ВНИМАНИЕ:** — for common mistakes and gotchas
- **> ЗАМЕТКА:** — for tips and best practices
- **> ЛУЧШАЯ ПРАКТИКА:** — for patterns worth adopting
- **Naming callouts** — when creating or suggesting new files, classes, interfaces, types,
  or variables, use `> ЗАМЕТКА:` to explain why that specific name was chosen and which
  naming convention from the Naming section applies (e.g., file is camelCase by resource,
  interface is PascalCase, etc.). This helps the user internalize the project conventions.

### Edge Cases & Gotchas — proactive highlighting

When writing or explaining code, **proactively** flag non-obvious behavior using
`> ОБРАТИ ВНИМАНИЕ:`. Don't wait for the user to hit a bug — surface it immediately.

Areas to watch for:
- **Assertions** — methods that look similar but behave differently
  (e.g., `toEqual` vs `toStrictEqual`, `toBe` for references vs values,
  `toBeOK()` checks status range not exact code)
- **async/await traps** — forgotten `await` (silently passes), parallel vs sequential
  execution, unhandled rejections, race conditions in test setup
- **TypeScript type pitfalls** — type narrowing that doesn't persist across `await`,
  `as` casting that hides bugs, optional chaining + nullish coalescing subtleties,
  `===` on objects (reference equality), truthy/falsy surprises (`0`, `""`, `[]`)
- **API testing specifics** — response body parsed twice (stream consumed), empty body
  on 204, error responses with different shapes than success, timeout defaults
- **Playwright internals** — fixture scoping (test vs worker), `beforeAll` shared state
  across parallel workers, `request` context lifecycle, config cascade conflicts

Format: short, concrete — what can go wrong, what to do instead. One gotcha per callout,
not a list dump. Only flag what's relevant to the code at hand.

### TypeScript Specifics

- Never assume prior TS knowledge — explain TS concepts from scratch
- **async/await** is fundamental to Playwright — explain Promises, async flow, error handling
  in async code thoroughly when they come up. Don't assume the user knows how they work.
- When compiler errors appear — break them down, explain what each part means
- Show TS → JS connection when it helps understanding
- For complex expressions — break execution into numbered steps with concrete values
- When writing classes — explain the choice of `public`/`private`/`readonly` via
  `> ЗАМЕТКА:` or `> ЛУЧШАЯ ПРАКТИКА:`, linking to the class type (data model vs infrastructure)

## How to Run

```bash
# Run all tests
npx playwright test

# Run by project (API / UI separation in playwright.config.ts)
npx playwright test --project=api
npx playwright test --project=ui

# Run specific test file
npx playwright test tests/api/users.spec.ts

# Run tests by tag
npx playwright test --grep @smoke

# Debug mode (step-by-step in browser — UI tests)
npx playwright test --debug

# Interactive UI mode
npx playwright test --ui

# Show HTML report
npx playwright show-report

# Lint — check code style and errors
npm run lint

# Lint — auto-fix what can be fixed
npm run lint:fix
```

**For Claude:** Do NOT run tests, compiler, linter, or any code to verify examples.
The user will run everything themselves. Reason about correctness instead.

## Tech Stack

- **Playwright Test** — test runner and assertions
- **TypeScript** — strict mode, no compilation needed (Playwright transpiles)
- **Node.js** — runtime
- **CommonJS** — module system (`"type": "commonjs"` in package.json)
- **ESLint 9** — static analysis with flat config (`eslint.config.mjs`)

## TypeScript Configuration

### Setup (when creating `tsconfig.json` for a new project)

```jsonc
{
  "compilerOptions": {
    // Output target — ES2022 covers modern Node.js (18+): top-level await,
    // Array.at(), Object.hasOwn(), error cause
    "target": "ES2022",

    // Module system — CommonJS for Playwright projects
    // (Playwright transpiles TS itself, this controls module syntax)
    "module": "CommonJS",
    "moduleResolution": "node",

    // Path aliases — keep imports clean, avoid ../../../
    "baseUrl": ".",
    "paths": {
      "@tests/*": ["tests/*"],
      "@fixtures/*": ["tests/fixtures/*"],
      "@helpers/*": ["tests/helpers/*"],
      "@models/*": ["tests/models/*"],
      "@data/*": ["tests/data/*"],
      "@schemas/*": ["tests/schemas/*"],
      "@pages/*": ["tests/pages/*"]
    },

    // Interop
    "resolveJsonModule": true,
    "esModuleInterop": true,

    // Strictness — all enabled, non-negotiable
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "forceConsistentCasingInFileNames": true,

    // No JS output — Playwright handles transpilation
    "skipLibCheck": true,
    "noEmit": true
  },
  "include": [
    "tests/**/*.ts",
    "playwright.config.ts"
  ]
}
```

### Key decisions explained

- **`strict: true`** — enables all strict checks at once (`strictNullChecks`,
  `noImplicitAny`, `strictFunctionTypes`, etc.). Never disable.
- **`noUncheckedIndexedAccess`** — array/object index access returns `T | undefined`,
  forcing null checks. Catches real bugs in API response handling.
- **`noEmit: true`** — TS is used only for type checking and IDE support.
  Playwright has its own transpiler, so no JS output is needed.
- **`skipLibCheck: true`** — skips type checking of `.d.ts` files from node_modules.
  Speeds up checking, avoids conflicts between library type versions.
- **`esModuleInterop: true`** — allows `import x from 'module'` syntax for CommonJS
  modules (without it, you'd need `import * as x from 'module'`).
- **`resolveJsonModule: true`** — allows importing `.json` files with type inference
  (useful for test data fixtures).
- **Path aliases** — adapt the `paths` map to match the project's folder structure.
  Playwright resolves these automatically via tsconfig, no extra config needed.

## Linting

### Setup (when adding ESLint to a new project)

**1. Install packages:**
```bash
npm install -D eslint @eslint/js typescript-eslint eslint-plugin-playwright
```

**2. Create `eslint.config.mjs`** (flat config, ESLint 9+):
```mjs
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';

export default tseslint.config(
    // Base JS rules
    eslint.configs.recommended,

    // TypeScript rules
    ...tseslint.configs.recommended,

    // Playwright rules (test files only)
    {
        files: ['tests/**/*.ts'],
        ...playwright.configs['flat/recommended'],
    },

    // Ignored directories
    {
        ignores: ['node_modules/', 'test-results/', 'playwright-report/'],
    },
);
```

**3. Add scripts to `package.json`:**
```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  }
}
```

**4. Required `tsconfig.json` settings** (ESLint + TS interop):
- `"strict": true` — enables strict type checking that TS-ESLint rules rely on
- `"noEmit": true` — no JS output, TS is used only for type checking (Playwright
  transpiles via its own bundler)
- `"include"` must cover all linted files (e.g., `["tests/**/*.ts", "playwright.config.ts"]`)

### Rule layers

1. **`@eslint/js` recommended** — base JS rules (no-unused-vars, no-undef, etc.)
2. **`typescript-eslint` recommended** — TS-specific rules (no-explicit-any,
   no-unused-vars TS version, consistent type imports)
3. **`eslint-plugin-playwright` recommended** — Playwright test rules, applied only
   to `tests/**/*.ts` (missing-playwright-await, no-standalone-expect,
   no-wait-for-timeout, etc.)

### For Claude — code compliance

All generated code MUST comply with these rules. Key implications:
- No `any` — use `unknown` and narrow, or type explicitly
- No unused variables or imports
- All Playwright async methods must be `await`-ed
- `expect()` must be inside `test()` or `test.step()`
- No hardcoded `waitForTimeout()` — use proper Playwright waiting mechanisms
- Ignored paths: `node_modules/`, `test-results/`, `playwright-report/`

## Project Conventions

### Structure
```
tests/
  api/              — API test specs (one file per resource: articles.spec.ts, tags.spec.ts)
    schemas/        — schema validation specs (articles.schema.spec.ts, ...)
  ui/               — UI test specs (one file per page/flow)
  fixtures/         — custom Playwright fixtures (test setup/teardown)
  helpers/          — utility functions, API clients (ArticleApi, ProfileApi)
  models/           — interfaces for API request/response shapes (Article, User, Profile)
  data/             — test data: factories (articleFactory.ts), constants (testUser.ts)
  schemas/          — JSON Schema definition files (articleSchemas.ts, userSchemas.ts)
  pages/            — Page Object classes (Page injected, locators as properties)
playwright.config.ts
tsconfig.json
```

> **Note:** Not all folders are required. Use only what the project needs:
> API-only → no `pages/`, `ui/`. UI-only → no `schemas/`, possibly no `helpers/`.
> Subfolders under `api/` or `ui/` (e.g., `api/schemas/`) are optional —
> add them when a flat structure becomes hard to navigate.

**Path aliases** (configured in `tsconfig.json`, resolved by Playwright automatically):
- `@tests/*` → `tests/*`
- `@fixtures/*` → `tests/fixtures/*`
- `@helpers/*` → `tests/helpers/*`
- `@models/*` → `tests/models/*`
- `@data/*` → `tests/data/*`
- `@schemas/*` → `tests/schemas/*`
- `@pages/*` → `tests/pages/*`

### Naming

**Case conventions:**

| What | Case | Examples |
|---|---|---|
| Files (all `.ts`) | camelCase | `articleApi.ts`, `envConfig.ts`, `schemaValidator.ts` |
| Folders | lowercase (single word preferred) | `helpers/`, `models/`, `schemas/`, `api/` |
| Multi-word folders | camelCase (consistent with files) | `pageObjects/`, `testData/` |
| Classes | PascalCase | `ArticleApi`, `RequestHandler`, `ApiLogger` |
| Interfaces / Types | PascalCase | `UserResponse`, `ArticlePayload`, `GetArticlesParams` |
| Functions / methods | camelCase | `createArticlePayload()`, `getArticlesResponse()` |
| Constants (env/config) | SCREAMING_SNAKE_CASE | `BASE_URL`, `TEST_USER_EMAIL` |
| Constants (module-level objects) | camelCase | `testUser`, `env`, `articleSchema` |
| Fixture names | camelCase | `articleApi`, `authApi`, `articleCleanup`, `loginUser` |
| Tags | lowercase with `@` | `@smoke`, `@regression`, `@schema` |

> **Never use kebab-case** for project files or folders. kebab-case is for npm
> package names only (e.g., `typescript-eslint`). All project files — camelCase.

**Singular vs plural:**

| What | Number | Rule | Examples |
|---|---|---|---|
| Collection folders | Plural | Contains many items of same type | `helpers/`, `models/`, `schemas/`, `fixtures/`, `pages/` |
| Domain folders | Singular | Represents one area/feature | `api/`, `ui/`, `auth/` |
| Subfolders for test types | Plural | Contains specs grouped by type | `api/schemas/` (schema validation specs) |
| Model files | Singular | One file = one resource | `article.ts`, `user.ts`, `profile.ts` |
| Helper files | Singular | One file = one class/module | `articleApi.ts`, `schemaValidator.ts` |
| Schema definition files | Plural | One file = multiple schemas per resource | `articleSchemas.ts`, `profileSchemas.ts` |
| Resource test specs | Plural | Maps to REST endpoint | `articles.spec.ts`, `profiles.spec.ts`, `tags.spec.ts` |
| Feature/cross-resource specs | Singular | Groups by feature, not resource | `auth.spec.ts`, `smoke.spec.ts` |
| Data/factory files | Singular | One file = one factory/dataset | `articleFactory.ts`, `testUser.ts` |

### TypeScript Practices
- `strict: true` — always
- Prefer `interface` for API response/request shapes
- **`interface` + factory function vs `class`** for data models: use `interface` + factory
  (`createCustomer(overrides?: Partial<Customer>)`) when the model is pure data (no methods).
  Use `class` only when the model has behavior (methods) or needs `instanceof` checks.
- Use `type` for unions, utility combinations, and non-object types
- Type API responses explicitly — don't rely on `any`
- Use `unknown` over `any` when type is uncertain, then narrow
- `as const` for fixed test data and enums
- Path aliases — see full list in the Structure section above
- **Parameter properties** — always use constructor shorthand
  (`constructor(public name: string)`) instead of declaring fields + assigning in constructor.
  The verbose style is non-idiomatic "Java-style" TypeScript.
- **Class member visibility** — choose modifiers based on the class role:
  - Data models (Customer, User, OrderPayload) → `public` fields — tests need full access
  - API clients, helpers → `private readonly` for config, `private` for internal state
  - Config classes → `readonly` fields
  - Page Objects → `private readonly` for Page, public methods only
- **Getters/setters** — only when there is logic on read/write (computed values, env lookup).
  Never wrap a plain field in a getter just for "encapsulation".
- **`#privateField`** — do not use JS runtime private fields. `private` keyword is sufficient
  for a test framework (no external consumers bypassing TS).

### Playwright Practices
- Use `test.describe` to group related tests
- Use `test.beforeAll` / `test.beforeEach` for shared setup (auth, base URL)
- Use custom fixtures for reusable test context (API clients, auth tokens, pages)
- Use `expect` with Playwright's built-in assertions
- Keep tests independent — no test should depend on another test's result
- Name tests descriptively: `test('GET /users returns 200 and list of users', ...)`
- **Idiomatic API usage** — when showing or reviewing code, always use the most specific
  method/matcher the framework provides, and explain WHY it's preferred over the generic
  alternative (better error messages, async safety, semantic clarity, etc.).

## Playwright Concepts to Explain in Detail When They Come Up

The user has not read Playwright docs. When any of these appear, explain thoroughly:

- **Fixtures** — what they are, test-scoped vs worker-scoped, `{ auto: true }`,
  setup/teardown via `use()`, how they compose, how they differ from beforeEach
- **`request` fixture** — built-in APIRequestContext for API testing
- **`test.use()`** — per-test/per-describe config overrides (storageState, baseURL, etc.)
- **`test.step()`** — structuring tests into named steps for reports
- **Tags & annotations** — `@smoke`, `@regression`, `test.skip()`, `test.fixme()`,
  `{ tag: [...], annotation: {...} }` syntax
- **`storageState`** — persisting auth between tests (cookies, localStorage)
- **Global setup/teardown** — `globalSetup` / `globalTeardown` in config
- **Projects** — not just browsers; can represent environments, roles, test suites
- **Config cascade** — global `use` → project `use` → `test.use()` → fixture
- **Page Object Model** — class with `Page` injected, locators as properties (for UI)
- **Locators & auto-wait** — Playwright's approach to element selection (for UI)

## Design Patterns & Principles (for Test Frameworks)

Don't dump these — bring up naturally when the user's code touches on them.
Focus on **TS/Playwright-specific implementation** of each pattern.

### Principles — always apply:
- **DRY** — extract shared logic into helpers, fixtures, base classes. But don't over-abstract:
  test readability > DRY purity.
- **KISS** — simplest solution that handles the requirements. No over-engineering.
- **YAGNI** — don't build for hypothetical future requirements.
- **Single Responsibility** — one helper = one job, one fixture = one concern.

### Patterns — mention when the code genuinely uses them:
- **Service Object / API Client** — typed wrapper around `APIRequestContext` for each API
  domain (UserApi, OrderApi).
- **Factory / Builder** — test data generation (`createUser()`, `buildOrderPayload(overrides)`).
- **Fixture (Playwright-specific)** — DI-like mechanism for test setup, teardown, and
  sharing context between tests. (See "Playwright Concepts" section for what to explain.)
- **Strategy** — swappable behavior (e.g., different auth strategies, different environment configs).
- **Page Object** — for UI tests. In Playwright: class with `Page` injected in constructor,
  locators as readonly properties, methods return `Promise<void>` or data.
- **Decorator / Wrapper** — adding logging, retry, or headers around API calls.
- **Composition over inheritance** — prefer fixtures and helper composition over deep
  class hierarchies. TS/Playwright ecosystem favors this heavily.

### How to present:
- In chat: `> **PATTERN:** [Name] — [how it applies here, TS/PW implementation detail]`
- In code files: short comment at the relevant section
- Keep it brief — 1-2 sentences. Deep dive only if asked.
- When multiple patterns apply, mention the most relevant one; ask about the rest.

## Best Practices to Mention When Relevant

**TypeScript:**
- Strict null checks, `noUncheckedIndexedAccess`
- Generics for reusable API helpers (e.g., `async get<T>(url): Promise<T>`)
- Discriminated unions for API response handling (success/error)
- `Partial`, `Pick`, `Omit` for request payload variations
- Readonly for test data that shouldn't be mutated
- `satisfies` operator for type-safe object literals with inference

**Test Framework Architecture:**
- Layered structure: tests → API clients / Page Objects → HTTP helpers → config
- Response schema validation (type-safe assertions)
- Environment-based config (base URLs, credentials via env vars / `.env`)
- Request/response logging for debugging (interceptors / custom reporters)
- Proper error messages in assertions (what was expected vs received)
- Test data isolation — each test creates its own data when possible
- Cleanup: delete/reset created resources after tests (fixtures with teardown)
- Retry logic for flaky external dependencies (not for hiding test bugs)
- Parallel-safe tests — no shared mutable state between workers
- Auth management — `storageState` for persisting sessions, setup projects for login
- Tagging strategy — `@smoke`, `@regression`, `@api`, `@ui` for selective runs in CI

## Documentation Lookup

Use **context7** MCP tool to fetch current Playwright and TypeScript documentation
when answering questions about APIs, matchers, config options, or any behavior
that may have changed between versions. Do not rely solely on training data —
verify against actual docs when precision matters.

---

## Pre-Response Checklist

**CRITICAL — review before EVERY response. Do not skip any item.**

- [ ] **Language:** response in Russian, code/terms in English
- [ ] **Theory first:** explained "what" and "why" before showing code
- [ ] **TS from scratch:** did not assume any TypeScript/Playwright knowledge
- [ ] **Callout blocks used:** `> ОБРАТИ ВНИМАНИЕ:` / `> ЗАМЕТКА:` / `> ЛУЧШАЯ ПРАКТИКА:`
  where relevant — not forced, but not skipped when applicable
- [ ] **Edge cases flagged:** proactively highlighted gotchas in the code at hand
  (assertions, async, types, API, Playwright internals)
- [ ] **Naming explained:** when introducing new files/classes/types, explained the
  naming choice via `> ЗАМЕТКА:`
- [ ] **Stayed focused:** one topic deep, not many topics wide. Asked before expanding
- [ ] **No code execution:** did NOT run tests or compiler — reasoned about correctness
- [ ] **Docs verified:** used context7 for Playwright/TS APIs when precision matters
- [ ] **Project structure respected:** imports use path aliases, files go into correct folders
