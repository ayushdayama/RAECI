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
const fromDate = document.getElementById("from-date");
const toDate = document.getElementById("to-date");
const searchForm = document.getElementById("search-form");

function getReports() {
    // Get a reference to the checkins collection
    const checkinsRef = firebase.firestore().collection("checkins");

    // Build the query based on the search criteria
    let query = checkinsRef;
    if (nameSelect.value) {
        query = query.where("name", "==", nameSelect.value);
    }
    if (fromDate.value) {
        const startDate = new Date(fromDate.value);
        startDate.setHours(0, 0, 0, 0);
        query = query.where("timestamp", ">=", startDate.getTime());
    }
    if (toDate.value) {
        const endDate = new Date(toDate.value);
        endDate.setHours(23, 59, 59, 999);
        query = query.where("timestamp", "<=", endDate.getTime());
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
            if (fromDate.value && report.date < new Date(fromDate.value)) {
                return false;
            }
            if (toDate.value && report.date > new Date(toDate.value)) {
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
    }).catch((error) => {
        console.error("Error getting documents: ", error);
    });
}
searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    getReports();
});

function resetForm() {
    nameSelect.value = "";
    fromDate.value = "";
    toDate.value = "";
}

resetForm(); // Call resetForm to clear the form on page load.