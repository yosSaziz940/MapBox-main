# Contributing Guidelines

Thank you for contributing to the **MapBox 3D Building Explorer**! To maintain quality, test coverage, and clear git history, please follow these guidelines.

---

## 🚀 Getting Started

1. **Fork & Clone** the repository:

   ```sh
   git clone https://github.com/your-username/MapBox-main.git
   cd MapBox-main
   npm install
   ```

2. **Environment Setup**:
   Copy `.env.example` to `.env.local` and add your Mapbox API token:

   ```sh
   cp .env.example .env.local
   ```

3. **Branch Naming**:
   Use descriptive branch names:
   - `feat/feature-name` (e.g. `feat/pitch-reset`)
   - `fix/bug-description` (e.g. `fix/geocode-timeout`)
   - `docs/doc-update` (e.g. `docs/contributing`)

---

## 🧪 Commit & Testing Standards

### 1. Ship Features Together with Their Tests

Every feature, module, or fix **MUST** be committed alongside its corresponding test file in `__tests__/`. For example:

- Changes in `lib/myModule.js` require matching tests in `__tests__/lib/myModule.test.js` in the same commit.

### 2. Focused Incremental Commits

- Keep commits small, self-contained, and focused on one logical unit of work.
- Use conventional commit messages:
  - `feat(map): add pitch reset button`
  - `fix(geocode): handle HTTP 429 rate limit`
  - `test(page): add integration test for search flow`
  - `docs: update deployment instructions`

### 3. Local Verification Gate

Before committing or opening a Pull Request, run the full verification gate locally:

```sh
npm test -- --coverage
npm run lint
npm run typecheck
npm run build
```

All commands **must exit with code 0** and pass the minimum coverage thresholds (70% lines, functions, branches, statements).

---

## 🔀 Pull Request Process

1. Ensure all local verification steps pass.
2. Push your branch and open a Pull Request targeting `main`.
3. GitHub Actions CI will automatically run the audit, lint, typecheck, coverage tests, and production build checks.
4. Once CI passes and code review is complete, your PR will be merged.
