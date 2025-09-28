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

    // State variables
    let timer;
    let participants = [];
    let timePerPerson;
    let currentSpeakerTimeLeft;
    let currentParticipantIndex = 0;
    let isPaused = false;

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
        pauseResumeBtn.textContent = 'Pause';
        currentParticipantIndex = 0;
        progressBar.style.width = '0%';
    });

    function startTimer() {
        currentParticipantIndex = 0;
        updateSpeakerInfo();
        updateProgressBar();
        updateTimerDisplay();

        timer = setInterval(() => {
            if (!isPaused) {
                currentSpeakerTimeLeft--;
                updateTimerDisplay();
                if (currentSpeakerTimeLeft <= 0) {
                    goToNextSpeaker();
                }
            }
        }, 1000);
    }

    function goToNextSpeaker() {
        currentParticipantIndex++;
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
        const minutes = Math.floor(currentSpeakerTimeLeft / 60);
        const seconds = currentSpeakerTimeLeft % 60;
        timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
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
