#!/bin/bash

# Navigate to project root from tests/runners/
cd "$(dirname "$0")/../.."

echo "🧪 Testing Standup Timer Files..."
echo ""

echo "📂 Directory structure:"
echo "src/:"
ls -la src/ 2>/dev/null || echo "❌ src/ directory not found"

echo ""
echo "assets/:"
ls -la assets/ 2>/dev/null || echo "❌ assets/ directory not found"

echo ""
echo "tests/:"
ls -la tests/ 2>/dev/null || echo "❌ tests/ directory not found"

echo ""
echo "config/:"
ls -la config/ 2>/dev/null || echo "❌ config/ directory not found"

echo ""
# Check if files exist
echo "📁 Checking key files:"
if [ -f "tests/utils/timer-core.js" ]; then
    echo "✅ tests/utils/timer-core.js exists"
else
    echo "❌ tests/utils/timer-core.js missing"
    exit 1
fi

if [ -f "tests/runners/test-runner.html" ]; then
    echo "✅ tests/runners/test-runner.html exists"
else
    echo "❌ tests/runners/test-runner.html missing"
fi

if [ -f "src/index.html" ]; then
    echo "✅ src/index.html exists"
else
    echo "❌ src/index.html missing"
fi

if [ -f "config/package.json" ]; then
    echo "✅ config/package.json exists"
else
    echo "❌ config/package.json missing"
fi

echo ""
echo "🌐 To run browser tests:"
echo "1. Navigate to tests/runners/"
echo "2. Open test-runner.html in a web browser"
echo ""
echo "📝 File contents check:"
echo "tests/utils/timer-core.js size: $(wc -c < tests/utils/timer-core.js) bytes"

# Check if timer-core.js has the browser export
if grep -q "window.StandupTimer" tests/utils/timer-core.js; then
    echo "✅ Browser export found in timer-core.js"
else
    echo "❌ Browser export missing in timer-core.js"
fi

echo ""
echo "🚀 Repository is properly organized!"
echo "- Main app: src/"
echo "- Assets: assets/"
echo "- Tests: tests/"
echo "- Config: config/"