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
    const checkinsRef = firebase.firestore().collection("checkins");

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