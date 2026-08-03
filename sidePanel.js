// Delceration of variables and binding event listeners to buttons.
var active;
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
                chrome.storage.sync.get(["note1", "note2", "note3", "note4", "note5", "note6"], function(legacyResult) {
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
        currentNote = result.current;
    }
    if (Object.keys(notes_obj).length === 0 || result.current === null) {
        openMenu();
        currentNote = null;
    }
    if (currentNote !== null) {
        switchNote(currentNote);
    }
});

chrome.storage.local.get("theme", function (themeResult) {
    if (themeResult.theme === "dark") {
        switchDark();
    }
});

let saveStack = [];

const content = document.getElementById("editor");

document.getElementById("fileName").addEventListener("click", enterFileName);

document.getElementById("save").addEventListener("click", download);
document.getElementById("save").addEventListener("mouseover", function() {timeoutIDdesc = setTimeout(function() {info("save", "left");}, 1000);});
document.getElementById("save").addEventListener("mouseout", function() {clear("save")});

document.getElementById("undo").addEventListener("click", undo);
document.getElementById("undo").addEventListener("mouseover", function() {timeoutIDdesc = setTimeout(function() {info("undo");}, 1000);});
document.getElementById("undo").addEventListener("mouseout", function() {clear("undo")});

document.getElementById("copy").addEventListener("click", copy);
document.getElementById("copy").addEventListener("mouseover", function() {timeoutIDdesc = setTimeout(function() {info("copy");}, 1000);});
document.getElementById("copy").addEventListener("mouseout", function() {clear("copy")});

document.getElementById("paste").addEventListener("click", paste);
document.getElementById("paste").addEventListener("mouseover", function() {timeoutIDdesc = setTimeout(function() {info("paste");}, 1000);});
document.getElementById("paste").addEventListener("mouseout", function() {clear("paste")});

document.getElementById("green").addEventListener("click", function() {changeTheme("green", currentNote)});
document.getElementById("green").addEventListener("mouseover", function() {timeoutIDdesc = setTimeout(function() {info("green", "right");}, 1000);});
document.getElementById("green").addEventListener("mouseout", function() {clear("green");});

document.getElementById("red").addEventListener("click", function() {changeTheme("red", currentNote)});
document.getElementById("red").addEventListener("mouseover", function() {timeoutIDdesc = setTimeout(function() {info("red", "right");}, 1000);});
document.getElementById("red").addEventListener("mouseout", function() {clear("red")});

document.getElementById("yellow").addEventListener("click", function() {changeTheme("yellow", currentNote)});
document.getElementById("yellow").addEventListener("mouseover", function() {timeoutIDdesc = setTimeout(function() {info("yellow", "right");}, 1000);});
document.getElementById("yellow").addEventListener("mouseout", function() {clear("yellow")});

document.getElementById("blue").addEventListener("click", function() {changeTheme("blue", currentNote)});
document.getElementById("blue").addEventListener("mouseover", function() {timeoutIDdesc = setTimeout(function() {info("blue", "right");}, 1000);});
document.getElementById("blue").addEventListener("mouseout", function() {clear("blue")});

document.getElementById("menu").addEventListener("click", openMenu);
document.getElementById("menu").addEventListener("mouseover", function() {timeoutIDdesc = setTimeout(function() {info("menu", "menu");}, 1000);});
document.getElementById("menu").addEventListener("mouseout", function() {clear("menu")});

document.getElementById("menu-back").addEventListener("click", closeMenu);
document.getElementById("menu-back").addEventListener("mouseover", function() {timeoutIDdesc = setTimeout(function() {info("menu-back", "menu");}, 1000);});
document.getElementById("menu-back").addEventListener("mouseout", function() {clear("menu-back")});

document.getElementById("dark-button").addEventListener("click", switchDark);
document.getElementById("dark-button").addEventListener("mouseover", function() {timeoutIDdesc = setTimeout(function() {info("dark-button", "menu");}, 1000);});
document.getElementById("dark-button").addEventListener("mouseout", function() {clear("dark-button")});

document.getElementById("add-note").addEventListener("click", createNote);

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
    })

// Functions are sorted in alphabetical order for convinience.
function changeTheme(colour, noteId)
{   
    // Switches elements to a specified rgb colour depending on the value of the colour button that was chosen.
    clear(colour);
    selectedColour = getColour(colour)
    document.body.style.background = selectedColour;
    document.getElementById(noteId).style.setProperty("--theme-colour", selectedColour);
    toChange = notes_obj[noteId];
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
    else if (button == "dark-button")
    {
        buttonDesc = document.getElementById('description-theme');
    }
    else
    {
        buttonDesc = document.getElementById('description');
    }
    buttonDesc.style.display = "none";
};

function closeMenu()
{
    // Closes the popup menu by hiding the popup element.
    if (currentNote !== null) {
        popup = document.getElementById("popup");
        popup.style.display = "none";
    }
    document.getElementById("menu").style.display = "block";
};

function copy() 
{   
    // Uses the navigator object and clipboard API to copy the text area content to the clipboard.
    clear("copy");
    const textToCopy = content;
    textToCopy.select();
    navigator.clipboard.writeText(textToCopy.value);
};

function createNote()
{   
    const newId = Date.now()
    const noteList = document.getElementById("notes")
    notes_obj[newId] = {title: "New Note", theme: "green", contents: ""};
    const newNote =  document.createElement("button");
    newNote.classList.add('note-button');
    newNote.setAttribute("id", newId);
    newNote.innerHTML = "New Note";

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

function info(button)
{   
    // Custom tooltips with hardcoded positions relative to the location within the DOM.
    if (button == "menu")
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
    } else {
            buttonDesc.style.top = "32px"; 
    }

};

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
        existingNote.innerHTML = value.title;

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
    toChange = notes_obj[currentNote];
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
    const blue = document.getElementById("y");
    const yellow = document.getElementById("b");

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