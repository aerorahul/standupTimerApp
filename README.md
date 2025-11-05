# Standup Timer App

A customizable timer application for managing standup meetings with features like overtime handling, visual indicators, and speaker management.

## Features

- **Customizable Meeting Length**: Set the total meeting duration
- **Multiple Participants**: Support for any number of participants with custom names
- **Equal Time Distribution**: Automatically calculates time per person
- **Visual Indicators**:
  - Timer turns red and flashes during the last 10 seconds
  - Progress bar shows meeting progress
  - Overtime mode with distinctive styling
- **Overtime Management**: Optional overtime with automatic progression
- **Speaker Transitions**: 3-second countdown before each speaker starts
- **Smart UI**: Hides irrelevant information (e.g., "Up Next" for the last speaker)

## Screenshots

<p>
    <img src="assets/configure_standup.png" alt="Configure Standup Timer" width="300px" style="vertical-align:top; margin-right: 20px;" />
    <br>
    <br>
    <img src="assets/run_timer.png" alt="Control Standup Timer Running" width="300px" style="vertical-align:top; margin-right: 20px;" />
</p>

## Usage

1. **Setup**: Enter meeting length and number of participants
2. **Customize**: Add participant names (optional - defaults to "Person 1", "Person 2", etc.)
3. **Options**: Enable overtime if desired
4. **Start**: Click "Start Standup" to begin the timer
5. **Control**: Use Pause/Resume, Next, or Reset buttons as needed

## Development

### Prerequisites

- Node.js (version 18.x or 20.x)
- npm (comes with Node.js)

### Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd standupTimerApp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running Tests

The project includes a comprehensive test suite using Jest:

```bash
# Navigate to config directory first
cd config

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run lightweight Node.js tests
npm run test:simple
```

**Browser Testing (No Node.js required):**
- Open `tests/runners/test-runner.html` in any modern browser
- Tests run automatically and show immediate results with visual feedback

**Quick File Check:**
```bash
./tests/runners/check-tests.sh    # Verify all test files are ready
```

### Test Structure

- **Unit Tests**: Core functionality testing (`tests/timer-core.test.js`)
- **DOM Integration Tests**: UI interaction testing (`tests/dom-integration.test.js`)
- **Test Utilities**: Shared mocking and setup (`tests/setup.js`)

### CI/CD

The project uses GitHub Actions for continuous integration:
- Automatic testing on push/pull requests
- Multi-version Node.js testing (18.x, 20.x)
- Coverage reporting with Codecov integration

## File Structure

```
├── src/
│   ├── index.html          # Main application interface
│   ├── script.js           # Core application logic
│   └── style.css           # Styling and animations
├── assets/
│   ├── configure_standup.png  # Setup screenshot
│   └── run_timer.png          # Timer screenshot
├── tests/
│   ├── unit/
│   │   ├── timer-core.test.js     # Unit tests
│   │   └── dom-integration.test.js # DOM tests
│   ├── utils/
│   │   ├── setup.js               # Test configuration
│   │   └── timer-core.js          # Extracted testable functions
│   └── runners/
│       ├── test-runner.html       # Browser test runner
│       ├── test-simple.js         # Lightweight Node tests
│       └── check-tests.sh         # Test verification script
├── config/
│   ├── package.json        # Dependencies and scripts
│   └── package-lock.json   # Dependency lock file
└── .github/workflows/
    └── test.yml            # GitHub Actions CI
```

## Browser Support

- Modern browsers with ES6+ support
- HTML5 features required
- JavaScript enabled

## License

MIT License - see LICENSE.md for details