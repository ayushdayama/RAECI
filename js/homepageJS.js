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
var selectedNameInDropDown;

// Listen for changes to the Firebase database
firebase.database().ref('sessions/' + sessionId).once('value', function (snapshot) {
  console.log(snapshot.val());
  // Check if selectedValue is present in sessionStorage
  var selectedValue = sessionStorage.getItem("selectedValue");
  if (selectedValue !== null && selectedValue !== undefined) {
    selectedNameInDropDown = selectedValue.toUpperCase();
  }

  // If selectedValue is not present in sessionStorage, retrieve it from the Firebase database
  if (selectedValue === null || selectedValue === undefined) {
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
  document.getElementById("welcomeHeader").innerHTML = "WELCOME<br>" + selectedNameInDropDown;
}

const form = document.querySelector("#check-in-form");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const activity = document.querySelector("#activity").value;
  console.log(activity);
  // do something with the activity data, such as saving to a database
  form.reset();
});

function logout() {
  localStorage.removeItem('loggedIn');
  localStorage.removeItem('user');
  firebase.database().ref('sessions/' + sessionId).remove();
  sessionStorage.removeItem("selectedValue");
  window.location.href = 'index.html';
}

function handleCheckin() {
  if (document.getElementById("activity").value === "") {
    document.getElementById("errMsg").innerHTML = "Oopsie! Don't forget your activity details! 😄";
    return;
  }
  document.getElementById("errMsg").innerHTML = null;
  const date = new Date();
  const dateString = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  const timeString = date.toLocaleTimeString('en-GB');
  const name = sessionStorage.getItem("selectedValue");
  const activity = document.getElementById("activity").value;

  const db = firebase.firestore();
  db.collection("checkins").add({
    date: dateString,
    time: timeString,
    name: name,
    activity: activity
  })
    .then(function (docRef) {
      console.log("Document written with ID: ", docRef.id);
    })
    .catch(function (error) {
      console.error("Error adding document: ", error);
    });
  document.getElementById("ackMsg").innerHTML = "Done Champ!";
}

window.addEventListener("orientationchange", function () {
  if (window.orientation == 90 || window.orientation == -90) {
    document.getElementById("landscape-message").style.display = "block";
  } else {
    document.getElementById("landscape-message").style.display = "none";
  }
});