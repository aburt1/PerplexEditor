#!/bin/bash

# PerplexEditor Simple Installation Script
# This script makes it easy to install the extension from source

echo "🚀 PerplexEditor - Simple Installation"
echo "======================================"
echo ""

# Check if we're in the right directory
if [ ! -f "manifest.json" ]; then
    echo "❌ Error: Please run this script from the PerplexEditor directory"
    echo "   (where manifest.json is located)"
    exit 1
fi

# Check if Firefox is installed
if ! command -v firefox &> /dev/null; then
    echo "❌ Error: Firefox is not installed or not in PATH"
    echo "   Please install Firefox first: https://www.mozilla.org/firefox/"
    exit 1
fi

echo "✅ Firefox detected"
echo ""

# Create the XPI package
echo "📦 Creating extension package..."
if npm run package; then
    echo "✅ Package created successfully: perplexeditor.xpi"
else
    echo "❌ Failed to create package. Trying alternative method..."
    
    # Fallback: simple zip creation
    if command -v zip &> /dev/null; then
        echo "📦 Creating package with zip..."
        zip -r perplexeditor.xpi . -x '*.git*' '*.DS_Store' '*.md' '*.sh' 'test-*.html' 'node_modules/*' 'package*.json'
        if [ -f "perplexeditor.xpi" ]; then
            echo "✅ Package created successfully: perplexeditor.xpi"
        else
            echo "❌ Failed to create package"
            exit 1
        fi
    else
        echo "❌ zip command not found. Please install zip or run manually:"
        echo "   zip -r perplexeditor.xpi . -x '*.git*' '*.DS_Store' '*.md' '*.sh' 'test-*.html' 'node_modules/*' 'package*.json'"
        exit 1
    fi
fi

echo ""
echo "🎯 Installation Instructions:"
echo "============================="
echo ""
echo "1. 📥 The extension package 'perplexeditor.xpi' has been created"
echo ""
echo "2. 🌐 Open Firefox and go to: about:addons"
echo ""
echo "3. 🔧 Click the gear icon (⚙️) and select 'Install Add-on From File...'"
echo ""
echo "4. 📁 Select the 'perplexeditor.xpi' file from this directory"
echo ""
echo "5. ✅ Click 'Add' when prompted"
echo ""
echo "6. ⚙️ Configure your Perplexity API key in the extension settings"
echo ""
echo "🎉 You're all set! The extension will appear in your toolbar."
echo ""
echo "📚 For more help, visit: https://github.com/yourusername/perplexeditor"
echo ""
echo "🔧 To test the extension, open test-extension.html in Firefox"

