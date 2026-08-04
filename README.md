# SidePanel Notepad for Google Chrome 

> A lightweight note-taking application with a retro aesthetic that can be used while browsing the internet. Provides the core editing features for an efficient experience.
> Built to demonstrate Chrome Web Development APIs and vanilla JavaScript through independent learning while referring to official documentation.
> [Official Chrome Web Store Page]: https://chromewebstore.google.com/detail/sidepanel-notepad/gopjnkhllbiccdmilekbibjdleogkfcj

## Tech Stack and Core APIs
[Chrome Extensions]: https://developer.chrome.com/docs/extensions
[JavaScript]: https://developer.mozilla.org/en-US/docs/Web/JavaScript
[Chrome Storage API]: https://developer.chrome.com/docs/extensions/reference/api/storage
[Chrome Side Panel API]: https://developer.chrome.com/docs/extensions/reference/api/sidePanel

## Directory Structure

$ tree
.
├── background.js // Enables the action button to open the Chrome extension in the Side Panel. 
├── CHANGELOG.md // Contains a list of all development updates and release updates.
├── README.md
├── manifest.json // Contains the metadata required to upload the extension to the Chrome Web Store.
├── sidePanel.html // The html file for the notepad application.
├── sidePanel.js // Contains the core functionality for the notepad application.
├── style.css // Custom CSS style sheet that was designed so that the notepad has a unique, retro design aesthetic.
└── images // Images used for the buttons in the notepad application.
    ├── blue-dark.png
    ├── blue.png
    ├── copy.png
    ├── dark.png
    ├── download.png
    ├── green-dark.png
    ├── green.png
    ├── icon128.png
    ├── icon16.png
    ├── icon48.png
    ├── light.png
    ├── menu.png
    ├── paste.png
    ├── red-dark.png
    ├── red.png
    ├── undo.png
    ├── yellow-dark.png
    └── yellow.png

## Typical Application Flow
[User Clicks on the Action Icon]
              ↓
'background.js' (Service Worker) Opens the extension using the Chrome Side Panel API.
              ↓
'SidePanel.html' loads the UI and assets.
              ↓
'SidePanel.js' 
├── Initialisation: Calls the Chrome Local Storage API to recover any existing notes created by the user. Includes a migration fallback for notes stored in legacy architecture (V1.0 - 6 Note Hardcoded Limit).
├── Event Binding: Binds event listeners to action buttons including, copy, paste and download.
├── Dynamic Rendering: Generates DOM Elements Dynamically by calling 'renderNoteList()'.
└── Auto Save Buffering: Saves the state of the note after 1 second of no inputs to prevent rapid consumption of the Storage Quota for the Chrome Local Storage API.

### References
[Delayed function]: https://stackoverflow.com/questions/40121246/trigger-function-when-someone-has-stopped-typing-for-1-second 
[Saving the text area as a txt file]: https://stackoverflow.com/questions/65137434/how-can-i-save-a-txt-file-from-the-value-of-a-textarea 
              
