// Functions are sorted in alphabetical order for convenience. 

// Declaration of variables and binding event listeners to buttons.
var active;
var timeoutIDsave;
var timeoutIDdesc;

let notes_obj = {};
let currentNote = "note-1";
let upgraded = true;

chrome.storage.local.get(["notes", "current"], function(result)
{   
    // If the user has pre existing notes.
    if (result.notes === undefined) {
        // Check if the user has just upgraded version and needs to migrate their existing notes.
        chrome.storage.local.get("upgraded", function (upgradeResult) {
            if (upgradeResult.upgraded === undefined) {
                chrome.storage.sync.get(["note1", "note2", "note3", "note4", "note5", "note6"], function(legacyResult) {
                // Add each legacy note to the note object.
                    if (legacyResult.note2  !== undefined) {
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
                    renderNoteList();
                });
            });
        }
        });
    } else {
        notes_obj = result.notes;
        renderNoteList();
    }
    if (result.current === undefined) {
        currentNote = "note-1"
    } else {
        // Open the last note that the user was editing.
        currentNote = result.current;
    }
    // Handles the case where no notes exist by opening the menu on launch.
    if (Object.keys(notes_obj).length === 0 || result.current === null) {
        openMenu();
        currentNote = null;
    }
    if (currentNote !== null) {
        switchNote(currentNote);
    }
});

let saveStack = [];

const content = document.getElementById("editor");

document.getElementById("fileName").addEventListener("click", enterFileName);

document.getElementById("save").addEventListener("click", download);
document.getElementById("save").addEventListener("mouseover", function() {timeoutIDdesc = setTimeout(function() {info_tooltips("save", "left");}, 1000);});
document.getElementById("save").addEventListener("mouseout", function() {clear("save")});

document.getElementById("undo").addEventListener("click", undo);
document.getElementById("undo").addEventListener("mouseover", function() {timeoutIDdesc = setTimeout(function() {info_tooltips("undo");}, 1000);});
document.getElementById("undo").addEventListener("mouseout", function() {clear("undo")});

document.getElementById("copy").addEventListener("click", copy);
document.getElementById("copy").addEventListener("mouseover", function() {timeoutIDdesc = setTimeout(function() {info_tooltips("copy");}, 1000);});
document.getElementById("copy").addEventListener("mouseout", function() {clear("copy")});

document.getElementById("paste").addEventListener("click", paste);
document.getElementById("paste").addEventListener("mouseover", function() {timeoutIDdesc = setTimeout(function() {info_tooltips("paste");}, 1000);});
document.getElementById("paste").addEventListener("mouseout", function() {clear("paste")});

document.getElementById("green").addEventListener("click", function() {changeTheme("green", currentNote)});
document.getElementById("green").addEventListener("mouseover", function() {timeoutIDdesc = setTimeout(function() {info_tooltips("green", "right");}, 1000);});
document.getElementById("green").addEventListener("mouseout", function() {clear("green");});

document.getElementById("red").addEventListener("click", function() {changeTheme("red", currentNote)});
document.getElementById("red").addEventListener("mouseover", function() {timeoutIDdesc = setTimeout(function() {info_tooltips("red", "right");}, 1000);});
document.getElementById("red").addEventListener("mouseout", function() {clear("red")});

document.getElementById("yellow").addEventListener("click", function() {changeTheme("yellow", currentNote)});
document.getElementById("yellow").addEventListener("mouseover", function() {timeoutIDdesc = setTimeout(function() {info_tooltips("yellow", "right");}, 1000);});
document.getElementById("yellow").addEventListener("mouseout", function() {clear("yellow")});

document.getElementById("blue").addEventListener("click", function() {changeTheme("blue", currentNote)});
document.getElementById("blue").addEventListener("mouseover", function() {timeoutIDdesc = setTimeout(function() {info_tooltips("blue", "right");}, 1000);});
document.getElementById("blue").addEventListener("mouseout", function() {clear("blue")});

document.getElementById("menu").addEventListener("click", openMenu);
document.getElementById("menu").addEventListener("mouseover", function() {timeoutIDdesc = setTimeout(function() {info_tooltips("menu", "menu");}, 1000);});
document.getElementById("menu").addEventListener("mouseout", function() {clear("menu")});

