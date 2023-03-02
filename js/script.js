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
var dropdown = document.getElementById("user-select");
var selectedValue;

// Store the selected value in Firebase for the current session
var sessionId = Date.now().toString();

function checkLogin() {
    if (localStorage.getItem('loggedIn') === 'true') {
        window.location.href = "homepage.html?sessionId=" + sessionId;
    }
}

window.onload = function () {
    checkLogin();
};

const loginForm = document.getElementById('login-form');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const selectedUser = document.getElementById('user-select').value;
    const passwordValue = document.getElementById('password').value;

    firebase.database().ref('sessions/' + sessionId).set({
        selectedValue: selectedUser
    });

    if ((selectedUser === 'Radhika' && passwordValue === '10xRadhika') || (selectedUser === 'Ayush' && passwordValue === '10xAyush')) {
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('user', selectedUser);
        sessionStorage.setItem("selectedValue", selectedUser);
        window.location.href = "homepage.html?sessionId=" + sessionId;
    } else {
        const errorMsg = document.getElementById('error-msg');
        errorMsg.textContent = 'Invalid credentials. Please try again.';
    }
});