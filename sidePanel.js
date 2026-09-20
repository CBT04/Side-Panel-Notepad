// Delceration of variables and binding event listeners to buttons.
var timeoutIDsave;
var timeoutIDdesc;

let notes_obj = {};
let currentNote = "note-1";
let upgraded = true;

chrome.storage.local.get(["notes", "current"], function(result)
{   
    if (result.notes === undefined) {
        chrome.storage.local.get("upgraded", function (upgradeResult) {
            if (upgradeResult.upgraded === undefined) {
                chrome.storage.sync.get(["note1", "note2", "note3", "note4", "note5", "note6"], async function(legacyResult) {
                if (legacyResult.note2 !== undefined) {
                    notes_obj["note-1"] = legacyResult.note1;
                    notes_obj["note-2"] = legacyResult.note2;
                    notes_obj["note-3"] = legacyResult.note3;
                    notes_obj["note-4"] = legacyResult.note4;
                    notes_obj["note-5"] = legacyResult.note5;
                    notes_obj["note-6"] = legacyResult.note6;
                } else {
                    notes_obj = {"note-1": {title: "New Note", theme: "green", contents: ""}};
                }
                chrome.storage.local.set({"notes": notes_obj}, function() {
                    chrome.storage.local.set({"upgraded": upgraded});
                    finishSetUp(result.current);
                });
            });
        }
        });
    } else {
        notes_obj = result.notes;
        finishSetUp(result.current);
    }
});

let saveStack = [];
const content = document.getElementById("editor");

/* Checks for an update on the notes storage object and refreshes the current note's contents. Used to update the edited note when the user 
/ copies content from a Chrome web page. */
chrome.storage.onChanged.addListener((changes) => {
    if (changes.notes && notes_obj[currentNote]) {
        notes_obj = changes.notes.newValue;
        content.value = notes_obj[currentNote].contents;
        if (String(saveStack[saveStack.length-1]).trimEnd() != String(content.value).trimEnd()) 
        {
        saveStack.push(content.value);
        }
    }
});

// If the user did not type a fileName into the field the defualt value "Untitled Note" is used instead.
document.getElementById("fileName").addEventListener("focusout", function() {
        if (document.getElementById("fileName").value == "")
        {
            document.getElementById("fileName").value = "Untitled Note";
        }
        document.getElementById(currentNote).textContent = document.getElementById("fileName").value;
        toChange = notes_obj[currentNote]
        toChange.title = document.getElementById("fileName").value
        saveState();
});

// Functions are sorted in alphabetical order for convinience.

// Each button has an event that triggers its associated function or custom tooltip presentation.
function bindEvent(button, posType, func) {
    document.getElementById(button).addEventListener("click", func);
    document.getElementById(button).addEventListener("mouseover", function() {timeoutIDdesc = setTimeout(function() {info(button, posType);}, 1000);});
    document.getElementById(button).addEventListener("mouseout", function() {clear(button)});
};

function changeTheme(colour, noteId)
{   
    // Switches elements to a specified rgb colour depending on the value of the colour button that was chosen.
    clear(colour);
    const selectedColour = getColour(colour)
    document.body.style.background = selectedColour;
    document.getElementById(noteId).style.setProperty("--theme-colour", selectedColour);
    const toChange = notes_obj[noteId];
    toChange.theme = colour;
    document.querySelector(".content").style.setProperty("--theme-colour", selectedColour);
    document.querySelector(".heading").style.setProperty("--theme-colour", selectedColour);
    document.querySelector(".options-bar").style.setProperty("--theme-colour", selectedColour);
    saveState();
};

function clear(button) 
{
    // Clears the textcontent of the corresponding button. 
    clearTimeout(timeoutIDdesc);
    const buttonDesc = getDescription(button);
    buttonDesc.style.display = "none";
};

function closeMenu()
{
    // Closes the popup menu by hiding the popup element.
    if (currentNote !== null) {
        const popup = document.getElementById("popup");
        popup.style.display = "none";
    }
    document.getElementById("menu").style.display = "block";
    chrome.storage.session.set({isMenu: false});
};

function copy() 
{   
    // Uses the navigator object and clipboard API to copy the text area content to the clipboard.
    clear("copy");
    const textToCopy = content;
    textToCopy.select();
    navigator.clipboard.writeText(textToCopy.value);
    saveState();
};

function createNote()
{   
    const newId = Date.now()
    const noteList = document.getElementById("notes")
    notes_obj[newId] = {title: "New Note", theme: "green", contents: ""};
    const newNote =  document.createElement("button");
    newNote.classList.add('note-button');
    newNote.setAttribute("id", newId);
    newNote.textContent = "New Note";

    newNote.style.setProperty('--shadow-w', '3px 3px');
    newNote.addEventListener("click", () => switchNote(newId));
    newNote.addEventListener("contextmenu", (event) => event.preventDefault());
    newNote.addEventListener("contextmenu", () => deleteNote(newId));
    noteList.appendChild(newNote);

    chrome.storage.local.get("theme", function (themeResult) {
    if (themeResult.theme === "dark") {
        newNote.classList.toggle("dark-mode");
    }
    });

    saveState();
    newNote.scrollIntoView({ block: "end" });
};

