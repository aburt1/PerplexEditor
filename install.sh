#!/bin/bash

# PerplexEditor Firefox Extension Installation Script

echo "PerplexEditor - Firefox Extension Installer"
echo "================================================"
echo ""

# Check if Firefox is installed
if ! command -v firefox &> /dev/null; then
    echo "❌ Firefox is not installed or not in PATH"
    echo "Please install Firefox first: https://www.mozilla.org/firefox/"
    exit 1
fi

echo "✅ Firefox detected"
echo ""

# Check if required files exist
required_files=("manifest.json" "background.js" "content.js" "options.html" "options.js")
missing_files=()

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -ne 0 ]; then
    echo "❌ Missing required files:"
    for file in "${missing_files[@]}"; do
        echo "   - $file"
    done
    echo ""
    echo "Please ensure all files are present in the current directory"
    exit 1
fi

echo "✅ All required files found"
echo ""

# Check for icon files
if [ ! -f "icons/icon-48.png" ] || [ ! -f "icons/icon-96.png" ]; then
    echo "⚠️  Warning: Icon files are missing or are placeholders"
    echo "   The extension will work but may not display properly"
    echo "   Please replace the placeholder icon files with actual SVG icons"
    echo ""
fi

echo "Installation Instructions:"
echo "=========================="
echo ""
echo "1. Open Firefox"
echo "2. Navigate to: about:debugging"
echo "3. Click 'This Firefox' in the left sidebar"
echo "4. Click 'Load Temporary Add-on'"
echo "5. Select the 'manifest.json' file from this directory"
echo "6. The extension will be loaded and ready to use"
echo ""
echo "Configuration:"
echo "=============="
echo "1. Right-click the extension icon in the toolbar"
echo "2. Select 'Options' or 'Preferences'"
echo "3. Enter your Perplexity API key"
echo "4. Customize prompts (optional)"
echo "5. Click 'Save Settings'"
echo ""
echo "Usage:"
echo "======"
echo "1. Select text in any editable area"
echo "2. Right-click to open context menu"
echo "3. Choose from: Rewrite, Reword, Improve, or Summarize"
echo "4. Wait for AI processing"
echo "5. View the enhanced text"
echo ""
echo "For more information, see README.md"
echo ""
echo "🎉 Installation script completed successfully!"
echo "Follow the instructions above to load the extension in Firefox"
