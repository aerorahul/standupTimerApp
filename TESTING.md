# Testing the Standup Timer App

This document explains how to run and verify the tests for the Standup Timer application.

## Test Methods

### 1. Jest Tests (Recommended - requires Node.js)

If you have Node.js installed:

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### 2. Browser-based Test Runner (No Node.js required)

For environments without Node.js:

1. Open `test-runner.html` in any modern web browser
2. The tests will run automatically and display results with visual feedback
3. Green results indicate passing tests, red indicates failures
4. Loading status and debugging information help identify any issues

### 3. Simple Node.js Test (Lightweight)

If you have Node.js but don't want to install dependencies:

```bash
node test-simple.js
```

This runs a lightweight version of the core tests without Jest.

## Test Structure

### Core Function Tests (`tests/timer-core.test.js`)

Tests the extracted core functions:
- `shuffleArray()` - Array randomization using Fisher-Yates algorithm
- `calculateTimePerPerson()` - Time distribution calculations
- `formatTime()` - Time display formatting (MM:SS)
- `calculateProgress()` - Progress percentage calculations
- `validateParticipantNames()` - Input validation and default name generation
- `hasNextParticipant()` - Navigation logic
- `getNextParticipant()` - Participant selection logic

### TimerState Class Tests

Tests the state management class:
- Initialization and default values
- Participant management
- Time calculations
- Speaker navigation
- Overtime handling
- State transitions and resets

### DOM Integration Tests (`tests/dom-integration.test.js`)

Tests DOM manipulation and UI interactions:
- Element visibility toggles
- Modal show/hide operations
- Input event handling
- Button state management
- Progress bar updates
- Form validation

## Test Coverage

The test suite aims for comprehensive coverage of:
- ✅ All core utility functions
- ✅ State management class
- ✅ DOM manipulation
- ✅ Edge cases and error conditions
- ✅ Input validation
- ✅ Timer transitions

## Common Issues and Solutions

### "Node not found" error
- Install Node.js from [nodejs.org](https://nodejs.org/)
- Or use the browser-based test runner instead

### "npm not found" error
- npm comes with Node.js installation
- Or use the browser-based test runner instead

### Tests failing in browser
- Check browser console for JavaScript errors
- Ensure all files are served from a web server (not file://)
- Modern browser with ES6+ support required

### Jest tests failing
- Run `npm install` to ensure dependencies are installed
- Check that all test files are in the `tests/` directory
- Verify Jest configuration in `package.json`

## Continuous Integration

The project includes GitHub Actions workflow (`.github/workflows/test.yml`) that:
- Runs tests automatically on push/pull requests
- Tests against multiple Node.js versions (18.x, 20.x)
- Generates coverage reports
- Integrates with Codecov for coverage tracking

## Writing New Tests

When adding new functionality:

1. **Add to `tests/timer-core.js`** - Extract testable functions
2. **Add to `tests/timer-core.test.js`** - Write Jest unit tests
3. **Add to `test-runner.html`** - Add browser-compatible tests
4. **Update `test-simple.js`** - Add to lightweight test suite

Follow existing patterns for consistent test structure and naming.