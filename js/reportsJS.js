// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAVW7vzCOMunDqJylPHgtaJytnYhUJRMzQ",
    authDomain: "raeci0.firebaseapp.com",
    databaseURL: "https://raeci0-default-rtdb.firebaseio.com",
    projectId: "raeci0",
    storageBucket: "raeci0.appspot.com",
    messagingSenderId: "789419507030",
    appId: "1:789419507030:web:0bcf5b7971d1c2e8ed6af7",
    measurementId: "G-J1JQDR2BVR"
};

firebase.initializeApp(firebaseConfig);

// Get a reference to the database
const db = firebase.firestore();

// Initialize the cache object
let imageCache = {};

// Update links for multiple tags
updateImage('raeciLogo', 'raeci-logo', 'src');
updateImage('shortcut-icon', 'raeci-logo', 'href');

// Call the function to get the URL dynamically
function updateImage(elementId, key, attrib) {
    // Check if the image is already in the cache
    if (imageCache.hasOwnProperty(key)) {
        document.getElementById(elementId)[attrib] = imageCache[key];
    } else {
        fetchDataFromFirebaseDatabase('image-links', 'image-links', key)
            .then((imageUrl) => {
                // Update the element with the fetched image URL
                document.getElementById(elementId)[attrib] = imageUrl;

                // Cache the image URL for future use
                imageCache[key] = imageUrl;
            })
            .catch((error) => {
                console.error("Error fetching image URL for element ID", elementId, ":", error);
            });
    }
}

/**
 * Description - Get a value from Firebase Database
 * @param {String} collectionName - Collection Name
 * @param {String} documentName - Document Name
 * @param {String} key - Key's Name that has the required value
 * @returns {Promise} A promise that resolves to the fetched value
 */
function fetchDataFromFirebaseDatabase(collectionName, documentName, key) {
    return new Promise((resolve, reject) => {
        const db = firebase.firestore();
        const docRef = db.collection(collectionName).doc(documentName);

        // Retrieve the document data
        docRef.get().then((doc) => {
            if (doc.exists) {
                const data = doc.data();

                // Check if the key exists in the document
                if (data.hasOwnProperty(key)) {
                    const result = data[key];

                    // Resolve the promise with the result
                    resolve(result);
                } else {
                    reject(new Error("Key not found in the document!"));
                }
            } else {
                reject(new Error("No such document!"));
            }
        }).catch((error) => {
            // Reject the promise with the error
            reject(error);
        });
    });
}

// Get references to the form elements
const reportsTable = document.getElementById("reports-table");
const nameSelect = document.getElementById("name-select");
const searchForm = document.getElementById("search-form");
const pageSizeOptions = [7, 14, 30, 90, 180];
let currentPage = 1;
let pageSize = pageSizeOptions[0];

