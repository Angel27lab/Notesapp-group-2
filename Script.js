// GET ELEMENTS
const newNoteBtn = document.getElementById("newNoteBtn");
const emptyNewNoteBtn = document.getElementById("emptyNewNoteBtn");
const editor = document.getElementById("editor");
const noteTitle = document.getElementById("noteTitle");
const noteContent = document.getElementById("noteContent");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const closeEditorBtn = document.getElementById("closeEditorBtn");
const notesContainer = document.getElementById("notesContainer");
const pinnedNotes = document.getElementById("pinnedNotes");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const noteCount = document.getElementById("noteCount");
const wordCount = document.getElementById("wordCount");
const darkModeBtn = document.getElementById("darkModeBtn");

// VARIABLES
let notes = JSON.parse(localStorage.getItem("notes")) || [];
let editingNoteId = null;

// SAVE NOTES TO LOCAL STORAGE
function saveNotesToStorage() {
    localStorage.setItem("notes", JSON.stringify(notes));
}

// OPEN EDITOR
function openEditor(note = null) {
    editor.classList.add("active");
    noteTitle.focus();

    if (note) {
        editingNoteId = note.id;
        noteTitle.value = note.title;
        noteContent.value = note.content;
        saveBtn.textContent = "Update";
    } else {
        editingNoteId = null;
        noteTitle.value = "";
        noteContent.value = "";
        saveBtn.textContent = "Save";
    }

    updateWordCount();
}

// CLOSE EDITOR
function closeEditor() {
    editor.classList.remove("active");
    noteTitle.value = "";
    noteContent.value = "";
    editingNoteId = null;
    saveBtn.textContent = "Save";
    updateWordCount();
}

// CREATE / UPDATE NOTE
function saveNote() {
    const title = noteTitle.value.trim();
    const content = noteContent.value.trim();

    // Don't save empty notes
    if (!title && !content) {
        alert("Please write something before saving.");
        return;
    }

    // UPDATE EXISTING NOTE
    if (editingNoteId) {
        const noteIndex = notes.findIndex(
            note => note.id === editingNoteId
        );

        if (noteIndex !== -1) {
            notes[noteIndex].title =
                title || "Untitled Note";

            notes[noteIndex].content =
                content;

            notes[noteIndex].updatedAt =
                new Date().toISOString();
        }
    }

    // CREATE NEW NOTE
    else {
        const newNote = {
            id: Date.now(),
            title: title || "Untitled Note",
            content: content,
            pinned: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        notes.unshift(newNote);
    }

    saveNotesToStorage();
    renderNotes();
    closeEditor();
}

// DELETE NOTE
function deleteNote(id) {
    if (confirm("Are you sure you want to delete this note?")) {
        notes = notes.filter(function(note) {
            return note.id != id;
        });

        saveNotesToStorage();
        renderNotes();
    }
}

// PIN / UNPIN NOTE
function togglePin(id) {
    const note = notes.find(
        note => note.id === id
    );

    if (!note) return;

    note.pinned = !note.pinned;

    saveNotesToStorage();
    renderNotes();
}

// EDIT NOTE
function editNote(id) {
    const note = notes.find(
        note => note.id === id
    );

    if (!note) return;

    openEditor(note);
}

// FORMAT DATE
function formatDate(date) {
    const noteDate = new Date(date);

    return noteDate.toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric"
        }
    );
}

// CREATE NOTE HTML
function createNoteHTML(note) {
    return `
        <article class="note">
            <h3>
                ${escapeHTML(note.title)}
            </h3>

            <p>
                ${escapeHTML(note.content)}
            </p>

            <div class="note-bottom">
                <span class="note-date">
                    ${formatDate(note.updatedAt)}
                </span>

                <div class="note-actions">

                    <button
                        onclick="togglePin(${note.id})"
                        title="Pin note"
                    >
                        ${note.pinned ? "📌" : "📍"}
                    </button>

                    <button
                        onclick="editNote(${note.id})"
                        title="Edit note"
                    >
                        ✏️
                    </button>

                    <button
                        class="delete-btn"
                        data-id="${note.id}"
                        title="Delete note"
                    >
                        🗑️
                    </button>

                </div>
            </div>
        </article>
    `;
}

