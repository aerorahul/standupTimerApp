/**
 * Standup Timer Core Functions
 * Extracted functions for unit testing
 */

/**
 * Fisher-Yates shuffle algorithm for randomizing participant order
 * @param {Array} array - Array to shuffle
 * @returns {Array} - Shuffled array (modifies original)
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Calculate time per person in seconds
 * @param {number} meetingLengthMinutes - Total meeting length in minutes
 * @param {number} numParticipants - Number of participants
 * @returns {number} - Time per person in seconds
 */
function calculateTimePerPerson(meetingLengthMinutes, numParticipants) {
    if (numParticipants <= 0 || meetingLengthMinutes <= 0) {
        return 0;
    }
    return Math.floor((meetingLengthMinutes * 60) / numParticipants);
}

/**
 * Format time in MM:SS format
 * @param {number} seconds - Time in seconds
 * @param {boolean} isOvertime - Whether this is overtime (adds + prefix)
 * @returns {string} - Formatted time string
 */
function formatTime(seconds, isOvertime = false) {
    const minutes = Math.floor(Math.abs(seconds) / 60);
    const secs = Math.abs(seconds) % 60;
    const formattedTime = `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    return isOvertime ? `+${formattedTime}` : formattedTime;
}

/**
 * Calculate progress percentage
 * @param {number} currentIndex - Current participant index
 * @param {number} totalParticipants - Total number of participants
 * @returns {number} - Progress percentage (0-100)
 */
function calculateProgress(currentIndex, totalParticipants) {
    if (totalParticipants <= 0) return 0;
    return Math.min(100, Math.max(0, (currentIndex / totalParticipants) * 100));
}

/**
 * Validate participant names and generate defaults if needed
 * @param {Array} names - Array of participant names
 * @returns {Array} - Validated participant names
 */
function validateParticipantNames(names) {
    return names.map((name, index) =>
        name.trim() || `Participant ${index + 1}`
    );
}

/**
 * Check if there is a next participant
 * @param {number} currentIndex - Current participant index
 * @param {Array} participants - Array of participants
 * @returns {boolean} - True if there is a next participant
 */
function hasNextParticipant(currentIndex, participants) {
    return currentIndex + 1 < participants.length;
}

/**
 * Get next participant name
 * @param {number} currentIndex - Current participant index
 * @param {Array} participants - Array of participants
 * @returns {string|null} - Next participant name or null if none
 */
function getNextParticipant(currentIndex, participants) {
    return hasNextParticipant(currentIndex, participants)
        ? participants[currentIndex + 1]
        : null;
}

/**
 * Timer state management class
 */
class TimerState {
    constructor() {
        this.reset();
    }

    reset() {
        this.participants = [];
        this.timePerPerson = 0;
        this.currentSpeakerTimeLeft = 0;
        this.currentParticipantIndex = 0;
        this.isPaused = false;
        this.allowOvertime = false;
        this.isInOvertime = false;
        this.overtimeSeconds = 0;
        this.isStartupCountdown = false;
        this.startupCountdown = 0;
    }

    setParticipants(participants) {
        this.participants = validateParticipantNames(participants);
    }

    setTimePerPerson(meetingLengthMinutes) {
        this.timePerPerson = calculateTimePerPerson(meetingLengthMinutes, this.participants.length);
        this.currentSpeakerTimeLeft = this.timePerPerson;
    }

    shuffleParticipants() {
        shuffleArray(this.participants);
    }

    getCurrentSpeaker() {
        return this.participants[this.currentParticipantIndex] || null;
    }

    getNextSpeaker() {
        return getNextParticipant(this.currentParticipantIndex, this.participants);
    }

    hasNextSpeaker() {
        return hasNextParticipant(this.currentParticipantIndex, this.participants);
    }

    getProgress() {
        return calculateProgress(this.currentParticipantIndex, this.participants.length);
    }

    getCurrentTime() {
        if (this.isInOvertime) {
            return formatTime(this.overtimeSeconds, true);
        }
        return formatTime(this.currentSpeakerTimeLeft, false);
    }

    tick() {
        if (this.isPaused) return;

        if (this.isStartupCountdown) {
            this.startupCountdown--;
            return this.startupCountdown;
        }

        if (this.isInOvertime) {
            this.overtimeSeconds++;
        } else {
            this.currentSpeakerTimeLeft--;
        }

        return this.currentSpeakerTimeLeft;
    }

    startOvertime() {
        this.isInOvertime = true;
        this.overtimeSeconds = 0;
    }

    nextSpeaker() {
        this.currentParticipantIndex++;
        this.isInOvertime = false;
        this.overtimeSeconds = 0;

        if (this.currentParticipantIndex < this.participants.length) {
            this.currentSpeakerTimeLeft = this.timePerPerson;
            return false; // Not finished
        }

        return true; // Standup finished
    }

    isTimeExpired() {
        return !this.isInOvertime && this.currentSpeakerTimeLeft <= 0;
    }

    isStandupComplete() {
        return this.currentParticipantIndex >= this.participants.length;
    }
}

// Export for Node.js testing environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        shuffleArray,
        calculateTimePerPerson,
        formatTime,
        calculateProgress,
        validateParticipantNames,
        hasNextParticipant,
        getNextParticipant,
        TimerState
    };
}

// Export for browser environment
if (typeof window !== 'undefined') {
    window.StandupTimer = {
        shuffleArray,
        calculateTimePerPerson,
        formatTime,
        calculateProgress,
        validateParticipantNames,
        hasNextParticipant,
        getNextParticipant,
        TimerState
    };
}