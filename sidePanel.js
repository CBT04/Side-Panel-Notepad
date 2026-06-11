// Delceration of variables and binding event listeners to buttons.
var active;
var timeoutIDsave;
var timeoutIDdesc;

let notes_obj = {};
let currentNote = "note-1";
chrome.storage.sync.get(["notes", "current"], function(result)
{
    if (result.notes === undefined) {
        notes_obj = {"note-1": {title: "New Note", theme: "green", contents: ""}};
        chrome.storage.sync.set({notes: notes_obj})
    } else {
        notes_obj = result.notes;
    }
    if (result.current === undefined) {
        currentNote = "note-1"
    } else {
        currentNote = result.current;
    }
    const noteList = document.getElementById("notes")
    for (const [key, value] of Object.entries(notes_obj)) {
        const existingNote =  document.createElement("button");
        existingNote.classList.add('note-button');
        existingNote.setAttribute("id", key);
        existingNote.innerHTML = value.title;
        existingNote.style.backgroundColor = getColour(value.theme)
        noteList.appendChild(existingNote);
        existingNote.addEventListener("click", () => switchNote(key));
    }
    switchNote(currentNote);
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

document.getElementById("bin").addEventListener("click", bin);
document.getElementById("bin").addEventListener("mouseover", function() {timeoutIDdesc = setTimeout(function() {info("bin", "bin");}, 1000);});
document.getElementById("bin").addEventListener("mouseout", function() {clear("bin")});

document.getElementById("menu").addEventListener("click", openMenu);
document.getElementById("menu").addEventListener("mouseover", function() {timeoutIDdesc = setTimeout(function() {info("menu", "menu");}, 1000);});
document.getElementById("menu").addEventListener("mouseout", function() {clear("menu")});

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
    

document.getElementById("menuBack").addEventListener("click", closeMenu);

// Functions are sorted in alphabetical order for convinience.
function saveState() 
{   
    /* Peeks to check that the top value is not the same as the current value and pushes a new save to the stack.
    Converts the values to strings and trims any whitespace at the end to make sure that values are correctly compared. */
    if (String(saveStack[saveStack.length-1]).trimEnd() != String(content.value).trimEnd()) 
        {
        saveStack.push(content.value);
        }
    chrome.storage.sync.set({notes: notes_obj});
    console.log(notes_obj);
};

function bin()
{
    // Deletes the contents of the notepad and resets the title to new title.
    content.value = "";
    document.getElementById("fileName").value = "New Note";
    saveState();
}

function createNote()
{   
    const newId = Date.now()
    const noteList = document.getElementById("notes")
    notes_obj[newId] = {title: "New Note", theme: "green", contents: ""};
    const newNote =  document.createElement("button");
    newNote.classList.add('note-button');
    newNote.setAttribute("id", newId);
    newNote.innerHTML = "New Note";
    console.log(notes_obj);
    noteList.appendChild(newNote);
    newNote.addEventListener("click", () => switchNote(newId));
    saveState();
}

function switchNote(noteId)
{   
    currentNote = noteId;
    chrome.storage.sync.set({current : currentNote});
    setContent();
    // Hides the menu popup element.
    popup = document.getElementById("popup");
    popup.style.display = "none";
}

function setContent()
{   
    toChange = notes_obj[currentNote]
    console.log(toChange)
    changeTheme(toChange.theme, currentNote)
    document.getElementById("editor").value = toChange.contents
    document.getElementById("fileName").value = toChange.title
}

function changeTheme(colour, noteId)
{   
    // Switches elements to a specified rgb colour depending on the value of the colour button that was chosen.
    clear(colour);
    switch(colour) 
    {
        case "red":
            document.body.style.background = "rgb(214, 16, 16)";
            document.getElementById("fileName").style.background = "rgb(214, 16, 16)";
            document.getElementById("bin").style.background = "rgb(214, 16, 16)";
            document.getElementById("menu").style.background = "rgb(214, 16, 16)";
            document.getElementById(noteId).style.background = "rgb(214, 16, 16)";
            toChange = notes_obj[noteId]
            toChange.theme = "red"
            saveState();
            break;
        case "green":
            document.body.style.background = "";
            document.getElementById("fileName").style.background = "rgb(53, 158, 35)";
            document.getElementById("bin").style.background = "rgb(53, 158, 35)";
            document.getElementById("menu").style.background = "rgb(53, 158, 35)";
            document.getElementById(noteId).style.background = "rgb(53, 158, 35)";
            toChange = notes_obj[noteId]
            toChange.theme = "green"
            saveState();
            break;
        case "blue":
            document.body.style.background = "rgb(2, 121, 172)";
            document.getElementById("fileName").style.background = "rgb(2, 121, 172)";
            document.getElementById("bin").style.background = "rgb(2, 121, 172)";
            document.getElementById("menu").style.background = "rgb(2, 121, 172)";
            document.getElementById(noteId).style.background = "rgb(2, 121, 172)";
            toChange = notes_obj[noteId]
            toChange.theme = "blue"
            saveState();
            break;
        case "yellow":
            document.body.style.background = "rgb(186, 176, 14)";
            document.getElementById("fileName").style.background = "rgb(186, 176, 14)";
            document.getElementById("bin").style.background = "rgb(186, 176, 14)";
            document.getElementById("menu").style.background = "rgb(186, 176, 14)";
            document.getElementById(noteId).style.background = "rgb(186, 176, 14)";
            toChange = notes_obj[noteId]
            toChange.theme = "yellow";
            saveState();
            break;
    }
};

function clear(button) 
{
    // Clears the textcontent of the corresponding button.
    clearTimeout(timeoutIDdesc);
    if (button == "bin")
    {
        buttonDesc = document.getElementById('description-bin');
    }
    else if (button == "menu")
    {
        buttonDesc = document.getElementById('description-menu');
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
    popup = document.getElementById("popup");
    popup.style.display = "none";
};

function copy() 
{   
    // Uses the navigator object and clipboard API to copy the text area content to the clipboard.
    clear("copy");
    const textToCopy = content;
    textToCopy.select();
    navigator.clipboard.writeText(textToCopy.value);
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

function info(button, pos)
{   
    // Checks if the button is the bin button so that the correct description element can be used to display the information.
    if (button == "bin")
    {
        buttonDesc = document.getElementById('description-bin');
    }
    else if (button == "menu")
    {
        buttonDesc = document.getElementById('description-menu');
    }
    else
    {
        buttonDesc = document.getElementById('description');
    }
    button = document.getElementById(button);
    let buttonText = button.dataset.desc;
    buttonDesc.style.borderStyle = "ridge";

    /* Using getBoundingClientRect method to get the position and size of the button so that the decritpion can float 
    in a position relative to it.*/
    const rect = button.getBoundingClientRect();
    if (pos == "right")
    {
      offsetX = -150; 
    }
    else if(pos == "left")
    {
        offsetX = -15;
    }
    else if(pos == "bin")
    {
        offsetX = -80;
    }
    else if(pos == "menu")
    {
        offsetX = -10;
        buttonDesc.style.top = "20px";
    }
    else
    {
      offsetX = -20;
    }
    buttonDesc.style.left = (rect.right + offsetX) + "px";
    buttonDesc.textContent = buttonText;
    buttonDesc.style.display = "block";
};

function openMenu()
{
    // Opens the popup menu by showing the popup element.
    saveState();
    popup = document.getElementById("popup");
    popup.style.display = "block";
};

async function paste() 
{   
    // Uses the navigator object and clipboard API to read the clipboard contents and paste them into the text area.
    clear("paste");
    const clipboardText = await navigator.clipboard.readText();
    content.value = content.value + clipboardText;
    saveState();
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
            return "rgb(214, 16, 16)";
            break;
        case "green":
            return "rgb(53, 158, 35)";
            break;
        case "blue":
            return "rgb(2, 121, 172)";
            break;
        case "yellow":
            return "rgb(186, 176, 14)";
            break;
    }
};