// DISPLAY NOTES
function renderNotes() {
    const searchTerm =
        searchInput.value.toLowerCase().trim();

    // SEARCH
    const filteredNotes = notes.filter(note => {
        return (
            note.title.toLowerCase().includes(searchTerm) ||
            note.content.toLowerCase().includes(searchTerm)
        );
    });

    // PINNED NOTES
    const pinned = filteredNotes.filter(
        note => note.pinned
    );

    // NORMAL NOTES
    const normalNotes = filteredNotes.filter(
        note => !note.pinned
    );

    // DISPLAY PINNED NOTES
    pinnedNotes.innerHTML =
        pinned.map(createNoteHTML).join("");

    // DISPLAY NORMAL NOTES
    notesContainer.innerHTML =
        normalNotes.map(createNoteHTML).join("");

    // SHOW / HIDE PINNED SECTION
    const pinnedSection =
        pinnedNotes.parentElement;

    if (pinned.length === 0) {
        pinnedSection.style.display = "none";
    } else {
        pinnedSection.style.display = "block";
    }

    // NOTE COUNT
    noteCount.textContent =
        `${filteredNotes.length} ${
            filteredNotes.length === 1
                ? "note"
                : "notes"
        }`;

    // EMPTY STATE
    if (filteredNotes.length === 0) {
        emptyState.classList.add("show");

        if (searchTerm) {
            emptyState.querySelector("h2").textContent =
                "No notes found";

            emptyState.querySelector("p").textContent =
                "Try searching for something else.";

            emptyState.querySelector("button").style.display =
                "none";
        } else {
            emptyState.querySelector("h2").textContent =
                "No notes yet";

            emptyState.querySelector("p").textContent =
                "Create your first note to get started.";

            emptyState.querySelector("button").style.display =
                "inline-block";
        }
    } else {
        emptyState.classList.remove("show");
    }
}

// WORD COUNT
function updateWordCount() {
    const text =
        noteContent.value.trim();

    if (!text) {
        wordCount.textContent = "0 words";
        return;
    }

    const words =
        text.split(/\s+/).length;
    wordCount.textContent =
        `${words} ${
            words === 1
                ? "word"
                : "words"
        }`;
}
// ESCAPE HTML
function escapeHTML(text) {
    const div =
        document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}
// DARK MODE
function toggleDarkMode() {
    document.body.classList.toggle("dark");
    const dark =
        document.body.classList.contains("dark");
    localStorage.setItem(
        "darkMode",
        dark
    );
    darkModeBtn.textContent =
        dark ? "☀️" : "🌙";
}
// LOAD DARK MODE
function loadDarkMode() {
    const dark =
        localStorage.getItem("darkMode");
    if (dark === "true") {
        document.body.classList.add("dark");
        darkModeBtn.textContent = "☀️";
    }
}
// EVENT LISTENERS
newNoteBtn.addEventListener(
    "click",
    () => openEditor()
);
emptyNewNoteBtn.addEventListener(
    "click",
    () => openEditor()
);
saveBtn.addEventListener(
    "click",
    saveNote
);
cancelBtn.addEventListener(
    "click",
    closeEditor
);
closeEditorBtn.addEventListener(
    "click",
    closeEditor
);
searchInput.addEventListener(
    "input",
    renderNotes
);
noteContent.addEventListener(
    "input",
    updateWordCount
);
darkModeBtn.addEventListener(
    "click",
    toggleDarkMode
);
// DELETE BUTTON
document.addEventListener(
    "click",
    function(event) {
        const deleteButton =
            event.target.closest(".delete-btn");
        if (deleteButton) {
            const id =
                Number(deleteButton.dataset.id);
            deleteNote(id);
        }
    }
);
// INITIALIZE APP
loadDarkMode();
renderNotes();
