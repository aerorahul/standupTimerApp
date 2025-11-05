/**
 * Unit tests for Standup Timer Core Functions
 */

const {
    shuffleArray,
    calculateTimePerPerson,
    formatTime,
    calculateProgress,
    validateParticipantNames,
    hasNextParticipant,
    getNextParticipant,
    TimerState
} = require('./timer-core');

describe('Standup Timer Core Functions', () => {

    describe('shuffleArray', () => {
        it('should shuffle an array', () => {
            const original = [1, 2, 3, 4, 5];
            const toShuffle = [...original];

            // Mock Math.random to return predictable values
            const mockRandom = jest.spyOn(Math, 'random');
            mockRandom.mockReturnValueOnce(0.5)
                     .mockReturnValueOnce(0.3)
                     .mockReturnValueOnce(0.7)
                     .mockReturnValueOnce(0.1);

            shuffleArray(toShuffle);

            // Array should be modified
            expect(toShuffle).not.toEqual(original);
            expect(toShuffle).toHaveLength(original.length);

            // Should contain all original elements
            original.forEach(item => {
                expect(toShuffle).toContain(item);
            });

            mockRandom.mockRestore();
        });

        it('should handle empty array', () => {
            const empty = [];
            expect(() => shuffleArray(empty)).not.toThrow();
            expect(empty).toEqual([]);
        });

        it('should handle single element array', () => {
            const single = [1];
            shuffleArray(single);
            expect(single).toEqual([1]);
        });
    });

    describe('calculateTimePerPerson', () => {
        it('should calculate correct time per person', () => {
            expect(calculateTimePerPerson(15, 5)).toBe(180); // 15 min * 60 sec / 5 people = 180 sec
            expect(calculateTimePerPerson(10, 3)).toBe(200); // 10 min * 60 sec / 3 people = 200 sec
            expect(calculateTimePerPerson(5, 2)).toBe(150);  // 5 min * 60 sec / 2 people = 150 sec
        });

        it('should handle fractional results by flooring', () => {
            expect(calculateTimePerPerson(10, 7)).toBe(85); // 600 / 7 = 85.71... -> 85
        });

        it('should return 0 for invalid inputs', () => {
            expect(calculateTimePerPerson(0, 5)).toBe(0);
            expect(calculateTimePerPerson(15, 0)).toBe(0);
            expect(calculateTimePerPerson(-5, 3)).toBe(0);
            expect(calculateTimePerPerson(10, -2)).toBe(0);
        });
    });

    describe('formatTime', () => {
        it('should format time correctly', () => {
            expect(formatTime(180)).toBe('3:00');
            expect(formatTime(125)).toBe('2:05');
            expect(formatTime(65)).toBe('1:05');
            expect(formatTime(9)).toBe('0:09');
            expect(formatTime(0)).toBe('0:00');
        });

        it('should format overtime correctly', () => {
            expect(formatTime(180, true)).toBe('+3:00');
            expect(formatTime(65, true)).toBe('+1:05');
            expect(formatTime(9, true)).toBe('+0:09');
        });

        it('should handle negative values', () => {
            expect(formatTime(-65)).toBe('1:05');
            expect(formatTime(-65, true)).toBe('+1:05');
        });
    });

    describe('calculateProgress', () => {
        it('should calculate progress correctly', () => {
            expect(calculateProgress(0, 5)).toBe(0);
            expect(calculateProgress(1, 5)).toBe(20);
            expect(calculateProgress(2, 5)).toBe(40);
            expect(calculateProgress(3, 5)).toBe(60);
            expect(calculateProgress(5, 5)).toBe(100);
        });

        it('should handle edge cases', () => {
            expect(calculateProgress(0, 0)).toBe(0);
            expect(calculateProgress(10, 5)).toBe(100); // Clamp to 100
            expect(calculateProgress(-1, 5)).toBe(0);   // Clamp to 0
        });
    });

    describe('validateParticipantNames', () => {
        it('should validate and default participant names', () => {
            const names = ['Alice', '', '  Bob  ', '', 'Charlie'];
            const result = validateParticipantNames(names);

            expect(result).toEqual([
                'Alice',
                'Participant 2',
                'Bob',
                'Participant 4',
                'Charlie'
            ]);
        });

        it('should handle empty array', () => {
            expect(validateParticipantNames([])).toEqual([]);
        });

        it('should trim whitespace', () => {
            const names = ['  Alice  ', '\t\nBob\t\n'];
            const result = validateParticipantNames(names);
            expect(result[0]).toBe('Alice');
            expect(result[1]).toBe('Bob');
        });
    });

    describe('hasNextParticipant', () => {
        const participants = ['Alice', 'Bob', 'Charlie'];

        it('should return true when there is a next participant', () => {
            expect(hasNextParticipant(0, participants)).toBe(true);
            expect(hasNextParticipant(1, participants)).toBe(true);
        });

        it('should return false when there is no next participant', () => {
            expect(hasNextParticipant(2, participants)).toBe(false);
            expect(hasNextParticipant(3, participants)).toBe(false);
        });

        it('should handle empty array', () => {
            expect(hasNextParticipant(0, [])).toBe(false);
        });
    });

    describe('getNextParticipant', () => {
        const participants = ['Alice', 'Bob', 'Charlie'];

        it('should return next participant name', () => {
            expect(getNextParticipant(0, participants)).toBe('Bob');
            expect(getNextParticipant(1, participants)).toBe('Charlie');
        });

        it('should return null when there is no next participant', () => {
            expect(getNextParticipant(2, participants)).toBe(null);
            expect(getNextParticipant(3, participants)).toBe(null);
        });

        it('should handle empty array', () => {
            expect(getNextParticipant(0, [])).toBe(null);
        });
    });
});