document.getElementById("menu-back").addEventListener("click", closeMenu);
document.getElementById("menu-back").addEventListener("mouseover", function() {timeoutIDdesc = setTimeout(function() {info_tooltips("menu-back", "menu");}, 1000);});
document.getElementById("menu-back").addEventListener("mouseout", function() {clear("menu-back")});

document.getElementById("add-note").addEventListener("click", createNote);

// If the user did not type a fileName into the field the default value "Untitled Note" is used instead.
document.getElementById("fileName").addEventListener("focusout", function() {
        if (document.getElementById("fileName").value == "")
        {
            document.getElementById("fileName").value = "Untitled Note";
        }
        document.getElementById(currentNote).textContent = document.getElementById("fileName").value;
        toChange = notes_obj[currentNote]
        toChange.title = document.getElementById("fileName").value
        saveState();
    })

/** 
 * Assigns a unique ID in milliseconds to ensure uniqueness.
 * Creates a corresponding UI button and adds it to the noteList object. 
*/
function createNote()
{   
    const newId = Date.now()
    const noteList = document.getElementById("notes")
    notes_obj[newId] = {title: "New Note", theme: "green", contents: ""};
    const newNote =  document.createElement("button");
    newNote.classList.add('note-button');
    newNote.setAttribute("id", newId);
    newNote.innerHTML = "New Note";
    newNote.addEventListener("click", () => switchNote(newId));
    newNote.addEventListener("contextmenu", (event) => event.preventDefault());
    newNote.addEventListener("contextmenu", () => deleteNote(newId));
    noteList.appendChild(newNote);
    saveState();
    newNote.scrollIntoView({ block: "end" });
}

/** 
 * Switches elements to a specified hex colour depending on the value of the colour button that was chosen.
*/
function changeTheme(colour, noteId)
{   
    clear(colour);
    selectedColour = getColour(colour)
    document.body.style.background = selectedColour;
    document.getElementById("menu").style.background = selectedColour;
    document.getElementById(noteId).style.background = selectedColour;
    toChange = notes_obj[noteId];
    toChange.theme = colour;
    saveState();
};

/** 
 * Clears the tooltip element corresponding with the button that the user was last hovering over.
*/
function clear(button) 
{
    clearTimeout(timeoutIDdesc);
    if (button == "bin")
    {
        buttonDesc = document.getElementById('description-bin');
    }    
    else if  (button == "info")
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
    else
    {
        buttonDesc = document.getElementById('description');
    }
    buttonDesc.style.display = "none";
};

/** 
 * Closes the popup menu by hiding the popup element.
*/
function closeMenu()
{
    if (currentNote !== null) {
        popup = document.getElementById("popup");
        popup.style.display = "none";
    }
    document.getElementById("menu").style.display = "block";
};

/** 
 * Selects the notepad contents and copies them to the clipboard.
*/
function copy() 
{   
    // Uses the navigator object and clipboard API to copy the text area content to the clipboard.
    clear("copy");
    const textToCopy = content;
    textToCopy.select();
    navigator.clipboard.writeText(textToCopy.value);
};

/** 
 * Deletes an existing note from the notes list object and plays a quick animation to make it clear which note is being deleted. 
 * @param {string} key - The ID of the note that is to be deleted. 
 */
function deleteNote(key)
{
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
}

/** 
 * Creates a download link which is automatically triggered.
 * Uses the user provided note name as the name of the file or use default file name if not provided.
*/
function download() 
{
    // Creates and appends a link to the document body so that it can be saved as a text file.
    clear("save");
    var link = document.createElement('a');
    link.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(content.value));
    let fileName = document.getElementById("fileName").value;

    // If the file name is left empty a default value is provided.
    if (fileName == '') 
    {
        fileName = "Untitled Note";
    }

    link.download = fileName + ".txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/** 
 * Clears the default fileName input field for convenience when clicked on.
*/
function enterFileName() 
{   
    const fileName = document.getElementById("fileName").value;
    if (fileName == "New Note" || fileName == "Untitled Note")
    {
        document.getElementById("fileName").value = "";
    }
};

/** 
 * Returns a colour hex value depending on the name input.
 * @param {string} colour - The name of colour to be returned. 
 */
function getColour(colour) {
    switch(colour) 
    {
        case "red":
            return "#F77373";
            break;
        case "green":
            return "#50BB3D";
            break;
        case "blue":
            return "#529EBF";
            break;
        case "yellow":
            return "#CCC31B";
            break;
    }
};

