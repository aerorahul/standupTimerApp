document.addEventListener('DOMContentLoaded', () => {
    // Setup section elements
    const meetingLengthInput = document.getElementById('meeting-length');
    const numParticipantsInput = document.getElementById('num-participants');
    const participantNamesContainer = document.getElementById('participant-names-container');
    const startBtn = document.getElementById('start-btn');

    // Timer section elements
    const setupSection = document.getElementById('setup-section');
    const timerSection = document.getElementById('timer-section');
    const timerDisplay = document.getElementById('timer-display');
    const currentSpeakerSpan = document.getElementById('current-speaker');
    const nextSpeakerSpan = document.getElementById('next-speaker');
    const progressBar = document.getElementById('progress-bar');
    const pauseResumeBtn = document.getElementById('pause-resume-btn');
    const nextBtn = document.getElementById('next-btn'); // New button
    const resetBtn = document.getElementById('reset-btn');

    // Modal elements
    const overtimeModal = document.getElementById('overtime-modal');
    const modalMessage = document.getElementById('modal-message');
    const modalCountdownSeconds = document.getElementById('countdown-seconds');
    const modalOvertimeBtn = document.getElementById('modal-overtime-btn');
    const modalNextBtn = document.getElementById('modal-next-btn');

    // State variables
    let timer;
    let participants = [];
    let timePerPerson;
    let currentSpeakerTimeLeft;
    let currentParticipantIndex = 0;
    let isPaused = false;
    let allowOvertime = false;
    let isInOvertime = false;
    let overtimeSeconds = 0;
    let modalCountdownTimer = null;
    let modalCountdown = 5;

    // Dynamically create participant name inputs
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

    numParticipantsInput.dispatchEvent(new Event('input'));

    // Start the standup
    startBtn.addEventListener('click', () => {
        const meetingLength = parseInt(meetingLengthInput.value);
        const nameInputs = document.querySelectorAll('.participant-name');
        participants = Array.from(nameInputs).map(input => input.value.trim() || `Participant ${participants.length + 1}`);
        allowOvertime = document.getElementById('allow-overtime').checked;

        if (meetingLength > 0 && participants.length > 0) {
            // Calculate time per person
            timePerPerson = Math.floor((meetingLength * 60) / participants.length);
            currentSpeakerTimeLeft = timePerPerson;

            shuffleArray(participants);
            setupSection.style.display = 'none';
            timerSection.style.display = 'block';
            startTimer();
        }
    });

    // Pause or resume the timer
    pauseResumeBtn.addEventListener('click', () => {
        isPaused = !isPaused;
        pauseResumeBtn.textContent = isPaused ? 'Resume' : 'Pause';
    });

    // Go to the next speaker
    nextBtn.addEventListener('click', () => {
        goToNextSpeaker();
    });

    // Reset the timer
    resetBtn.addEventListener('click', () => {
        clearInterval(timer);
        timerSection.style.display = 'none';
        setupSection.style.display = 'block';
        isPaused = false;
        isInOvertime = false;
        overtimeSeconds = 0;
        pauseResumeBtn.textContent = 'Pause';
        currentParticipantIndex = 0;
        progressBar.style.width = '0%';
        timerDisplay.classList.remove('overtime');
        nextBtn.classList.remove('overtime-active');
        resetBtn.style.display = 'inline-block'; // Ensure reset button is visible
    });

    function startTimer() {
        currentParticipantIndex = 0;
        updateSpeakerInfo();
        updateProgressBar();
        updateTimerDisplay();

        timer = setInterval(() => {
            if (!isPaused) {
                if (isInOvertime) {
                    // In overtime mode, count up
                    overtimeSeconds++;
                    updateTimerDisplay();
                } else {
                    // Normal countdown
                    currentSpeakerTimeLeft--;
                    updateTimerDisplay();
                    if (currentSpeakerTimeLeft <= 0) {
                        handleTimeExpired();
                    }
                }
            }
        }, 1000);
    }

    function handleTimeExpired() {
        if (allowOvertime) {
            // Pause and show modal
            isPaused = true;
            pauseResumeBtn.textContent = 'Resume';
            showOvertimeModal();
        } else {
            // No overtime allowed, move to next speaker
            goToNextSpeaker();
        }
    }

    function showOvertimeModal() {
        modalCountdown = 5;
        modalMessage.textContent = `Time's up for ${participants[currentParticipantIndex]}!`;
        modalCountdownSeconds.textContent = modalCountdown;
        overtimeModal.style.display = 'flex';

        // Start countdown
        modalCountdownTimer = setInterval(() => {
            modalCountdown--;
            modalCountdownSeconds.textContent = modalCountdown;

            if (modalCountdown <= 0) {
                // Auto-advance to next speaker
                closeOvertimeModal();
                isPaused = false;
                pauseResumeBtn.textContent = 'Pause';
                goToNextSpeaker();
            }
        }, 1000);
    }

    function closeOvertimeModal() {
        if (modalCountdownTimer) {
            clearInterval(modalCountdownTimer);
            modalCountdownTimer = null;
        }
        overtimeModal.style.display = 'none';
    }

    // Modal button handlers
    modalOvertimeBtn.addEventListener('click', () => {
        closeOvertimeModal();
        // User chose overtime
        isInOvertime = true;
        overtimeSeconds = 0;
        timerDisplay.classList.add('overtime');
        nextBtn.classList.add('overtime-active');
        resetBtn.style.display = 'none'; // Hide reset button in overtime
        isPaused = false;
        pauseResumeBtn.textContent = 'Pause';
    });

    modalNextBtn.addEventListener('click', () => {
        closeOvertimeModal();
        // User chose to move to next speaker
        isPaused = false;
        pauseResumeBtn.textContent = 'Pause';
        goToNextSpeaker();
    });

    function goToNextSpeaker() {
        currentParticipantIndex++;
        isInOvertime = false;
        overtimeSeconds = 0;
        timerDisplay.classList.remove('overtime');
        nextBtn.classList.remove('overtime-active');
        resetBtn.style.display = 'inline-block'; // Show reset button when leaving overtime

        if (currentParticipantIndex >= participants.length) {
            clearInterval(timer);
            alert("Standup Over!");
            resetBtn.click(); // Programmatically click reset
            return;
        }
        // Reset timer for the next person
        currentSpeakerTimeLeft = timePerPerson;
        updateSpeakerInfo();
        updateProgressBar();
        updateTimerDisplay();
    }

    function updateTimerDisplay() {
        if (isInOvertime) {
            // Show overtime with + sign
            const minutes = Math.floor(overtimeSeconds / 60);
            const seconds = overtimeSeconds % 60;
            timerDisplay.textContent = `+${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        } else {
            // Normal countdown
            const minutes = Math.floor(currentSpeakerTimeLeft / 60);
            const seconds = currentSpeakerTimeLeft % 60;
            timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        }
    }

    function updateSpeakerInfo() {
        currentSpeakerSpan.textContent = participants[currentParticipantIndex];
        nextSpeakerSpan.textContent = participants[currentParticipantIndex + 1] || 'None';
    }

    function updateProgressBar() {
        const progress = ((currentParticipantIndex) / participants.length) * 100;
        progressBar.style.width = `${progress}%`;
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
});
