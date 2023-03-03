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

// Retrieve the sessionId value from the URL parameter
const urlParams = new URLSearchParams(window.location.search);
const sessionId = urlParams.get('sessionId');

// Listen for changes to the Firebase database
firebase.database().ref('sessions/' + sessionId).on('value', function (snapshot) {
    // Check if selectedValue is present in sessionStorage
    var selectedValue = sessionStorage.getItem("selectedValue");

    // If selectedValue is not present in sessionStorage, retrieve it from the Firebase database
    if (selectedValue === null) {
        selectedValue = snapshot.child("selectedValue").val();
    }

    // Update sessionStorage with the retrieved value
    sessionStorage.setItem("selectedValue", selectedValue);

    // Update the welcome header with the selected value
    changeHeader(selectedValue);
});

function checkSessionStorage() {
    // Retrieve the selectedValue from the sessionStorage
    var selectedValue = sessionStorage.getItem("selectedValue");
    if (selectedValue !== null) {
        changeHeader(selectedValue);
    }
}

function changeHeader(selectedValue) {
    document.getElementById("welcomeHeader").innerHTML = "हेल्लो<br>" + selectedValue + " जी";
}

function loadPastData() {
    const db = firebase.firestore();
    const table = document.getElementById("checkinHistory");
    db.collection("checkins").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const newRow = table.insertRow(1);
            const dateCell = newRow.insertCell(0);
            const timeCell = newRow.insertCell(1);
            const nameCell = newRow.insertCell(2);
            dateCell.innerHTML = doc.data().date;
            timeCell.innerHTML = doc.data().time;
            nameCell.innerHTML = doc.data().name;
        });
    });
}

function logout() {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('user');
    firebase.database().ref('sessions/' + sessionId).remove();
    sessionStorage.removeItem("selectedValue");
    window.location.href = 'index.html';
}

function handleCheckin() {
    const date = new Date();
    const dateString = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    const timeString = date.toLocaleTimeString('en-GB');
    const name = sessionStorage.getItem("selectedValue");

    const db = firebase.firestore();
    db.collection("checkins").add({
        date: dateString,
        time: timeString,
        name: name
    })
        .then(function (docRef) {
            console.log("Document written with ID: ", docRef.id);
        })
        .catch(function (error) {
            console.error("Error adding document: ", error);
        });

    // Update the HTML table with the new entry
    const table = document.getElementById("checkinHistory");
    const newRow = table.insertRow(1);
    const dateCell = newRow.insertCell(0);
    const timeCell = newRow.insertCell(1);
    const nameCell = newRow.insertCell(2);
    dateCell.innerHTML = dateString;
    timeCell.innerHTML = timeString;
    nameCell.innerHTML = name;
}