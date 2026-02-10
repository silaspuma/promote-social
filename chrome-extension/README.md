# promote.social Chrome Extension

This Chrome extension verifies task completions and securely communicates with the promote.social website.

## Installation

### Development Mode

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `chrome-extension` folder

### Icons

Create the following icon files in the `icons/` directory:
- `icon16.png` (16x16px)
- `icon48.png` (48x48px)
- `icon128.png` (128x128px)

You can use any image editor or generate them online. For now, use simple colored squares with "PS" text.

## How It Works

1. **Extension Detection**: The content script signals to the website that the extension is installed
2. **Token Generation**: When a user clicks a task, the extension generates a secure, time-limited token
3. **Task Completion**: After completing the task, the user returns to the site
4. **Verification**: The site validates the token and awards points

## Files

- `manifest.json` - Extension configuration (Manifest V3)
- `background.js` - Service worker for token generation
- `content.js` - Content script for website communication
- `popup.html` - Extension popup UI
- `popup.js` - Popup logic

## Security Features

- Time-limited tokens (5 minutes expiry)
- Cryptographically secure random generation
- SHA-256 hashing
- Single-use tokens
- Origin validation

## Development

To update the extension URL for production:

1. Edit `manifest.json`
2. Update `host_permissions` and `content_scripts.matches`
3. Replace `localhost:3000` with your production domain

## Production Build

For production:

1. Update URLs in manifest.json
2. Create proper icons
3. Test thoroughly
4. Follow Chrome Web Store publishing guidelines
