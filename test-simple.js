#!/usr/bin/env node

// Simple test runner script that can run without Jest
// This helps verify our fixes work correctly

console.log('🧪 Running Standup Timer Tests...\n');

// Load the timer core functions
const fs = require('fs');
const path = require('path');

// Read and evaluate the timer-core.js file
const timerCorePath = path.join(__dirname, 'tests', 'timer-core.js');
const timerCoreCode = fs.readFileSync(timerCorePath, 'utf8');

// Remove the browser-specific export and evaluate
const coreCode = timerCoreCode.replace(/if \(typeof window[\s\S]*?}/, '');
eval(coreCode);

// Simple test function
function test(description, testFn) {
    try {
        testFn();
        console.log(`✅ ${description}`);
        return true;
    } catch (error) {
        console.log(`❌ ${description}: ${error.message}`);
        return false;
    }
}

function expect(actual) {
    return {
        toBe: (expected) => {
            if (actual !== expected) {
                throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
            }
        },
        toEqual: (expected) => {
            if (JSON.stringify(actual) !== JSON.stringify(expected)) {
                throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
            }
        }
    };
}

let passed = 0;
let failed = 0;

// Core function tests
console.log('Core Functions:');

if (test('shuffleArray should not throw', () => {
    const arr = [1, 2, 3];
    shuffleArray(arr);
    expect(arr.length).toBe(3);
})) passed++; else failed++;

if (test('calculateTimePerPerson should work correctly', () => {
    expect(calculateTimePerPerson(15, 5)).toBe(180);
    expect(calculateTimePerPerson(0, 5)).toBe(0);
    expect(calculateTimePerPerson(15, 0)).toBe(0);
})) passed++; else failed++;

if (test('formatTime should format correctly', () => {
    expect(formatTime(180)).toBe('3:00');
    expect(formatTime(65)).toBe('1:05');
    expect(formatTime(5)).toBe('0:05');
    expect(formatTime(65, true)).toBe('+1:05');
})) passed++; else failed++;

if (test('calculateProgress should work', () => {
    expect(calculateProgress(2, 5)).toBe(40);
    expect(calculateProgress(0, 5)).toBe(0);
    expect(calculateProgress(5, 5)).toBe(100);
})) passed++; else failed++;

if (test('validateParticipantNames should validate and default', () => {
    expect(validateParticipantNames(['Alice', '', 'Bob'])).toEqual(['Alice', 'Participant 2', 'Bob']);
    expect(validateParticipantNames([])).toEqual([]);
})) passed++; else failed++;

if (test('hasNextParticipant should work', () => {
    const participants = ['Alice', 'Bob', 'Charlie'];
    expect(hasNextParticipant(0, participants)).toBe(true);
    expect(hasNextParticipant(2, participants)).toBe(false);
})) passed++; else failed++;

if (test('getNextParticipant should work', () => {
    const participants = ['Alice', 'Bob', 'Charlie'];
    expect(getNextParticipant(0, participants)).toBe('Bob');
    expect(getNextParticipant(2, participants)).toBe(null);
})) passed++; else failed++;

console.log('\nTimerState Class:');

if (test('TimerState should initialize correctly', () => {
    const timer = new TimerState();
    expect(timer.currentParticipantIndex).toBe(0);
    expect(timer.isPaused).toBe(false);
    expect(timer.isInOvertime).toBe(false);
})) passed++; else failed++;

if (test('TimerState should set participants', () => {
    const timer = new TimerState();
    timer.setParticipants(['Alice', '', 'Bob']);
    expect(timer.participants).toEqual(['Alice', 'Participant 2', 'Bob']);
})) passed++; else failed++;

if (test('TimerState should calculate time per person', () => {
    const timer = new TimerState();
    timer.setParticipants(['Alice', 'Bob', 'Charlie']);
    timer.setTimePerPerson(15);
    expect(timer.timePerPerson).toBe(300); // 15 * 60 / 3
})) passed++; else failed++;

if (test('TimerState should handle speaker navigation', () => {
    const timer = new TimerState();
    timer.setParticipants(['Alice', 'Bob', 'Charlie']);
    expect(timer.getCurrentSpeaker()).toBe('Alice');
    expect(timer.getNextSpeaker()).toBe('Bob');
    expect(timer.hasNextSpeaker()).toBe(true);
})) passed++; else failed++;

if (test('TimerState should handle next speaker transition', () => {
    const timer = new TimerState();
    timer.setParticipants(['Alice', 'Bob']);
    timer.setTimePerPerson(10);

    const finished = timer.nextSpeaker();
    expect(finished).toBe(false);
    expect(timer.getCurrentSpeaker()).toBe('Bob');
})) passed++; else failed++;

if (test('TimerState should handle overtime', () => {
    const timer = new TimerState();
    timer.startOvertime();
    expect(timer.isInOvertime).toBe(true);
    expect(timer.overtimeSeconds).toBe(0);

    timer.tick();
    expect(timer.overtimeSeconds).toBe(1);
})) passed++; else failed++;

if (test('TimerState should reset correctly', () => {
    const timer = new TimerState();
    timer.setParticipants(['Alice', 'Bob']);
    timer.setTimePerPerson(10);
    timer.nextSpeaker();
    timer.startOvertime();

    timer.reset();
    expect(timer.currentParticipantIndex).toBe(0);
    expect(timer.participants).toEqual([]);
    expect(timer.isInOvertime).toBe(false);
})) passed++; else failed++;

console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
    console.log('🎉 All tests passed!');
    process.exit(0);
} else {
    console.log('💥 Some tests failed!');
    process.exit(1);
}