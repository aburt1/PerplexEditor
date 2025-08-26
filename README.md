# PerplexEditor 🔥✍️

> A powerful Firefox extension that provides AI-powered text editing, rewriting, and enhancement using the Perplexity AI API.

[![Firefox Add-on](https://img.shields.io/badge/Firefox-Add--on-orange?logo=firefox-browser)](https://addons.mozilla.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/yourusername/perplexeditor/releases)

---

## ✨ Features

- **🤖 AI-Powered Editing**: Rewrite, reword, improve, and summarize text using Perplexity AI
- **🎯 Smart Prompts**: Advanced prompt engineering for better AI responses
- **🎨 Tone Control**: 8 different tones (formal, casual, friendly, professional, technical, creative, concise)
- **📏 Length Control**: Adjust output length (shorter, same, longer, concise, detailed)
- **🔗 Multiple Triggers**: Context menu, toolbar button, keyboard shortcuts
- **🌐 Per-Site Context**: Set audience context for specific websites
- **💾 Format Preservation**: Maintains existing text formatting and symbols
- **⚡ Cross-Platform**: Works on all platforms where Firefox runs

## 🚀 Quick Start

### Prerequisites
- Firefox browser (version 57 or later)
- Perplexity AI API key ([Get one here](https://www.perplexity.ai/settings/api))

### Installation

#### Method 1: Download Release (Recommended)
1. Go to [Releases](https://github.com/yourusername/perplexeditor/releases)
2. Download the latest `perplexeditor.xpi` file
3. Drag and drop the `.xpi` file into Firefox
4. Click "Add" when prompted

#### Method 2: Load from Source
1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/perplexeditor.git
   cd perplexeditor
   ```
2. Open Firefox and go to `about:debugging`
3. Click "This Firefox" tab
4. Click "Load Temporary Add-on"
5. Select the `manifest.json` file from the cloned directory

### Setup
1. After installation, click the PerplexEditor icon in your toolbar
2. Click "Settings" to configure your Perplexity API key
3. Customize prompts, tones, and site contexts as needed
4. Start editing text by selecting it and using the context menu!

## 🎮 Usage

### Context Menu (Right-click)
- Select any text on a webpage
- Right-click and choose from:
  - **Rewrite Text**: Make text clearer and more engaging
  - **Reword Text**: Use different vocabulary while maintaining meaning
  - **Improve Text**: Enhance clarity, grammar, and flow
  - **Summarize Text**: Create concise summaries

### Toolbar Button
- Click the PerplexEditor icon in your toolbar
- Choose your desired action from the dropdown menu

### Keyboard Shortcuts
- `Alt+Shift+R`: Rewrite selected text
- `Alt+Shift+W`: Reword selected text
- `Alt+Shift+I`: Improve selected text
- `Alt+Shift+S`: Summarize selected text
- `Alt+Shift+M`: Open action menu

## ⚙️ Configuration

### API Settings
- **Perplexity API Key**: Required for all AI operations
- **Default Tone**: Set your preferred tone (neutral, formal, casual, etc.)
- **Default Length**: Set your preferred length (same, shorter, longer, etc.)

### Custom Prompts
Customize the AI prompts for each function:
- **Rewrite**: Make text clearer and more engaging
- **Reword**: Use different vocabulary while maintaining meaning
- **Improve**: Enhance clarity, grammar, and structure
- **Summarize**: Create comprehensive yet concise summaries

### Site Contexts
Set audience context for specific websites:
- **Domain**: Website domain (e.g., `outlook.office.com`)
- **Audience**: Target audience description
- **Tone**: Preferred communication style

## 🧪 Testing

Use the included test pages to verify functionality:
- **`test-extension.html`**: Test the extension with custom text
- **`test-comprehensive.html`**: Comprehensive testing of all features

## 🏗️ Project Structure

```
perplexeditor/
├── manifest.json          # Extension manifest
├── background.js          # Background script (context menus, commands)
├── content.js             # Content script (text processing, API calls)
├── options.html           # Settings page
├── options.js             # Settings page logic
├── icons/                 # Extension icons
│   ├── icon-48.svg       # 48x48 icon
│   └── icon-96.svg       # 96x96 icon
├── test-extension.html    # Extension test page
├── test-comprehensive.html # Comprehensive test suite
└── README.md              # This file
```

## 🔧 Development

### Prerequisites
- Node.js (for building)
- Firefox Developer Edition (for testing)

### Build Commands
```bash
# Install dependencies
npm install

# Build extension package
npm run package

# Install as temporary add-on
npm run install


```

### Automated Releases with GitHub Actions

This project uses GitHub Actions to automatically build and release the Firefox extension as an XPI file on every commit.

#### How It Works
1. **Automatic Triggers**: Every push to any branch automatically triggers the workflow
2. **Automatic Building**: The workflow builds the extension and packages it into an XPI file
3. **Automatic Release Creation**: A new GitHub release is automatically created with the XPI file attached
4. **User Downloads**: Users can download the XPI file directly from the releases page

#### Creating a Release
```bash
# Simply commit and push your changes
git add .
git commit -m "Add new feature or fix bug"
git push origin main

# GitHub Actions will automatically:
# - Build the extension
# - Package it as perplexeditor.xpi
# - Create a release with the XPI file
# - Tag it with a unique identifier
```

#### Workflow Features
- **Fully Automated**: No manual intervention needed - releases happen on every commit
- **Cross-platform**: Builds on Ubuntu (Linux) for maximum compatibility
- **Dependency Management**: Uses `npm ci` for reliable builds
- **Smart Packaging**: Excludes development files and documentation from the XPI
- **Professional Releases**: Creates detailed release notes with installation instructions
- **Unique Releases**: Each commit gets its own release with commit hash and timestamp

### Development Workflow
1. Make changes to source files
2. Load as temporary add-on in Firefox for testing
3. Test functionality
4. Commit and push changes
5. GitHub Actions automatically creates a release with the XPI file

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Perplexity AI](https://www.perplexity.ai/) for providing the AI API
- Firefox team for the excellent extension platform
- All contributors and users of this extension

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/perplexeditor/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/perplexeditor/discussions)
- **Wiki**: [GitHub Wiki](https://github.com/yourusername/perplexeditor/wiki)

---

**Made with ❤️ for the Firefox community**