/** 
 * Displays an informational tooltip by updating the styles using strictly defined values for the button which the user is hovering over.
 * @param {string} button - The name of the button that the user is hovering over. 
 */
function info_tooltips(button)
{   
    if (button == "menu")
    {
        buttonDesc = document.getElementById('description-menu');
    }
    else if (button == "menu-back")
    {
        buttonDesc = document.getElementById('description-menu-back');
    }
    else
    {
        buttonDesc = document.getElementById('description');
    }
    
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

    // Position of the tooltip varies for each button.
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
    } else if (button === "menu" || button === "menu-back") {
        buttonDesc.style.left = "35px";
    }
    if (button !== "menu" && button !== "menu-back") {
            buttonDesc.style.top = "40px"; 
    } else {
            buttonDesc.style.top = "32px"; 
    }

}

/** 
 * Displays the popup menu by blocking the current note that is being edited.
*/
function openMenu()
{
    // Opens the popup menu by showing the popup element.
    saveState();
    popup = document.getElementById("popup");
    popup.style.display = "block";
    document.getElementById("menu").style.display = "none";
    if (currentNote !== null) {
        const noteElement = document.getElementById(currentNote);
        if (noteElement) {
            noteElement.scrollIntoView({ block: "end" });
        }
    }
};

/** 
 * Pastes content into the notepad text area from the user's clipboard.
*/
async function paste() 
{   
    // Uses the navigator object and clipboard API to read the clipboard contents and paste them into the text area.
    clear("paste");
    const clipboardText = await navigator.clipboard.readText();
    content.value = content.value + clipboardText;
    saveState();
};

/** 
 * A clickable button for each note in the noteList object is rendered in the GUI.
 * Corresponding functions and IDs are dynamically assigned to each button.
*/
function renderNoteList() 
{
    const noteList = document.getElementById("notes")
    for (const [key, value] of Object.entries(notes_obj)) {
        // Render each note in the GUI and assign Ids and functions to each.
        const existingNote =  document.createElement("button");
        existingNote.classList.add('note-button');
        existingNote.setAttribute("id", key);
        existingNote.innerHTML = value.title;
        existingNote.style.backgroundColor = getColour(value.theme)
        noteList.appendChild(existingNote);
        existingNote.addEventListener("click", () => switchNote(key));
        existingNote.addEventListener("contextmenu", (event) => event.preventDefault());
        existingNote.addEventListener("contextmenu", () => deleteNote(key));
    }
}

/** 
 * Peeks to check that the top value is not the same as the current value and pushes a new save to the stack.
 * Converts the values to strings and trims any whitespace at the end to make sure that values are correctly compared. 
*/
function saveState() 
{   
    if (String(saveStack[saveStack.length-1]).trimEnd() != String(content.value).trimEnd()) 
        {
        saveStack.push(content.value);
        }
    chrome.storage.local.set({notes: notes_obj});
};

/** 
 * Add a heavier box shadow (status indication) to the note button corresponding to the note that was last edited. 
 * @param {string} noteId - The ID of the note that the user was editing prior to opening the menu. 
 */
function switchNote(noteId)
{   
    if (currentNote != null) {
        document.getElementById(currentNote).style.boxShadow = "3px 3px";
    }
    currentNote = noteId;
    chrome.storage.local.set({current : currentNote});
    setContent();
    // Hides the menu popup element.
    closeMenu();
    if (currentNote != null) {
        document.getElementById(currentNote).style.boxShadow = "7px 7px";
    }
}

/** 
 * Updates the current note by updating the filename, contents and colour to match the note that the user has clicked on. 
 */
function setContent()
{   
    toChange = notes_obj[currentNote];
    changeTheme(toChange.theme, currentNote);
    document.getElementById("editor").value = toChange.contents;
    document.getElementById("fileName").value = toChange.title;
}

/** 
 * Removes the latest item from the stack and peeks to provide the last save state. If the stack is empty the content is also empty..
*/
function undo() 
{   
    clear("undo");
    saveStack.pop();
    let lastSave = saveStack[saveStack.length-1];
    content.value = lastSave;
    if (saveStack == '') 
    {
        content.value = '';
    }
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