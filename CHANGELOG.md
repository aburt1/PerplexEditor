# Changelog

All notable changes to Andrew's Tools will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- GitHub Actions workflow for automated releases
- Enhanced prompt engineering with role-based personas
- Improved selection handling and restoration
- Better error handling and user feedback

### Changed
- Renamed from "AI Text Editor" to "Andrew's Tools"
- Updated all branding and references
- Improved README with better GitHub formatting

### Fixed
- Selection validation issues with context menu
- API response handling and error display
- Text replacement reliability in textareas

## [1.0.0] - 2024-01-XX

### Added
- Initial release of Andrew's Tools
- Context menu integration for text editing
- Four AI-powered functions: rewrite, reword, improve, summarize
- Perplexity AI API integration
- Customizable prompts for each function
- Tone control (8 different tones)
- Length control (5 different lengths)
- Per-site context configuration
- Multiple trigger methods (context menu, toolbar, keyboard shortcuts)
- Formatting preservation
- Real-time notifications
- Settings page with modern UI
- Comprehensive test pages
- SVG icons
- Kuali email generation for workflow steps
- Automatic step type detection (Approval, Task, Notification)
- CSUB email template integration

### Technical Features
- Firefox extension manifest v2
- Background script for context menus and commands
- Content script for text processing
- Options page for configuration
- Local storage for settings persistence
- Cross-platform compatibility
- All-frames content script support for complex editors

### API Integration
- Perplexity AI sonar model
- Configurable API endpoints
- Error handling and retry logic
- Request/response logging
- Rate limiting considerations