function deleteNote(key)
{
    // Deletes an existing note from the notes list object.
    delete notes_obj[key];
    const noteList = document.getElementById("notes")
    const toDelete = document.getElementById(key);
    toDelete.style.transition = "transform 0.3s ease-out, opacity 0.3s ease-out";
    toDelete.style.transform = "scale(0.1)";
    toDelete.style.opacity = "0";
    setTimeout(() => {
            noteList.removeChild(toDelete);
            saveState();
            if (currentNote == key) {
                currentNote = null;
                chrome.storage.local.set({"current": null});
            }
            openMenu();
    }, 300);
};

function download() 
{
    // Creates and appends a link to the document body so that it can be saved as a text file.
    clear("save");
    var link = document.createElement('a');
    link.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(content.value));
    let fileName = document.getElementById("fileName").value;

    // If the file name is left empty a defualt value is provided.
    if (fileName == '') 
    {
        fileName = "Untitled Note";
    }

    link.download = fileName + ".txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

function enterFileName() 
{   
    // Clears the defualt fileName input field for convinience when clicked on.
    const fileName = document.getElementById("fileName").value;
    if (fileName == "New Note" || fileName == "Untitled Note")
    {
        document.getElementById("fileName").value = "";
    }
};

function finishSetUp(foundCurrent) {
    // Completes the initial setup process after migration and existing data checks are completed.
    renderNoteList();
    currentNote = foundCurrent || "note-1"

    if (Object.keys(notes_obj).length === 0 || foundCurrent === null) {
        openMenu();
        currentNote = null;
    }
    if (currentNote !== null) {
        chrome.storage.session.set({isMenu: false});
        switchNote(currentNote);
    }
    init();
};

function info(button)
{   
    // Custom tooltips with hardcoded positions relative to the location within the DOM.
    let buttonDesc = getDescription(button);
    
    let buttonElement = document.getElementById(button);
    let buttonText = buttonElement.dataset.desc;
    
    const optionsBar = document.querySelector(".options-bar");
    optionsBar.style.position = "relative"; 

    buttonDesc.style.position = "absolute";
    buttonDesc.style.margin = "0px";
    buttonDesc.style.borderStyle = "ridge";
    buttonDesc.style.display = "block";
    buttonDesc.textContent = buttonText;

    buttonDesc.style.left = "auto";
    buttonDesc.style.right = "auto";

    if (button === "save") {
        buttonDesc.style.left = "39px";
    } 
    else if (button === "undo") {
        buttonDesc.style.left = "76px"; 
    } 
    else if (button === "copy") {
        buttonDesc.style.left = "113px"; 
    } 
    else if (button === "paste") {
        buttonDesc.style.left = "150px"; 
    }
    else if (button === "blue") {
        buttonDesc.style.right = "39px";
    } 
    else if (button === "yellow") {
        buttonDesc.style.right = "76px";
    } 
    else if (button === "red") {
        buttonDesc.style.right = "113px";
    } 
    else if (button === "green") {
        buttonDesc.style.right = "150px";
    } 
    else if (button === "menu" || button === "menu-back") {
        buttonDesc.style.left = "35px";
    } 
    else if (button === "dark-button") {
        buttonDesc.style.right = "35px";
    }
    
    if (button !== "menu" && button !== "menu-back" && button !== "dark-button") {
            buttonDesc.style.top = "40px"; 
    } 
    else {
            buttonDesc.style.top = "32px"; 
    }
};

function init() {

    chrome.storage.local.get("theme", function (themeResult) {
        if (themeResult.theme === "dark") {
            switchDark();
        }
    });

    const buttonMap = new Map();

    buttonMap.set("save", ["left", download]);
    buttonMap.set("undo", ["", undo]);
    buttonMap.set("copy", ["", copy]);
    buttonMap.set("paste", ["", paste]);
    buttonMap.set("green", ["right", () => changeTheme("green", currentNote)]);
    buttonMap.set("red", ["right", () => changeTheme("red", currentNote)]);
    buttonMap.set("yellow", ["right", () => changeTheme("yellow", currentNote)]);
    buttonMap.set("blue", ["right", () => changeTheme("blue", currentNote)]);
    buttonMap.set("menu", ["menu", openMenu]);
    buttonMap.set("menu-back", ["menu", closeMenu]);
    buttonMap.set("dark-button", ["menu", switchDark]);

    buttonMap.forEach (function(value, key) {
        // Value[0] is the position of the tooltip and value[1] is the function associated with the button.
        bindEvent(key, value[0], value[1]);
    });

    document.getElementById("add-note").addEventListener("click", createNote);
    document.getElementById("fileName").addEventListener("click", enterFileName);
};

