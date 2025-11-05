#!/bin/bash

echo "🧪 Testing Standup Timer Files..."
echo ""

# Check if files exist
echo "📁 Checking files:"
if [ -f "tests/timer-core.js" ]; then
    echo "✅ tests/timer-core.js exists"
else
    echo "❌ tests/timer-core.js missing"
    exit 1
fi

if [ -f "test-runner.html" ]; then
    echo "✅ test-runner.html exists"
else
    echo "❌ test-runner.html missing"
fi

echo ""
echo "🌐 To run browser tests:"
echo "1. Open test-runner.html in a web browser"
echo ""
echo "📝 File contents check:"
echo "tests/timer-core.js size: $(wc -c < tests/timer-core.js) bytes"

# Check if timer-core.js has the browser export
if grep -q "window.StandupTimer" tests/timer-core.js; then
    echo "✅ Browser export found in timer-core.js"
else
    echo "❌ Browser export missing in timer-core.js"
fi

echo ""
echo "🚀 Files are ready for testing!"
echo "Open test-runner.html in your browser to run the tests."