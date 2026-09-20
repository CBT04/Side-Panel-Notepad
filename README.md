# SidePanel Notepad

SidePanel Notepad is a lightweight note-taking Chrome Extension with over 250 weekly users. It provides core editing features for an efficient note-taking experience while browsing the internet.
The retro-inspired aesthetic was chosen to stand out among generic alternatives that may be present on the Chrome Web Store.

([Chrome Web Store Page](https://chromewebstore.google.com/detail/sidepanel-notepad/gopjnkhllbiccdmilekbibjdleogkfcj))

## Key Features
- **STORE UNLIMITED NOTES:** Create and store an unlimited number of notes! 
- **SEAMLESS SIDEPANEL INTEGRATION:** Instantly switch to the notepad while browsing any website on Chrome.
- **COLOUR-CODED NOTE THEMES:** Assign one of four colours to personalise your note-taking experience.
- **DARK MODE:** Switch between light and dark modes with a single button press.
- **EXPORT TO TEXT:** Export any note to a txt file with a single click.
- **KEY EDITING TOOLS:** Classic Undo, Copy and Paste tools to keep your workflow simple and efficient. You can even copy text from a web page directly to the notepad!

## Stack
- **Programming Language:** Vanilla JavaScript
- **Markup Language:** HTML
- **Styling:** CSS
- **Extension APIs:** 
  - `chrome.sidepanel` to open the application in the SidePanel instead of the popup.
  - `chrome.storage` for note and state persistence within and across sessions.
  - `chrome.contextMenus` to create a custom context menu button to copy highlighted web page contents directly to the notepad.

## Project Structure
```text
Side-Panel-Notepad/
├─ images/               # Icons and images for buttons.
│  ├─ blue-dark.png
│  ├─ blue.png
│  ├─ copy.png
│  ├─ dark.png
│  ├─ download.png
│  ├─ green-dark.png
│  ├─ green.png
│  ├─ icon128.png
│  ├─ icon16.png
│  ├─ icon48.png
│  ├─ light.png
│  ├─ menu.png
│  ├─ paste.png
│  ├─ red-dark.png
│  ├─ red.png
│  ├─ undo.png
│  ├─ yellow-dark.png
│  └─ yellow.png
├─ background.js         # Service worker file which enables the action button to open the Side Panel and for the custom context menu button to appear during note editing.
├─ manifest.json         # Specifies the project structure and assets so that the application can run as a Chrome extension.
├─ sidePanel.html        # Markup file for the core UI structure.
├─ sidePanel.js          # Contains the core application functionality.
├─ style.css             # Custom retro-inspired styling.
├─ CHANGELOG.MD          # An overview of the changes made in each update that has been published to the Chrome Web Store.
└─ README.MD             # Project documentation.


