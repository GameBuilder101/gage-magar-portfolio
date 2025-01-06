// Get the title and clear it to begin a typing animation
const title = document.querySelector("#title a");
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

// Set up portfolio tilt card effect
VanillaTilt.init(document.querySelectorAll(".portfolio-item"), {
    max: 5,
    scale: 1.1,
    speed: 600
});

// Set up observer to play animations if the viewport intersects the element
for (let element of document.querySelectorAll(".pause-until-view")) {
    // Start paused
    element.style.animationPlayState = "paused";

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                element.style.animationPlayState = "running";
            }
        });
    });

    observer.observe(element);
}