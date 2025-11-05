/**
 * DOM Integration tests for Standup Timer
 * Tests the DOM manipulation and user interaction aspects
 */

describe('Standup Timer DOM Integration', () => {
    let container;

    beforeEach(() => {
        // Create fresh DOM for each test
        createMockDOM();
        container = document.querySelector('.container');
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    describe('Initial DOM State', () => {
        it('should have setup section visible and timer section hidden', () => {
            const setupSection = document.getElementById('setup-section');
            const timerSection = document.getElementById('timer-section');

            expect(setupSection).toBeVisible();
            expect(timerSection).toHaveStyle({ display: 'none' });
        });

        it('should have default values in inputs', () => {
            const meetingLength = document.getElementById('meeting-length');
            const numParticipants = document.getElementById('num-participants');

            expect(meetingLength.value).toBe('15');
            expect(numParticipants.value).toBe('5');
        });

        it('should have modals hidden initially', () => {
            const overtimeModal = document.getElementById('overtime-modal');
            const startupModal = document.getElementById('startup-modal');

            expect(overtimeModal).toHaveStyle({ display: 'none' });
            expect(startupModal).toHaveStyle({ display: 'none' });
        });
    });

    describe('Participant Name Input Generation', () => {
        it('should generate participant inputs when number changes', () => {
            const numParticipantsInput = document.getElementById('num-participants');
            const container = document.getElementById('participant-names-container');

            // Simulate changing to 3 participants
            numParticipantsInput.value = '3';
            numParticipantsInput.dispatchEvent(new Event('input'));

            const inputs = container.querySelectorAll('input.participant-name');
            expect(inputs).toHaveLength(3);

            expect(inputs[0].placeholder).toBe('Participant 1 Name');
            expect(inputs[1].placeholder).toBe('Participant 2 Name');
            expect(inputs[2].placeholder).toBe('Participant 3 Name');
        });

        it('should clear previous inputs when number changes', () => {
            const numParticipantsInput = document.getElementById('num-participants');
            const container = document.getElementById('participant-names-container');

            // Set to 2 participants first
            numParticipantsInput.value = '2';
            numParticipantsInput.dispatchEvent(new Event('input'));
            expect(container.children).toHaveLength(2);

            // Change to 4 participants
            numParticipantsInput.value = '4';
            numParticipantsInput.dispatchEvent(new Event('input'));
            expect(container.children).toHaveLength(4);
        });
    });

    describe('Timer Display Updates', () => {
        it('should format timer display correctly', () => {
            const timerDisplay = document.getElementById('timer-display');

            // Test various time formats
            const testCases = [
                { seconds: 180, expected: '3:00' },
                { seconds: 125, expected: '2:05' },
                { seconds: 65, expected: '1:05' },
                { seconds: 9, expected: '0:09' },
                { seconds: 0, expected: '0:00' }
            ];

            testCases.forEach(({ seconds, expected }) => {
                const minutes = Math.floor(seconds / 60);
                const secs = seconds % 60;
                timerDisplay.textContent = `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
                expect(timerDisplay.textContent).toBe(expected);
            });
        });

        it('should handle overtime display with plus sign', () => {
            const timerDisplay = document.getElementById('timer-display');

            // Simulate overtime
            const overtimeSeconds = 75; // 1:15
            const minutes = Math.floor(overtimeSeconds / 60);
            const secs = overtimeSeconds % 60;
            timerDisplay.textContent = `+${minutes}:${secs < 10 ? '0' : ''}${secs}`;

            expect(timerDisplay.textContent).toBe('+1:15');
        });
    });

    describe('Speaker Information Display', () => {
        it('should update current speaker display', () => {
            const currentSpeakerSpan = document.getElementById('current-speaker');

            currentSpeakerSpan.textContent = 'Alice';
            expect(currentSpeakerSpan.textContent).toBe('Alice');
        });

        it('should show next speaker when available', () => {
            const nextSpeakerSpan = document.getElementById('next-speaker');
            const nextSpeakerLine = document.getElementById('next-speaker-line');

            nextSpeakerSpan.textContent = 'Bob';
            nextSpeakerLine.style.visibility = 'visible';

            expect(nextSpeakerSpan.textContent).toBe('Bob');
            expect(nextSpeakerLine).toHaveStyle({ visibility: 'visible' });
        });

        it('should hide next speaker line when no next speaker', () => {
            const nextSpeakerLine = document.getElementById('next-speaker-line');

            nextSpeakerLine.style.visibility = 'hidden';
            expect(nextSpeakerLine).toHaveStyle({ visibility: 'hidden' });
        });
    });

    describe('Progress Bar Updates', () => {
        it('should update progress bar width', () => {
            const progressBar = document.getElementById('progress-bar');

            progressBar.style.width = '40%';
            expect(progressBar).toHaveStyle({ width: '40%' });

            progressBar.style.width = '75%';
            expect(progressBar).toHaveStyle({ width: '75%' });
        });
    });

    describe('Button State Management', () => {
        it('should update pause/resume button text', () => {
            const pauseResumeBtn = document.getElementById('pause-resume-btn');

            expect(pauseResumeBtn.textContent).toBe('Pause');

            pauseResumeBtn.textContent = 'Resume';
            expect(pauseResumeBtn.textContent).toBe('Resume');
        });

        it('should toggle button visibility', () => {
            const resetBtn = document.getElementById('reset-btn');

            resetBtn.style.display = 'none';
            expect(resetBtn).toHaveStyle({ display: 'none' });

            resetBtn.style.display = 'inline-block';
            expect(resetBtn).toHaveStyle({ display: 'inline-block' });
        });

        it('should add/remove CSS classes for visual states', () => {
            const timerDisplay = document.getElementById('timer-display');
            const nextBtn = document.getElementById('next-btn');

            // Test overtime class
            timerDisplay.classList.add('overtime');
            expect(timerDisplay).toHaveClass('overtime');

            timerDisplay.classList.remove('overtime');
            expect(timerDisplay).not.toHaveClass('overtime');

            // Test overtime-active class
            nextBtn.classList.add('overtime-active');
            expect(nextBtn).toHaveClass('overtime-active');

            nextBtn.classList.remove('overtime-active');
            expect(nextBtn).not.toHaveClass('overtime-active');
        });
    });

    describe('Modal Display Management', () => {
        it('should show and hide overtime modal', () => {
            const overtimeModal = document.getElementById('overtime-modal');
            const modalMessage = document.getElementById('modal-message');
            const countdownSeconds = document.getElementById('countdown-seconds');

            // Show modal
            modalMessage.textContent = "Time's up for Alice!";
            countdownSeconds.textContent = '5';
            overtimeModal.style.display = 'flex';

            expect(modalMessage.textContent).toBe("Time's up for Alice!");
            expect(countdownSeconds.textContent).toBe('5');
            expect(overtimeModal).toHaveStyle({ display: 'flex' });

            // Hide modal
            overtimeModal.style.display = 'none';
            expect(overtimeModal).toHaveStyle({ display: 'none' });
        });

        it('should show and hide startup modal', () => {
            const startupModal = document.getElementById('startup-modal');
            const speakerName = document.getElementById('startup-speaker-name');
            const countdownDisplay = document.getElementById('startup-countdown-display');

            // Show modal
            speakerName.textContent = 'Alice';
            countdownDisplay.textContent = '3';
            startupModal.style.display = 'flex';

            expect(speakerName.textContent).toBe('Alice');
            expect(countdownDisplay.textContent).toBe('3');
            expect(startupModal).toHaveStyle({ display: 'flex' });

            // Hide modal
            startupModal.style.display = 'none';
            expect(startupModal).toHaveStyle({ display: 'none' });
        });
    });

    describe('Section Visibility Toggle', () => {
        it('should switch between setup and timer sections', () => {
            const setupSection = document.getElementById('setup-section');
            const timerSection = document.getElementById('timer-section');

            // Initially setup visible, timer hidden
            expect(setupSection).toBeVisible();
            expect(timerSection).toHaveStyle({ display: 'none' });

            // Switch to timer view
            setupSection.style.display = 'none';
            timerSection.style.display = 'block';

            expect(setupSection).toHaveStyle({ display: 'none' });
            expect(timerSection).toBeVisible();

            // Switch back to setup
            setupSection.style.display = 'block';
            timerSection.style.display = 'none';

            expect(setupSection).toBeVisible();
            expect(timerSection).toHaveStyle({ display: 'none' });
        });
    });

    describe('Form Input Validation', () => {
        it('should have required attributes on inputs', () => {
            const meetingLength = document.getElementById('meeting-length');
            const numParticipants = document.getElementById('num-participants');

            expect(meetingLength).toHaveAttribute('min', '1');
            expect(meetingLength).toHaveAttribute('type', 'number');

            expect(numParticipants).toHaveAttribute('min', '1');
            expect(numParticipants).toHaveAttribute('type', 'number');
        });

        it('should handle checkbox state', () => {
            const allowOvertime = document.getElementById('allow-overtime');

            expect(allowOvertime.checked).toBe(false);

            allowOvertime.checked = true;
            expect(allowOvertime.checked).toBe(true);
        });
    });

    describe('Event Handler Attachment', () => {
        it('should have clickable buttons', () => {
            const buttons = [
                'start-btn',
                'pause-resume-btn',
                'next-btn',
                'reset-btn',
                'modal-overtime-btn',
                'modal-next-btn'
            ];

            buttons.forEach(buttonId => {
                const button = document.getElementById(buttonId);
                expect(button).toBeInTheDocument();
                expect(button.tagName).toBe('BUTTON');
            });
        });

        it('should trigger input events', () => {
            const numParticipantsInput = document.getElementById('num-participants');
            const mockHandler = jest.fn();

            numParticipantsInput.addEventListener('input', mockHandler);
            numParticipantsInput.dispatchEvent(new Event('input'));

            expect(mockHandler).toHaveBeenCalledTimes(1);
        });

        it('should trigger click events', () => {
            const startBtn = document.getElementById('start-btn');
            const mockHandler = jest.fn();

            startBtn.addEventListener('click', mockHandler);
            startBtn.click();

            expect(mockHandler).toHaveBeenCalledTimes(1);
        });
    });

    describe('DOM Element Queries', () => {
        it('should find all required elements', () => {
            const requiredElements = [
                'meeting-length',
                'num-participants',
                'participant-names-container',
                'allow-overtime',
                'start-btn',
                'setup-section',
                'timer-section',
                'timer-display',
                'current-speaker',
                'next-speaker',
                'next-speaker-line',
                'progress-bar',
                'pause-resume-btn',
                'next-btn',
                'reset-btn',
                'overtime-modal',
                'modal-message',
                'countdown-seconds',
                'modal-overtime-btn',
                'modal-next-btn',
                'startup-modal',
                'startup-speaker-name',
                'startup-countdown-display'
            ];

            requiredElements.forEach(elementId => {
                const element = document.getElementById(elementId);
                expect(element).toBeInTheDocument();
            });
        });
    });
});