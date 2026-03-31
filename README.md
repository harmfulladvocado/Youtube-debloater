# YouTube Debloater

A browser extension that debloats the YouTube webpage by removing unnecessary UI elements and improving the viewing experience.

## Features

- Removes clutter from YouTube interface
- Customizable toggle options for different UI elements
- Real-time webpage modification
- Persistent settings across sessions

## Installation

1. Clone or download this repository
2. Open your browser's extension management page:
   - **Chrome/Brave**: `chrome://extensions/`
   - **Edge**: `edge://extensions/`
3. Enable "Developer mode" (top-right)
4. Click "Load unpacked" and select this folder

## How It Works

- **content.js**: Modifies YouTube's DOM to hide unwanted elements
- **popup.js/popup.html**: Provides the extension settings UI
- **background.js**: Handles extension logic and storage
- **manifest.json**: Extension configuration