describe('TimerState', () => {
    let timerState;

    beforeEach(() => {
        timerState = new TimerState();
    });

    describe('initialization', () => {
        it('should initialize with default values', () => {
            expect(timerState.participants).toEqual([]);
            expect(timerState.timePerPerson).toBe(0);
            expect(timerState.currentSpeakerTimeLeft).toBe(0);
            expect(timerState.currentParticipantIndex).toBe(0);
            expect(timerState.isPaused).toBe(false);
            expect(timerState.allowOvertime).toBe(false);
            expect(timerState.isInOvertime).toBe(false);
            expect(timerState.overtimeSeconds).toBe(0);
        });
    });

    describe('setParticipants', () => {
        it('should set and validate participants', () => {
            timerState.setParticipants(['Alice', '', 'Bob']);
            expect(timerState.participants).toEqual(['Alice', 'Participant 2', 'Bob']);
        });
    });

    describe('setTimePerPerson', () => {
        it('should calculate and set time per person', () => {
            timerState.setParticipants(['Alice', 'Bob', 'Charlie']);
            timerState.setTimePerPerson(15);

            expect(timerState.timePerPerson).toBe(300); // 15 * 60 / 3 = 300
            expect(timerState.currentSpeakerTimeLeft).toBe(300);
        });
    });

    describe('speaker navigation', () => {
        beforeEach(() => {
            timerState.setParticipants(['Alice', 'Bob', 'Charlie']);
        });

        it('should get current speaker', () => {
            expect(timerState.getCurrentSpeaker()).toBe('Alice');
            timerState.currentParticipantIndex = 1;
            expect(timerState.getCurrentSpeaker()).toBe('Bob');
        });

        it('should get next speaker', () => {
            expect(timerState.getNextSpeaker()).toBe('Bob');
            timerState.currentParticipantIndex = 1;
            expect(timerState.getNextSpeaker()).toBe('Charlie');
            timerState.currentParticipantIndex = 2;
            expect(timerState.getNextSpeaker()).toBe(null);
        });

        it('should check if has next speaker', () => {
            expect(timerState.hasNextSpeaker()).toBe(true);
            timerState.currentParticipantIndex = 2;
            expect(timerState.hasNextSpeaker()).toBe(false);
        });
    });

    describe('timer operations', () => {
        beforeEach(() => {
            timerState.setParticipants(['Alice', 'Bob']);
            timerState.setTimePerPerson(2); // 2 minutes = 120 seconds
        });

        it('should tick down normally', () => {
            expect(timerState.currentSpeakerTimeLeft).toBe(120);

            const result = timerState.tick();
            expect(result).toBe(119);
            expect(timerState.currentSpeakerTimeLeft).toBe(119);
        });

        it('should not tick when paused', () => {
            timerState.isPaused = true;
            timerState.tick();
            expect(timerState.currentSpeakerTimeLeft).toBe(120);
        });

        it('should tick up in overtime', () => {
            timerState.startOvertime();

            timerState.tick();
            expect(timerState.overtimeSeconds).toBe(1);

            timerState.tick();
            expect(timerState.overtimeSeconds).toBe(2);
        });

        it('should handle startup countdown', () => {
            timerState.isStartupCountdown = true;
            timerState.startupCountdown = 3;

            expect(timerState.tick()).toBe(2);
            expect(timerState.tick()).toBe(1);
            expect(timerState.tick()).toBe(0);
        });
    });

    describe('time formatting', () => {
        beforeEach(() => {
            timerState.setParticipants(['Alice']);
            timerState.setTimePerPerson(2); // 120 seconds
        });

        it('should format normal time', () => {
            expect(timerState.getCurrentTime()).toBe('2:00');
            timerState.currentSpeakerTimeLeft = 65;
            expect(timerState.getCurrentTime()).toBe('1:05');
        });

        it('should format overtime', () => {
            timerState.startOvertime();
            timerState.overtimeSeconds = 75;
            expect(timerState.getCurrentTime()).toBe('+1:15');
        });
    });

    describe('speaker transitions', () => {
        beforeEach(() => {
            timerState.setParticipants(['Alice', 'Bob', 'Charlie']);
            timerState.setTimePerPerson(1); // 60 seconds
        });

        it('should advance to next speaker', () => {
            expect(timerState.getCurrentSpeaker()).toBe('Alice');

            const finished = timerState.nextSpeaker();
            expect(finished).toBe(false);
            expect(timerState.getCurrentSpeaker()).toBe('Bob');
            expect(timerState.currentSpeakerTimeLeft).toBe(60);
            expect(timerState.isInOvertime).toBe(false);
        });

        it('should detect standup completion', () => {
            timerState.currentParticipantIndex = 2; // Last speaker

            const finished = timerState.nextSpeaker();
            expect(finished).toBe(true);
            expect(timerState.isStandupComplete()).toBe(true);
        });

        it('should reset overtime when advancing', () => {
            timerState.startOvertime();
            timerState.overtimeSeconds = 30;

            timerState.nextSpeaker();
            expect(timerState.isInOvertime).toBe(false);
            expect(timerState.overtimeSeconds).toBe(0);
        });
    });

    describe('progress calculation', () => {
        beforeEach(() => {
            timerState.setParticipants(['Alice', 'Bob', 'Charlie', 'Dave']);
        });

        it('should calculate progress correctly', () => {
            expect(timerState.getProgress()).toBe(0);   // 0/4 = 0%

            timerState.currentParticipantIndex = 1;
            expect(timerState.getProgress()).toBe(25);  // 1/4 = 25%

            timerState.currentParticipantIndex = 2;
            expect(timerState.getProgress()).toBe(50);  // 2/4 = 50%

            timerState.currentParticipantIndex = 4;
            expect(timerState.getProgress()).toBe(100); // 4/4 = 100%
        });
    });

    describe('time expiration', () => {
        beforeEach(() => {
            timerState.setParticipants(['Alice']);
            timerState.setTimePerPerson(1);
        });

        it('should detect time expiration', () => {
            timerState.currentSpeakerTimeLeft = 1;
            expect(timerState.isTimeExpired()).toBe(false);

            timerState.currentSpeakerTimeLeft = 0;
            expect(timerState.isTimeExpired()).toBe(true);
        });

        it('should not detect expiration in overtime', () => {
            timerState.currentSpeakerTimeLeft = 0;
            timerState.startOvertime();
            expect(timerState.isTimeExpired()).toBe(false);
        });
    });

    describe('reset', () => {
        it('should reset all state', () => {
            timerState.setParticipants(['Alice', 'Bob']);
            timerState.setTimePerPerson(5);
            timerState.currentParticipantIndex = 1;
            timerState.isPaused = true;
            timerState.startOvertime();

            timerState.reset();

            expect(timerState.participants).toEqual([]);
            expect(timerState.timePerPerson).toBe(0);
            expect(timerState.currentParticipantIndex).toBe(0);
            expect(timerState.isPaused).toBe(false);
            expect(timerState.isInOvertime).toBe(false);
            expect(timerState.overtimeSeconds).toBe(0);
        });
    });
});