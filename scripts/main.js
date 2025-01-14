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
    // A variable property is required for pseudo-element animations to also be paused
    element.style.setProperty("--pause-until-view", "paused");

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