/**
 * Test setup file for Jest
 * Sets up DOM testing environment and global utilities
 */

// Import jest-dom matchers
require('@testing-library/jest-dom');

// Mock global functions
global.alert = jest.fn();
global.confirm = jest.fn();

// Mock timers
beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

// Helper function to create a mock DOM environment
global.createMockDOM = () => {
  document.body.innerHTML = `
    <div class="container">
      <h1>Standup Timer</h1>

      <div id="setup-section">
        <div class="form-group">
          <label for="meeting-length">Meeting Length (minutes):</label>
          <input type="number" id="meeting-length" min="1" value="15">
        </div>
        <div class="form-group">
          <label for="num-participants">Number of Participants:</label>
          <input type="number" id="num-participants" min="1" value="5">
        </div>
        <div class="form-group">
          <label for="participant-names">Participant Names:</label>
          <div id="participant-names-container"></div>
        </div>
        <div class="form-group">
          <label>
            <input type="checkbox" id="allow-overtime">
            Allow overtime (prompt before moving to next speaker)
          </label>
        </div>
        <button id="start-btn">Start Standup</button>
      </div>

      <div id="timer-section" style="display: none;">
        <div id="timer-display">03:00</div>
        <div class="speaker-info">
          <p><strong>Now Speaking:</strong> <span id="current-speaker"></span></p>
          <p id="next-speaker-line"><strong>Up Next:</strong> <span id="next-speaker"></span></p>
        </div>
        <div id="progress-bar-container">
          <div id="progress-bar"></div>
        </div>
        <div class="controls">
          <button id="pause-resume-btn">Pause</button>
          <button id="next-btn">Next</button>
          <button id="reset-btn">Reset</button>
        </div>
      </div>
    </div>

    <div id="overtime-modal" class="modal" style="display: none;">
      <div class="modal-content">
        <h2>Time's Up!</h2>
        <p id="modal-message"></p>
        <p id="modal-countdown">Auto-advancing in <span id="countdown-seconds">5</span> seconds...</p>
        <div class="modal-buttons">
          <button id="modal-overtime-btn" class="modal-btn overtime-btn">Allow Overtime</button>
          <button id="modal-next-btn" class="modal-btn next-btn">Next Speaker</button>
        </div>
      </div>
    </div>

    <div id="startup-modal" class="modal" style="display: none;">
      <div class="modal-content startup-modal-content">
        <h2 id="startup-speaker-name"></h2>
        <p>Get ready to speak!</p>
        <div id="startup-countdown-display">3</div>
      </div>
    </div>
  `;

  // Add mock logic for participant input generation
  const numParticipantsInput = document.getElementById('num-participants');
  const container = document.getElementById('participant-names-container');

  numParticipantsInput.addEventListener('input', function() {
    const numParticipants = parseInt(this.value) || 0;
    container.innerHTML = '';

    for (let i = 1; i <= numParticipants; i++) {
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'participant-name';
      input.placeholder = `Participant ${i} Name`;
      input.id = `participant-${i}`;
      container.appendChild(input);
    }
  });
};