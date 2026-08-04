# Chrome Notepad Changelog

**Release Version History**:

V2.2 (August 2026)
- Added Dark Mode.
  
V2.1 (Bug Fix - June 2026)
- Updated the menu layout and fixed a bug regarding the scaling of the UI.
  
V2.0 (June 2026)
- Changed to unlimited note storage.
- Improved UX for greater contrast and consistency.
  
V1.0 (Release - September 2024)
- Now released on the Chrome webstore at https://chromewebstore.google.com/detail/side-panel-notepad/gopjnkhllbiccdmilekbibjdleogkfcj.
- Fixed some issues that occurred upon reloading the extension.

**Development Version History**:

V3.1
- Designed and implemented a dark mode.
- Added a button to toggle between light and dark mode. The selected mode is saved in Chrome local storage so that it is retained on reload.
  
V3.0
- Completed the note storage system.
- Added elements to the menu to better inform the user of the notepad features in addition to breaking up whitespace.
- Added an info element when hovering over the menu button.
- Fixed various bugs that occurred when switching between notes.

V3.0B
- (Incomplete) Up to six notes can be saved by the chrome storage API and accessed within the new menu section.
- Save button has been replaced with a download icon to better reflect is usage.

V2.3
- Added a button that will delete the current note.
- Blank file names will now be replaced with "Untitled Note" as the title.

V2.2
- Used the chrome storage API so that relevent data can be stored when closing the extension and retrieved once the extension is reopened.

V2.1
- Changed the width and height of the notepad so that it is suitable for the standard side panel size making it less intrusive for laptop users.
- Fixed an issue with the description box showing as a white "pixel" when not displaying the descritpion.

V2.0
- The notepad now opens in the side panel rather than as a popup window so that the notepad can be used simultaneously when interacting with sites.
- Minor aesthetic changes to compliment the new side panel window style.

V1.31
- Fixed an issue with the undo button saving duplicate states when the spacebar is pressed.

V1.3
- Added new theme option - yellow.
- Added the ability to paste content from the clipboard.
- Changed the behaviour of hovering over buttons so that descriptions will only appear after not being the button is not clicked for one second, similar to word.

V1.2
- Added button descriptions that appear when hovered over for 1 second.

V1.11
- Minor aesthetic improvements.

V1.1
- Added the ability to copy textarea content to the clipboard.
- Added the ability to change the colour of the notepad.

V1.0 
- Created an undo button that uses a stack to retrieve save states.
- Created a save functionality that converts the text area content into a txt file.

