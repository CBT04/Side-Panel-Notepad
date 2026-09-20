// Makes it so that the action icon will open sidePanel.html in the side panel.
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

chrome.runtime.onInstalled.addListener(() => {
            chrome.contextMenus.create({
            id: 'copy',
            title: 'Copy to SidePanel Notepad',
            type: 'normal',
            contexts: ['selection'],
            visible: true
            });
     });

chrome.storage.onChanged.addListener((changes) => {
    if (changes.isMenu) {
        const isOpenMenu = changes.isMenu.newValue;
         chrome.contextMenus.update('copy', {
            visible: !isOpenMenu
         })
    };
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
        const textToCopy = `${info.selectionText}`;
        if (!textToCopy) return;

        chrome.sidePanel.open({ windowId: tab.windowId });

        // Since the service worker can't access the DOM, the note contents are retrieved from local storage instead.
        chrome.storage.local.get(["notes", "current"], async (result) => {
            let notes = result.notes;
            let currentNote = result.current;

            if (!notes[currentNote]) {
                currentNote = "note-1";
                notes["note-1"] = { title: "New Note", theme: "green", contents: "" };
            }

            const existingText = notes[currentNote].contents;

            // The text is pasted on a new line to improve visibility if the note already has content.
            notes[currentNote].contents = existingText + (existingText ? `\n${textToCopy}` : textToCopy);

            chrome.storage.local.set({notes: notes, current: currentNote});
        }
        )}
);