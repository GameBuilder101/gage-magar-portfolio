// Get the title and clear it to begin a typing animation
const title = document.querySelector("#title");
const titleText = title.innerText;
title.innerHTML = "";

// Create the cursor for typing the title
const typingCursor = document.createElement("span");
typingCursor.className = "typing-cursor";
typingCursor.innerText = "_";
title.appendChild(typingCursor);

let typeIndex = 0; // Establish a character index to increment
typeTitleStep();

// Types the next letter in the title animation
function typeTitleStep() {
    // Create the character element
    const typedLetter = document.createElement("span");
    typedLetter.className = "typed-letter";
    typedLetter.innerText = titleText.charAt(typeIndex);

    title.insertBefore(typedLetter, typingCursor);
    typeIndex++;

    if (typeIndex >= titleText.length) {
        typingCursor.remove();
    } else {
        setTimeout(typeTitleStep, 80);
    }
}
