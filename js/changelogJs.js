// Add the check-in data to the Firestore database
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

// Init Firebase and Ref to DB
firebase.initializeApp(firebaseConfig);

const addButton = document.getElementById("add-log-btn");

addButton.addEventListener("click", () => {
    // Create a modal popup
    const modal = document.createElement("div");
    modal.classList.add("modal");

    // Create modal content
    const modalContent = document.createElement("div");
    modalContent.classList.add("modal-content");

    // Create close button
    const closeButton = document.createElement("span");
    closeButton.classList.add("close");
    closeButton.innerHTML = "&times;";

    //Create Header
    const newChangelogHeader = document.createElement("h2");
    newChangelogHeader.id = "newLogHeader";
    newChangelogHeader.innerHTML = "Add a log";

    // Add header and close button to modal content
    modalContent.appendChild(newChangelogHeader);
    modalContent.appendChild(closeButton);

    // Create form to get details of each table header
    const form = document.createElement("form");

    const dateLabel = document.createElement("label");
    dateLabel.innerHTML = "Date: ";
    const versionLabel = document.createElement("label");
    versionLabel.innerHTML = "Version: ";
    const changesLabel = document.createElement("label");
    changesLabel.innerHTML = "Changes: ";

    // Create input fields for each table header
    const dateInput = document.createElement("input");
    dateInput.placeholder = "Date";
    dateInput.type = "date";
    dateInput.name = "date";
    dateInput.id = "changelogDate";
    dateInput.required = true;

    const versionInput = document.createElement("input");
    versionInput.placeholder = "Eg.: 1.9";
    versionInput.type = "number";
    versionInput.step = "0.01";
    versionInput.name = "version";
    versionInput.id = "changelogVersion";
    versionInput.required = true;

    const changesInput = document.createElement("textarea");
    changesInput.placeholder = "Eg.: Added a new button...";
    changesInput.name = "changes";
    changesInput.id = "Changelogchanges";
    changesInput.rows = 5;
    changesInput.required = true;

    // Create save button
    const saveButton = document.createElement("button");
    saveButton.id = "SaveLog";
    saveButton.type = "button";
    saveButton.textContent = "Save";

    // Add input fields and save button to form
    form.appendChild(dateLabel);
    form.appendChild(dateInput);
    form.appendChild(versionLabel);
    form.appendChild(versionInput);
    form.appendChild(changesLabel);
    form.appendChild(changesInput);
    form.appendChild(saveButton);

    // Add form to modal content
    modalContent.appendChild(form);

    // Add modal content to modal
    modal.appendChild(modalContent);

    // Add modal to body
    document.body.appendChild(modal);

    //Save button add to firebase
    saveButton.addEventListener("click", () => {
        addANewLogToFirebase();
        form.reset();
        document.body.removeChild(modal);
    });

    // Add click event listener to close button
    closeButton.addEventListener("click", () => {
        // Remove modal from body
        document.body.removeChild(modal);
    });
});

function addANewLogToFirebase() {
    const todaysDate = new Date();
    const date = document.getElementById("changelogDate").value;
    const version = document.getElementById("changelogVersion").value;
    const changes = document.getElementById("Changelogchanges").value;
    const docId = todaysDate.toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(/[/: ]/g, "");
    console.log(date + ' - ' + version + ' - ' + changes + ' - ' + docId);

    const db = firebase.firestore();
    db.collection("changelogs").doc(docId).set({
        Date: date,
        Version: version,
        Changes: changes
    })
        .then(function () {
            console.log("Document written with ID: ", docId);
        })
        .catch(function (error) {
            console.error("Error adding document: ", error);
        });
    loadDataFromFirebase();
}

window.addEventListener("orientationchange", function () {
    if (window.orientation == 90 || window.orientation == -90) {
        document.getElementById("landscape-message").style.display = "block";
    } else {
        document.getElementById("landscape-message").style.display = "none";
    }
});

function loadDataFromFirebase() {
    var changelogsRef = firebase.firestore().collection('changelogs');
    var tableBody = document.getElementById('changelogTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    changelogsRef.orderBy('Version', 'desc').get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            var data = doc.data();

            var row = document.createElement('tr');

            var dateCell = document.createElement('td');
            var dateParts = data.Date.split('-'); // Split the date string by hyphen
            var year = parseInt(dateParts[0]);
            var month = parseInt(dateParts[1]) - 1; // Months in JavaScript are zero-based
            var day = parseInt(dateParts[2]);
            var formattedDate = new Date(year, month, day).toLocaleDateString('en-US', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }).toUpperCase();
            dateCell.textContent = formattedDate;
            row.appendChild(dateCell);

            var versionCell = document.createElement('td');
            versionCell.textContent = data.Version;
            row.appendChild(versionCell);

            var changesCell = document.createElement('td');
            changesCell.textContent = data.Changes;
            row.appendChild(changesCell);

            tableBody.appendChild(row);
        });
    }).catch(function(error) {
        console.log('Error getting changelogs:', error);
    });
}

window.addEventListener('DOMContentLoaded', loadDataFromFirebase());