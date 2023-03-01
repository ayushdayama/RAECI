var selectedValue = sessionStorage.getItem("selectedValue");
function changeHeader() {
    document.getElementById("welcomeHeader").innerHTML = "हेल्लो " + selectedValue + " जी";
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

function handleCheckin() {
    // Get the current date and time
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