function renderTableRows(reports) {
    const tbody = reportsTable.querySelector("tbody");
    tbody.innerHTML = "";
    reports.forEach((report) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
        <td>${report.date.toLocaleDateString()}</td>
        <td>${report.time.toLocaleTimeString()}</td>
        <td>${report.name}</td>
        <td>${report.activity}</td>
      `;
        tbody.appendChild(tr);
    });
}

// Function to retrieve options from Firebase and populate the select element
function populateSelectOptions() {
    const userSelect = $('#name-select');
    userSelect.empty();

    // Retrieve options from the "admin" document in the "users" collection
    db.collection('users').doc('admin').get()
        .then(doc => {
            if (doc.exists) {
                const users = doc.data();
                const sortedUsers = Object.values(users).sort();
                sortedUsers.forEach(user => {
                    const option = $('<option></option>').attr('value', user).text(user);
                    userSelect.append(option);
                });
            } else {
                console.log('No such document!');
            }
        })
        .catch(error => {
            console.error('Error getting document:', error);
        });
}

// Call the function to populate options when the DOM is ready
$(document).ready(function () {
    populateSelectOptions();
});

function renderPagination(reports) {
    const paginationContainer = document.createElement("div");
    paginationContainer.id = "pagination-container";
    paginationContainer.className = "pagination-container";
    const totalPages = Math.ceil(reports.length / pageSize);

    const pageSizeSelect = document.createElement("select");
    pageSizeOptions.forEach((option) => {
        const optionElement = document.createElement("option");
        optionElement.textContent = option;
        if (option === pageSize) {
            optionElement.selected = true;
        }
        pageSizeSelect.appendChild(optionElement);
    });
    pageSizeSelect.addEventListener("change", () => {
        pageSize = Number(pageSizeSelect.value);
        currentPage = 1;
        renderTableRows(reports.slice(0, pageSize));
        renderPagination(reports);
    });

    const previousButton = document.createElement("button");
    previousButton.textContent = "Previous";
    previousButton.disabled = currentPage === 1;
    previousButton.addEventListener("click", () => {
        currentPage -= 1;
        renderTableRows(reports.slice((currentPage - 1) * pageSize, currentPage * pageSize));
        renderPagination(reports);
    });

    const nextButton = document.createElement("button");
    nextButton.textContent = "Next";
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener("click", () => {
        currentPage += 1;
        renderTableRows(reports.slice((currentPage - 1) * pageSize, currentPage * pageSize));
        renderPagination(reports);
    });

    paginationContainer.appendChild(pageSizeSelect);
    paginationContainer.appendChild(previousButton);
    paginationContainer.appendChild(nextButton);

    const oldPagination = document.getElementById("pagination-container");
    if (oldPagination !== null) {
        oldPagination.parentNode.replaceChild(paginationContainer, oldPagination);
    } else {
        const tableContainer = document.getElementById("table-container");
        tableContainer.parentNode.insertBefore(paginationContainer, tableContainer.nextSibling);
    }
}

function getReports() {
    // Get a reference to the checkins collection
    const checkinsRef = firebase.firestore().collection("LearningOnlyProd");

    // Build the query based on the search criteria
    let query = checkinsRef;
    if (nameSelect.value) {
        query = query.where("name", "==", nameSelect.value);
    }

    // Fetch the documents that match the query
    query.get().then((snapshot) => {
        // Convert the snapshot into an array of report objects and sort them by date and time in descending order
        const reports = snapshot.docs.map((doc) => {
            const data = doc.data();
            const dateComponents = data.date.split("/");
            const dateObj = new Date(dateComponents[2], dateComponents[1] - 1, dateComponents[0]);
            const timeComponents = data.time.split(":");
            const timeObj = new Date();
            timeObj.setHours(timeComponents[0], timeComponents[1], timeComponents[2]);
            return {
                date: dateObj,
                time: timeObj,
                name: data.name,
                activity: data.activity,
            };
        }).sort((a, b) => {
            if (a.date > b.date) {
                return -1;
            } else if (a.date < b.date) {
                return 1;
            } else {
                // Dates are equal, so sort by time
                if (a.time > b.time) {
                    return -1;
                } else if (a.time < b.time) {
                    return 1;
                } else {
                    return 0;
                }
            }
        });

        // Filter the reports based on the search criteria
        const filteredReports = reports.filter((report) => {
            if (nameSelect.value && report.name !== nameSelect.value) {
                return false;
            }
            return true;
        });

        // Render the filtered reports in the table
        const tableBody = reportsTable.querySelector("tbody");
        tableBody.innerHTML = "";
        filteredReports.forEach((report) => {
            const row = tableBody.insertRow();
            const dateCell = row.insertCell();
            dateCell.textContent = report.date.toLocaleDateString("en-GB");
            const timeCell = row.insertCell();
            timeCell.textContent = report.time.toLocaleTimeString();
            const nameCell = row.insertCell();
            nameCell.textContent = report.name;
            const activityCell = row.insertCell();
            activityCell.textContent = report.activity;
        });

        renderTableRows(filteredReports.slice(0, pageSize));
        renderPagination(filteredReports);
    }).catch((error) => {
        console.error("Error getting documents: ", error);
    });
}
searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    getReports();
});

function updatePaginationButtons(pageCount) {
    // get the pagination container element
    const paginationContainer = document.querySelector('.pagination');

    // remove existing pagination buttons
    paginationContainer.innerHTML = '';

    // add new pagination buttons based on the new page count
    for (let i = 1; i <= pageCount; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        paginationContainer.appendChild(button);
    }
}

// example function that handles drop-down value changes
function handleDropdownChange(event) {
    const selectedValue = event.target.value;
    const pageCount = calculatePageCount(selectedValue);
    updatePaginationButtons(pageCount);
}

function resetForm() {
    nameSelect.value = "";
}

resetForm(); // Call resetForm to clear the form on page load.