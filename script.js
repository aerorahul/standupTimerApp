/**
 * Standup Timer Application
 *
 * A customizable timer application for managing standup meetings with the following features:
 * - Dynamic participant management with randomized speaking order
 * - Configurable meeting length with automatic time per person calculation
 * - Optional overtime functionality with user prompts
 * - 3-second startup countdown for first speaker
 * - Visual progress tracking and speaker information display
 * - Pause/resume, manual next speaker, and reset functionality
 *
 * Main Components:
 * 1. Setup Phase: Configure meeting parameters and participant names
 * 2. Startup Countdown: 3-second warning before first speaker begins
 * 3. Active Timer: Main countdown with speaker rotation
 * 4. Overtime Mode: Optional extended time with visual indicators
 * 5. Modal Dialogs: User interactions for overtime decisions and startup countdown
 */

document.addEventListener('DOMContentLoaded', () => {

    // ===== DOM ELEMENT REFERENCES =====

    // Setup section elements - Initial configuration interface
    const meetingLengthInput = document.getElementById('meeting-length');
    const numParticipantsInput = document.getElementById('num-participants');
    const participantNamesContainer = document.getElementById('participant-names-container');
    const startBtn = document.getElementById('start-btn');

    // Timer section elements - Active timer interface
    const setupSection = document.getElementById('setup-section');
    const timerSection = document.getElementById('timer-section');
    const timerDisplay = document.getElementById('timer-display');
    const currentSpeakerSpan = document.getElementById('current-speaker');
    const nextSpeakerSpan = document.getElementById('next-speaker');
    const nextSpeakerLine = document.getElementById('next-speaker-line'); // Hidden when on last speaker
    const progressBar = document.getElementById('progress-bar');
    const pauseResumeBtn = document.getElementById('pause-resume-btn');
    const nextBtn = document.getElementById('next-btn');
    const resetBtn = document.getElementById('reset-btn');

    // Overtime modal elements - Appears when speaker time expires
    const overtimeModal = document.getElementById('overtime-modal');
    const modalMessage = document.getElementById('modal-message');
    const modalCountdownSeconds = document.getElementById('countdown-seconds');
    const modalOvertimeBtn = document.getElementById('modal-overtime-btn');
    const modalNextBtn = document.getElementById('modal-next-btn');

    // Startup modal elements - 3-second countdown before first speaker
    const startupModal = document.getElementById('startup-modal');
    const startupSpeakerName = document.getElementById('startup-speaker-name');
    const startupCountdownDisplay = document.getElementById('startup-countdown-display');

    // ===== APPLICATION STATE VARIABLES =====

    let timer;                      // Main interval timer for countdown/countup
    let participants = [];          // Array of participant names (shuffled)
    let timePerPerson;             // Calculated seconds each person gets
    let currentSpeakerTimeLeft;    // Remaining seconds for current speaker
    let currentParticipantIndex = 0; // Index of current speaker in participants array
    let isPaused = false;          // Timer pause state
    let allowOvertime = false;     // User preference for overtime prompts
    let isInOvertime = false;      // Current speaker is in overtime mode
    let overtimeSeconds = 0;       // Seconds elapsed in overtime
    let modalCountdownTimer = null; // Timer for 5-second auto-advance in overtime modal
    let modalCountdown = 5;        // Countdown value for overtime modal auto-advance
    let startupCountdown = 0;      // 3-second startup countdown value
    let isStartupCountdown = false; // Flag indicating startup countdown is active

    // ===== SETUP PHASE EVENT HANDLERS =====

    /**
     * Dynamically creates participant name input fields based on number selected
     * Updates immediately when participant count changes
     */
    numParticipantsInput.addEventListener('input', () => {
        const num = parseInt(numParticipantsInput.value);
        participantNamesContainer.innerHTML = '';
        for (let i = 0; i < num; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = `Participant ${i + 1} Name`;
            input.className = 'participant-name';
            participantNamesContainer.appendChild(input);
        }
    });

    // Initialize participant input fields on page load
    numParticipantsInput.dispatchEvent(new Event('input'));

    /**
     * Start button handler - Initializes standup timer
     * 1. Validates inputs and calculates time per person
     * 2. Shuffles participant order for randomization
     * 3. Switches from setup to timer interface
     * 4. Begins startup countdown sequence
     */
    startBtn.addEventListener('click', () => {
        const meetingLength = parseInt(meetingLengthInput.value);
        const nameInputs = document.querySelectorAll('.participant-name');
        participants = Array.from(nameInputs).map(input => input.value.trim() || `Participant ${participants.length + 1}`);
        allowOvertime = document.getElementById('allow-overtime').checked;

        if (meetingLength > 0 && participants.length > 0) {
            // Calculate time per person in seconds
            timePerPerson = Math.floor((meetingLength * 60) / participants.length);
            currentSpeakerTimeLeft = timePerPerson;

            shuffleArray(participants); // Randomize speaking order
            setupSection.style.display = 'none';
            timerSection.style.display = 'block';
            startCountdown(); // Begin 3-second startup sequence
        }
    });

    // ===== TIMER CONTROL EVENT HANDLERS =====

    /**
     * Pause/Resume button handler
     * Toggles timer state and updates button text accordingly
     */
    pauseResumeBtn.addEventListener('click', () => {
        isPaused = !isPaused;
        pauseResumeBtn.textContent = isPaused ? 'Resume' : 'Pause';
    });

    /**
     * Next speaker button handler
     * Manually advances to next speaker (works in normal and overtime modes)
     */
    nextBtn.addEventListener('click', () => {
        goToNextSpeaker();
    });

    /**
     * Reset button handler - Returns to setup phase
     * Clears all timers, resets state variables, and shows setup interface
     */
    resetBtn.addEventListener('click', () => {
        clearInterval(timer);
        timerSection.style.display = 'none';
        setupSection.style.display = 'block';
        isPaused = false;
        isInOvertime = false;
        isStartupCountdown = false;
        overtimeSeconds = 0;
        startupCountdown = 0;
        pauseResumeBtn.textContent = 'Pause';
        currentParticipantIndex = 0;
        progressBar.style.width = '0%';
        timerDisplay.classList.remove('overtime');
        nextBtn.classList.remove('overtime-active');
        resetBtn.style.display = 'inline-block';
        startupModal.style.display = 'none';
    });

    // ===== TIMER LIFECYCLE FUNCTIONS =====

    /**
     * Startup countdown sequence - 3-second warning before first speaker
     * 1. Shows modal with first speaker's name
     * 2. Counts down from 3 to 1, then shows "GO!"
     * 3. Closes modal and begins normal timer operation
     */
    function startCountdown() {
        startupCountdown = 3;
        isStartupCountdown = true;
        currentParticipantIndex = 0;
        updateSpeakerInfo();
        updateProgressBar();

        // Display startup modal with speaker name and countdown
        startupSpeakerName.textContent = participants[currentParticipantIndex];
        startupCountdownDisplay.textContent = startupCountdown;
        startupModal.style.display = 'flex';

        // Main timer loop handling startup countdown and normal operation
        timer = setInterval(() => {
            if (isStartupCountdown) {
                startupCountdown--;
                if (startupCountdown > 0) {
                    startupCountdownDisplay.textContent = startupCountdown;
                } else {
                    startupCountdownDisplay.textContent = "GO!";
                    // Brief pause to show "GO!" before starting timer
                    setTimeout(() => {
                        startupModal.style.display = 'none';
                        isStartupCountdown = false;
                        startTimer();
                    }, 500);
                }
            } else if (!isPaused) {
                if (isInOvertime) {
                    // Overtime mode: count up from 0
                    overtimeSeconds++;
                    updateTimerDisplay();
                } else {
                    // Normal mode: count down to 0
                    currentSpeakerTimeLeft--;
                    updateTimerDisplay();
                    if (currentSpeakerTimeLeft <= 0) {
                        handleTimeExpired();
                    }
                }
            }
        }, 1000);
    }

    /**
     * Begins normal timer operation after startup countdown
     * Simply updates display as timer loop is already running
     */
    function startTimer() {
        updateTimerDisplay();
    }

    /**
     * Handles speaker time expiration
     * If overtime allowed: shows overtime modal with 5-second auto-advance
     * If overtime not allowed: immediately moves to next speaker
     */
    function handleTimeExpired() {
        if (allowOvertime) {
            isPaused = true;
            pauseResumeBtn.textContent = 'Resume';
            showOvertimeModal();
        } else {
            goToNextSpeaker();
        }
    }

    // ===== OVERTIME MODAL FUNCTIONS =====

    /**
     * Shows overtime decision modal with auto-advance countdown
     * Gives user 5 seconds to decide between overtime or next speaker
     * Auto-advances to next speaker if no choice made
     */
    function showOvertimeModal() {
        modalCountdown = 5;
        modalMessage.textContent = `Time's up for ${participants[currentParticipantIndex]}!`;
        modalCountdownSeconds.textContent = modalCountdown;
        overtimeModal.style.display = 'flex';

        // 5-second countdown with auto-advance
        modalCountdownTimer = setInterval(() => {
            modalCountdown--;
            modalCountdownSeconds.textContent = modalCountdown;

            if (modalCountdown <= 0) {
                // Auto-advance to next speaker when countdown expires
                closeOvertimeModal();
                isPaused = false;
                pauseResumeBtn.textContent = 'Pause';
                goToNextSpeaker();
            }
        }, 1000);
    }

    /**
     * Closes overtime modal and cleans up countdown timer
     */
    function closeOvertimeModal() {
        if (modalCountdownTimer) {
            clearInterval(modalCountdownTimer);
            modalCountdownTimer = null;
        }
        overtimeModal.style.display = 'none';
    }

    // ===== OVERTIME MODAL EVENT HANDLERS =====

    /**
     * Allow Overtime button handler
     * Enables overtime mode with visual indicators and hides reset button
     */
    modalOvertimeBtn.addEventListener('click', () => {
        closeOvertimeModal();
        isInOvertime = true;
        overtimeSeconds = 0;
        timerDisplay.classList.add('overtime'); // Red timer color
        nextBtn.classList.add('overtime-active'); // Pulsing next button
        resetBtn.style.display = 'none'; // Hide reset button in overtime
        isPaused = false;
        pauseResumeBtn.textContent = 'Pause';
    });

    /**
     * Next Speaker button handler in overtime modal
     * Immediately moves to next speaker without enabling overtime
     */
    modalNextBtn.addEventListener('click', () => {
        closeOvertimeModal();
        isPaused = false;
        pauseResumeBtn.textContent = 'Pause';
        goToNextSpeaker();
    });

    // ===== SPEAKER TRANSITION FUNCTIONS =====

    /**
     * Advances to next speaker or ends standup
     * 1. Resets overtime state and visual indicators
     * 2. Checks if more speakers remain
     * 3. Updates speaker info, progress, and timer display
     */
    function goToNextSpeaker() {
        currentParticipantIndex++;
        isInOvertime = false;
        overtimeSeconds = 0;
        timerDisplay.classList.remove('overtime');
        nextBtn.classList.remove('overtime-active');
        resetBtn.style.display = 'inline-block'; // Show reset button

        if (currentParticipantIndex >= participants.length) {
            // All speakers finished - end standup
            clearInterval(timer);
            alert("Standup Over!");
            resetBtn.click(); // Return to setup
            return;
        }

        // Set up next speaker
        currentSpeakerTimeLeft = timePerPerson;
        updateSpeakerInfo();
        updateProgressBar();
        updateTimerDisplay();
    }

    // ===== DISPLAY UPDATE FUNCTIONS =====

    /**
     * Updates the main timer display
     * Shows MM:SS format for normal countdown
     * Shows +MM:SS format for overtime (red color applied via CSS)
     */
    function updateTimerDisplay() {
        if (isInOvertime) {
            // Overtime format: +MM:SS
            const minutes = Math.floor(overtimeSeconds / 60);
            const seconds = overtimeSeconds % 60;
            timerDisplay.textContent = `+${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        } else {
            // Normal countdown format: MM:SS
            const minutes = Math.floor(currentSpeakerTimeLeft / 60);
            const seconds = currentSpeakerTimeLeft % 60;
            timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        }
    }

    /**
     * Updates speaker information display
     * Shows current speaker and next speaker (if not last)
     * Hides "Up Next" line when on final speaker to prevent layout shift
     */
    function updateSpeakerInfo() {
        currentSpeakerSpan.textContent = participants[currentParticipantIndex];
        const nextParticipant = participants[currentParticipantIndex + 1];

        if (nextParticipant) {
            nextSpeakerSpan.textContent = nextParticipant;
            nextSpeakerLine.style.visibility = 'visible';
        } else {
            // Hide "Up Next" line for last speaker (maintains layout height)
            nextSpeakerLine.style.visibility = 'hidden';
        }
    }

    /**
     * Updates progress bar to show standup completion percentage
     * Based on number of speakers who have completed their time
     */
    function updateProgressBar() {
        const progress = ((currentParticipantIndex) / participants.length) * 100;
        progressBar.style.width = `${progress}%`;
    }

    // ===== UTILITY FUNCTIONS =====

    /**
     * Fisher-Yates shuffle algorithm for randomizing participant order
     * Ensures fair and unpredictable speaking sequence each standup
     */
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
});
