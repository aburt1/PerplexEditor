@echo off
REM PerplexEditor Simple Installation Script for Windows
REM This script makes it easy to install the extension from source

echo 🚀 PerplexEditor - Simple Installation
echo ======================================
echo.

REM Check if we're in the right directory
if not exist "manifest.json" (
    echo ❌ Error: Please run this script from the PerplexEditor directory
    echo    (where manifest.json is located)
    pause
    exit /b 1
)

echo ✅ Found manifest.json
echo.

REM Check if Node.js is available
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Trying alternative method...
    goto :zip_method
)

echo ✅ Node.js detected
echo.

REM Try to create package with npm
echo 📦 Creating extension package with npm...
call npm run package
if %errorlevel% equ 0 (
    echo ✅ Package created successfully: perplexeditor.xpi
    goto :instructions
)

:zip_method
echo 📦 Creating package with zip...
echo.

REM Check if PowerShell is available for zip creation
powershell -Command "Compress-Archive -Path 'manifest.json','background.js','content.js','options.html','options.js','icons' -DestinationPath 'perplexeditor.zip' -Force" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Package created successfully: perplexeditor.zip
    echo    Note: You may need to rename this to perplexeditor.xpi
    goto :instructions
)

echo ❌ Failed to create package automatically
echo.
echo 🔧 Manual installation required:
echo    1. Right-click on the PerplexEditor folder
echo    2. Select 'Send to' -^> 'Compressed (zipped) folder'
echo    3. Rename the zip file to 'perplexeditor.xpi'
echo    4. Follow the installation instructions below
echo.
goto :instructions

:instructions
echo.
echo 🎯 Installation Instructions:
echo =============================
echo.
echo 1. 📥 The extension package has been created
echo.
echo 2. 🌐 Open Firefox and go to: about:addons
echo.
echo 3. 🔧 Click the gear icon (⚙️) and select 'Install Add-on From File...'
echo.
echo 4. 📁 Select the 'perplexeditor.xpi' file from this directory
echo.
echo 5. ✅ Click 'Add' when prompted
echo.
echo 6. ⚙️ Configure your Perplexity API key in the extension settings
echo.
echo 🎉 You're all set! The extension will appear in your toolbar.
echo.
echo 📚 For more help, visit: https://github.com/yourusername/perplexeditor
echo.
echo 🔧 To test the extension, open test-extension.html in Firefox
echo.
pause