function openMenu()
{
    // Opens the popup menu by showing the popup element.
    saveState();
    chrome.storage.session.set({isMenu: true});
    const popup = document.getElementById("popup");
    popup.style.display = "block";
    document.getElementById("menu").style.display = "none";
    if (currentNote !== null) {
        const noteElement = document.getElementById(currentNote);
        if (noteElement) {
            noteElement.scrollIntoView({ block: "end" });
        }
    }
};

async function paste() 
{   
    // Uses the navigator object and clipboard API to read the clipboard contents and paste them into the text area.
    clear("paste");
    const clipboardText = await navigator.clipboard.readText();
    content.value = content.value + clipboardText;
    saveState();
};

function renderNoteList() 
{
    // Loops through the note object setting the style values and ids for each note saved by the user.
    const noteList = document.getElementById("notes")
    for (const [key, value] of Object.entries(notes_obj)) {
        const existingNote =  document.createElement("button");
        existingNote.classList.add('note-button');
        existingNote.setAttribute("id", key);
        existingNote.textContent = value.title;

        const noteColour = getColour(value.theme)
        existingNote.style.setProperty('--theme-colour', noteColour)
        existingNote.style.setProperty('--shadow-w', '3px 3px');
        noteList.appendChild(existingNote);
        existingNote.addEventListener("click", () => switchNote(key));
        existingNote.addEventListener("contextmenu", (event) => event.preventDefault());
        existingNote.addEventListener("contextmenu", () => deleteNote(key));
    }
};

function saveState() 
{   
    /* Peeks to check that the top value is not the same as the current value and pushes a new save to the stack.
    Converts the values to strings and trims any whitespace at the end to make sure that values are correctly compared. */
    if (String(saveStack[saveStack.length-1]).trimEnd() != String(content.value).trimEnd()) 
        {
        saveStack.push(content.value);
        }
    chrome.storage.local.set({notes: notes_obj});
};

function setContent()
{   
    const toChange = notes_obj[currentNote];
    changeTheme(toChange.theme, currentNote);
    document.getElementById("editor").value = toChange.contents;
    document.getElementById("fileName").value = toChange.title;
};

function switchDark() 
{   
    // Updates the icons and child elements of the body tag to their dark mode styles.
    const isDark = document.body.classList.toggle("dark-mode");

    const image = document.getElementById("dark-light-img");
    image.src = isDark ? "images/light.png" : "images/dark.png";
    let mode = isDark ? "dark" : "light";
    console.log(isDark)
    chrome.storage.local.set({"theme": mode});
    
    const green = document.getElementById("g");
    const red = document.getElementById("r");
    const blue = document.getElementById("b");
    const yellow = document.getElementById("y");

    green.src = isDark ? "images/green-dark.png" : "images/green.png";
    red.src = isDark ? "images/red-dark.png" : "images/red.png";
    blue.src = isDark ? "images/blue-dark.png" : "images/blue.png";
    yellow.src = isDark ? "images/yellow-dark.png" : "images/yellow.png";
};

function switchNote(noteId)
{   
    if (currentNote != null) {
        document.getElementById(currentNote).style.setProperty('--shadow-w', '3px 3px');
    }
    currentNote = noteId;
    chrome.storage.local.set({current : currentNote});
    setContent();
    // Hides the menu popup element.
    closeMenu();
    if (currentNote != null) {
        document.getElementById(currentNote).style.setProperty('--shadow-w', '7px 7px');
    }
};

function undo() 
{   
    // Removes the latest item from the stack and peeks to provide the last save state. If the stack is empty the content is also empty.
    clear("undo");
    saveStack.pop();
    let lastSave = saveStack[saveStack.length-1] || '';
    content.value = lastSave;
    notes_obj[currentNote].contents = lastSave;
    chrome.storage.local.set({notes: notes_obj});
};

content.addEventListener("input", function() 
{
    // Timeout used to make sure that there is a 1 second delay after input before saving to prevent unnecessary save states.
    clearTimeout(timeoutIDsave);
    timeoutIDsave = setTimeout(function() {
        toChange = notes_obj[currentNote]
        toChange.contents = content.value;
        saveState();
    }, 1000);
});

function getColour(colour) {
    switch(colour) 
    {
        case "red":
            return "#F77373";
        case "green":
            return "#50BB3D";
        case "blue":
            return "#529EBF";
        case "yellow":
            return "#CCC31B";
    }
};

function getDescription(button) {
    let buttonDesc;
    if (button == "bin")
    {
        buttonDesc = document.getElementById('description-bin');
    }    
    else if (button == "info")
    {
        buttonDesc = document.getElementById('description-info');
    }
    else if (button == "menu")
    {
        buttonDesc = document.getElementById('description-menu');
    }
    else if (button == "menu-back")
    {
        buttonDesc = document.getElementById('description-menu-back');
    }
    else if (button == "dark-button")
    {
        buttonDesc = document.getElementById('description-theme');
    }
    else
    {
        buttonDesc = document.getElementById('description');
    }
    return buttonDesc;
};