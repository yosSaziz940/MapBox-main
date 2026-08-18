# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned

- User authentication and saved search history
- Custom 3D building styling themes

## [1.0.0] - 2026-08-18

### Added

- **Address Search & Autocomplete**: Integrated `@mapbox/search-js-react` with Mapbox Geocoding API v6 fallback.
- **3D Building Highlighting**: Dynamic feature-state selection for extruded building models.
- **Interactive Map Controls**: Zoom, rotation (bearing), and tilt (pitch) control cluster component.
- **Modular Architecture**: Extracted `lib/geocode.js`, `lib/buildingHighlight.js`, `lib/mapLayers.js`, `lib/useMapView.js`, and `lib/validation.js`.
- **Structured Error Handling**: `GeocodeErrorCode` enum and explicit validation helpers.
- **Test Suite**: Jest and React Testing Library setup with unit & integration tests (100% component and module coverage).
- **TypeScript Support**: Added `jsconfig.json` with `checkJs: true` for JSDoc typechecking.
- **CI/CD Pipeline**: GitHub Actions workflow (`.github/workflows/ci.yml`) running dependency audit, linting, typechecking, coverage test gates, and build.
- **Containerization**: Added `Dockerfile`, `.dockerignore`, and `docker-compose.yml` for isolated container execution.
- **Documentation**: Expanded README.md, added `.env.example`, `CONTRIBUTING.md`, and `CHANGELOG.md`.
