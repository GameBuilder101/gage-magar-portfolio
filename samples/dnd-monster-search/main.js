let searchTermElement;
const lastSearchTermStorageKey = "gjm5250-last-search-term";

let crElement;
let minHitPointsElement;
let maxHitPointsElement;
let typeElement;
let sizeElement;

const maxResults = 24;
let searchTerm = "";
let nextPage = null;
let prevPage = null;
let pageIndex = 0;

let spinnerElement;

let upperPaginationElement;
let lowerPaginationElement;

let resultsContainerElement;

window.onload = (e) => {
    // Find the various necessary elements
    searchTermElement = document.querySelector("#search-term");
    // Retrieve the previously searched term from browser storage
    const lastSearchTerm = localStorage.getItem(lastSearchTermStorageKey);
    if (lastSearchTerm != null)
        searchTermElement.value = lastSearchTerm;

    crElement = document.querySelector("#cr");
    minHitPointsElement = document.querySelector("#min-hit-points");
    maxHitPointsElement = document.querySelector("#max-hit-points");
    typeElement = document.querySelector("#type");
    sizeElement = document.querySelector("#size");

    spinnerElement = document.querySelector("#spinner");
    spinnerElement.style.display = "none";

    upperPaginationElement = document.querySelector("#upper-pagination");
    updatePagination(upperPaginationElement, 0, 0, true);
    lowerPaginationElement = document.querySelector("#lower-pagination");
    updatePagination(lowerPaginationElement, 0, 0, true);

    resultsContainerElement = document.querySelector("#results-container");

    document.querySelector("#search").onclick = searchOnClick;
}

// When the search button is clicked
function searchOnClick() {
    // Set up the API URL with a page limit
    let url = `https://api.open5e.com/monsters/?limit=${maxResults}`;
    nextPage = "";
    prevPage = "";
    pageIndex = 0;

    // Add the search term
    searchTerm = searchTermElement.value.trim();
    if (searchTerm != "")
        url += `&name__icontains=${encodeURIComponent(searchTerm)}`;
    // Store the search term in local storage
    localStorage.setItem(lastSearchTermStorageKey, searchTerm);

    // Add the challenge rating
    if (crElement.value != "")
        url += `&cr=${crElement.value}`;

    // Add the min hit points
    if (minHitPointsElement.value != "")
        url += `&hit_points__gte=${minHitPointsElement.value}`;

    // Add the max hit points
    if (maxHitPointsElement.value != "")
        url += `&hit_points__lte=${maxHitPointsElement.value}`;

    // Add the type
    if (typeElement.value != "any")
        url += `&type=${typeElement.value}`;

    // Add the size
    if (sizeElement.value != "any")
        url += `&size=${sizeElement.value}`;

    // Send the fetch request
    newFetch(url);
}

// Sends a new fetch request
function newFetch(url) {
    // Update the status display
    spinnerElement.style.display = "block";
    upperPaginationElement.style.display = "none";
    lowerPaginationElement.style.display = "none";
    resultsContainerElement.innerHTML = "";

    fetch(url).then(response => {
        if (response.ok)
            return response.json()
        else
            throw new Error(response.statusText);
    }).then(onFetchJSON).catch(onFetchError);
}

// When the fetch json is successfully retrieved
function onFetchJSON(data) {
    nextPage = data.next;
    prevPage = data.previous;
    spinnerElement.style.display = "none";
    updatePagination(upperPaginationElement, data.count, data.results.length);
    updatePagination(lowerPaginationElement, data.count, data.results.length);
    createResults(data.results);
}

// If there is an error with the fetch
function onFetchError(e) {
    nextPage = null;
    prevPage = null;
    spinnerElement.style.display = "none";
    // Use -1 to indicate an error occurred
    updatePagination(upperPaginationElement, -1, -1);
    updatePagination(lowerPaginationElement, -1, -1);
}

// Creates the result block elements
function createResults(results) {
    let html = "";
    for (let result of results) {
        let image = result.img_main;
        /* Use a placeholder if the monster does not have a defined image source. Additionally, some sources are
         * defined but do not lead to an image path */
        if (image == null || (!image.includes(".png") && !image.includes(".jpg")))
            image = "images/no-image.png";

        html += `<div class="result">
            <img src="${image}" alt="${result.name}">
            <div>
                <h3>${result.name}</h3>
                <p class="document-title">${result.document__title}</p>
                <hr>
                <ul class="stats-block">
                    <li class="stat">Str<br><strong>${result.strength}</strong></li>
                    <li class="stat">Dex<br><strong>${result.dexterity}</strong></li>
                    <li class="stat">Con<br><strong>${result.constitution}</strong></li>
                    <li class="stat">Int<br><strong>${result.intelligence}</strong></li>
                    <li class="stat">Wis<br><strong>${result.wisdom}</strong></li>
                    <li class="stat">Cha<br><strong>${result.charisma}</strong></li>
                </ul>
                <hr>
                <p class="result-info">
                    <strong>Challenge Rating:</strong> ${result.cr}, <strong>Hit Points:</strong> ${result.hit_points}<br>
                    <strong>Type:</strong> ${result.type}, <strong>Size:</strong> ${result.size}<br>
                    <strong>Senses:</strong> ${result.senses}<br>
                    <strong>Languages:</strong> ${result.languages}
                </p>
            </div>
        </div>`;
    }

    // Create the elements by setting the inner HTML
    resultsContainerElement.innerHTML = html;
}

// Updates the status text and page buttons for the given pagination divider element
function updatePagination(element, count, resultsLength, defaultText = false) {
    // If there are no results, only display one pagination element (since there's no point having two of them)
    if (element == lowerPaginationElement && count <= 0) {
        element.style.display = "none";
        return;
    }
    else
        element.style.display = "flex";

    // Use ternary operator to avoid division by zero
    const pageCount = resultsLength != 0 ? Math.ceil(count / maxResults) : 0;

    let html;
    if (defaultText) // Default text
        html = "Press the search button above to begin searching with applied filters";
    else if (count > 0) // Text for if results were found
        html = `<strong>Page ${pageIndex + 1} of ${pageCount}</strong><br>Displaying ${resultsLength} of ${count} results`;
    else if (count == 0) // Text for if no results were found
        html = "No results found with current filters";
    else if (count < 0) // Text for errors
        html = "Something went wrong. Please try again";

    // Set the status text
    document.querySelector(`#${element.id} .status`).innerHTML = html;

    // Update the page left button
    let button = document.querySelector(`#${element.id} .page-left`);
    button.style.opacity = prevPage != null ? 1 : 0;
    button.onclick = pageLeftOnClick;

    // Update the page right button
    button = document.querySelector(`#${element.id} .page-right`);
    button.style.opacity = nextPage != null ? 1 : 0;
    button.onclick = pageRightOnClick;
}

// When the left pagination buttons are clicked
function pageLeftOnClick() {
    if (prevPage == null)
        return;
    pageIndex--;
    newFetch(prevPage);
}

// When the right pagination buttons are clicked
function pageRightOnClick() {
    if (nextPage == null)
        return;
    pageIndex++;
    newFetch(nextPage);
}
