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
const db = firebase.firestore();

// Store the selected value in Firestore for the current session
const sessionId = Date.now().toString();
const loginForm = document.getElementById('login-form');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const selectedUser = document.getElementById('user-select').value;
    const passwordValue = document.getElementById('password').value;
    const userRef = db.collection('loginCredentials').doc(selectedUser);
    const doc = await userRef.get();

    if (doc.exists && doc.data().password === passwordValue) {
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('user', selectedUser);
        sessionStorage.setItem('selectedValue', selectedUser);
        window.location.href = 'homepage.html?sessionId=' + sessionId;
    } else {
        const errorMsg = document.getElementById('error-msg');
        errorMsg.textContent = 'Aw Snap! Champ code is incorrect.';
    }
});