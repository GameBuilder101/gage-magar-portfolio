/* ---------------- Portfolio item tilt card effect ---------------- */

VanillaTilt.init(document.querySelectorAll(".portfolio-item"), {
    max: 5,
    scale: 1.1,
    speed: 600
});

/* ---------------- Pausing animations until in view ---------------- */

// Set up observer to play animations if the viewport intersects the element
for (let element of document.querySelectorAll(".pause-until-view")) {
    // Start paused
    element.style.animationPlayState = "paused";

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                element.style.animationPlayState = "running";
                element.style.setProperty("--pause-until-view", "running");
            }
        });
    });

    observer.observe(element);
}

/* ---------------- Animated YouTube embed player loading ---------------- */

// Search for a YouTube player container. If one exists, load the YouTube player API
const playerContainer = document.querySelector(".player-container");
let player;
if (playerContainer != null) {
    player = document.createElement("div");
    playerContainer.appendChild(player);

    // Insert a script to load the YouTube iframe player API asynchronously
    const apiScript = document.createElement("script");
    apiScript.src = "https://www.youtube.com/iframe_api";
    const firstScript = document.querySelectorAll("script")[0];
    firstScript.parentNode.insertBefore(apiScript, firstScript);
}

// Create the YouTube IFrame embed once the API has loaded
function onYouTubeIframeAPIReady() {
    new YT.Player(player, {
        videoId: playerContainer.dataset.video,
        playerVars: {
            color: "white",
            rel: 0
        },
        events: {
            "onReady": (e) => {
                // Set a variable to play a pseduo-element animation that uncovers the video
                playerContainer.style.setProperty("--animation", "player-wipe-after-end ease-out 0.25s");
            }
        }
    });
}

/* ---------------- Image modal ---------------- */

// Search if there is images with a modal feature on this page
const modalImages = document.querySelectorAll(".modal-image");
let imageModal;
let imageModalImage;
let imageModalImageContainer;
let imageModalFigure;
// Create the image modal element if it is necessary for this page
if (modalImages.length > 0) {
    imageModal = document.createElement("div");
    imageModal.id = "image-modal";
    imageModal.classList.add("dark-section");

    // Add contents
    imageModal.innerHTML =
        `<button class="image-modal-close graphic-button"><img src="../images/image-modal-close.svg" alt="Close"></button>` +
        `<div class="content">` +
        `<div id="image-modal-image">` +
        `<img src="" alt="">` +
        `</div>` +
        `<p id="image-modal-figure"></p>` +
        `</div>`;

    document.body.appendChild(imageModal);

    // Add close functionality
    imageModal.addEventListener("click", (e) => {
        // Allow the user to also close the modal by clicking off to the sides
        if (e.target == imageModal || e.target == imageModalImageContainer)
            closeImageModal();
    });
    document.querySelector(".image-modal-close").addEventListener("click", closeImageModal);

    // Obtain elements to be modified once opened
    imageModalImage = document.querySelector("#image-modal-image img");
    imageModalImageContainer = document.querySelector("#image-modal-image");
    imageModalFigure = document.querySelector("#image-modal-figure");

    closeImageModal(); // Start hidden
}

// Add ability to click modal images
for (let element of modalImages) {
    if (document.body.clientWidth >= 850) {
        element.addEventListener("click", openImageModal);
    } else {
        // Disable clicking if the screen is too small to matter
        element.classList.remove("modal-image");
        element.style.cursor = "auto";
    }
}

// Opens the image modal for previewing images at a larger scale
function openImageModal(e) {
    // Modify the image to reflect the one that was clicked
    imageModalImage.src = "";
    imageModalImage.src = e.target.children[0].src.replace(".jpg", "-max.jpg");
    imageModalImage.alt = e.target.children[0].alt;

    // Update the figure text to use either the caption or alt text, depending on what is available
    if (e.target.children.length > 1) {
        imageModalFigure.innerText = e.target.children[1].innerText;
    } else {
        imageModalFigure.innerText = e.target.children[0].alt;
    }

    imageModal.style.pointerEvents = "auto";
    imageModal.style.opacity = 100;
    imageModalImage.style.transform = "scale(1)";
}

// Closes the image modal
function closeImageModal() {
    imageModal.style.pointerEvents = "none";
    imageModal.style.opacity = 0;
    imageModalImage.style.transform = "scale(0.9)";
}