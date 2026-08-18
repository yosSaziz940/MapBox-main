# MapBox 3D Building Explorer

A Next.js web application that lets users search for addresses and view them on an interactive 3D Mapbox satellite map, with automatic building highlighting.

## Features

- **Address Search with Autocomplete** — powered by the Mapbox Search JS SDK
- **Geocoding** — converts addresses into map coordinates via the Mapbox Geocoding API
- **3D Building Visualization** — renders extruded buildings on a satellite map
- **Building Highlighting** — automatically highlights the nearest building to a search result
- **Map Controls** — zoom, rotate (bearing), and tilt (pitch) buttons

## Technology Stack

| Layer     | Technology                                                                                                      |
| --------- | --------------------------------------------------------------------------------------------------------------- |
| Framework | [Next.js](https://nextjs.org/) 15 (App Router)                                                                  |
| UI        | [React](https://react.dev/) 19                                                                                  |
| Maps      | [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/) via [react-map-gl](https://visgl.github.io/react-map-gl/) |
| Search    | [@mapbox/search-js-react](https://docs.mapbox.com/mapbox-search-js/)                                            |
| Styling   | [Tailwind CSS](https://tailwindcss.com/) 3                                                                      |
| Testing   | [Jest](https://jestjs.io/) + [React Testing Library](https://testing-library.com/)                              |
| Linting   | [ESLint](https://eslint.org/) (next/core-web-vitals)                                                            |
| CI        | [GitHub Actions](.github/workflows/ci.yml)                                                                      |

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- npm >= 9
- A [Mapbox access token](https://account.mapbox.com/access-tokens/)

### Installation

```sh
git clone https://github.com/your-username/MapBox-main.git
cd MapBox-main
npm install
```

### Environment Setup

Copy the example environment file and add your Mapbox token:

```sh
cp .env.example .env.local
```

Then edit `.env.local`:

```
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_real_token_here
```

### Run

```sh
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command         | Description                  |
| --------------- | ---------------------------- |
| `npm run dev`   | Start the development server |
| `npm run build` | Create a production build    |
| `npm start`     | Serve the production build   |
| `npm test`      | Run the Jest test suite      |
| `npm run lint`  | Run ESLint checks            |

## Verify

To confirm a clean install, test, and build cycle from a bare clone:

```sh
# Clone repository
git clone https://github.com/your-username/MapBox-main.git
cd MapBox-main

# Install dependencies
npm ci

# Set up environment (required for build)
cp .env.example .env.local
# Edit .env.local and add your NEXT_PUBLIC_MAPBOX_TOKEN

# Run full verification
npm run lint          # Check code quality
npm run format:check  # Verify formatting
npm run typecheck     # Type check
npm test -- --coverage  # Run tests with coverage enforcement (70% threshold)
npm run build         # Verify production build succeeds
```

All steps must pass with a green exit code. If any step fails, verify:

- Node.js version >= 18 (`node --version`)
- npm version >= 9 (`npm --version`)
- `.env.local` contains a valid `NEXT_PUBLIC_MAPBOX_TOKEN`
- No uncommitted changes in the working directory

**Coverage Thresholds:** All code files must meet minimum coverage thresholds (70% branches, functions, lines, statements). See `jest.config.js` for details.

## Architecture

```
MapBox-main/
├── app/
│   ├── layout.js              # Root layout with metadata
│   └── page.js                # Main page — orchestrates search, map, and controls
├── components/
│   └── MapControls.js         # Zoom / bearing / pitch button cluster
├── lib/
│   ├── geocode.js             # Mapbox Geocoding API client
│   └── buildingHighlight.js   # 3D building feature-state management
├── styles/
│   └── globals.css            # Tailwind base imports
├── __tests__/                 # Jest test suites
│   ├── components/
│   │   └── MapControls.test.js
│   └── lib/
│       ├── geocode.test.js
│       └── buildingHighlight.test.js
├── __mocks__/
│   └── mapbox-gl.js           # Mock for mapbox-gl (WebGL not available in jsdom)
├── .github/
│   ├── workflows/ci.yml       # CI pipeline: lint → test → build
│   └── dependabot.yml         # Weekly dependency updates
├── .env.example               # Template for environment variables
├── Dockerfile                 # Multi-stage production Docker build
├── jest.config.js             # Jest configuration (next/jest)
├── .eslintrc.json             # ESLint configuration
├── tailwind.config.js         # Tailwind CSS configuration
└── package.json               # Scripts, dependencies, metadata
```

### Module Responsibilities

- **`lib/geocode.js`** — Pure async function that calls the Mapbox Geocoding API. Returns a typed result object `{ ok, lng?, lat?, error? }` with input validation (rejects empty/whitespace addresses, missing tokens).
- **`lib/buildingHighlight.js`** — Manages 3D building highlighting via Mapbox feature states. Tracks the last highlighted building internally and auto-clears before new highlights.
- **`components/MapControls.js`** — Presentational component for map navigation buttons. Accepts `mapRef`, `bearing`, `pitch`, and `onViewChange` props.
- **`app/page.js`** — Orchestration layer that wires the modules together with React state and the Mapbox map instance.

## Docker

Build and run the application in a container:

```sh
docker build --build-arg NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_token -t mapbox-app .
docker run -p 3000:3000 mapbox-app
```

## Logging

The application includes structured logging via `lib/logger.js`. All error paths and key operations are instrumented with the `createLogger` factory:

```javascript
import { createLogger } from "../lib/logger";

const logger = createLogger("my-module");

logger.debug("Operation started", { context });
logger.info("Operation completed");
logger.warn("Unexpected condition", { detail });
logger.error("Operation failed", { error: e.message });
```

Logs are emitted to the browser console with a consistent `[MapBox] [module-name]` prefix and structured context object. All error scenarios in `app/page.js` automatically log to aid debugging and production monitoring.

## Testing & Coverage

Run the test suite with coverage:

```sh
npm test -- --coverage
```

Coverage reports are generated in `coverage/`. The project enforces **70% minimum coverage** across:

- Branches
- Functions
- Lines
- Statements

All new features and bug fixes must include corresponding tests to maintain or improve coverage. See `__tests__/` directory for examples.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes in small, focused commits with tests
4. Run `npm test && npm run lint` to verify
5. Open a Pull Request

## License

This project is private. See [package.json](package.json) for details.
