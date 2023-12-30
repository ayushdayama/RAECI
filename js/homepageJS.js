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

// Listen for changes to the Firebase database
firebase.database().ref('sessions/' + sessionId).once('value', function (snapshot) {
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
  document.getElementById("welcomeHeader").innerHTML = "नमस्ते<br>" + selectedNameInDropDown;
  const url = `https://api.quotable.io/random/?tags=exercise|motivation|happiness|Inspiration|determined|focus|clarity|presence|accomplish|balance|courage|belief|gratitude|joy|imagination|curiosity|priority|honesty|mindfulness|challenge|passion|commitment|nurture|zeal`;

  fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(response => response.json())
    .then(data => {
      document.querySelector("#quoteText").innerHTML = `"${data.content}"`,
        document.querySelector("#quoteAuthor").innerHTML = `- ${data.author}     `
    })
    .catch(error => console.error('Error: ', error));
}

const form = document.querySelector("#check-in-form");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  // const activity = "Exercise: " + document.querySelector("#exercise").value + ", Learning: " + document.querySelector("#learning").value;
  const activity = document.querySelector("#learning").value;
  console.log(activity);
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
  if (document.getElementById("learning").value.trim() === "") {
    document.getElementById("ackMsg").innerHTML = "Oopsie! Don't forget your activity details! 😄";
    return;
  }

  const date = new Date();
  const dateString = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  const timeString = date.toLocaleTimeString('en-GB');
  const name = sessionStorage.getItem("selectedValue");
  // const activity = "Exercise: " + document.querySelector("#exercise").value + ", Learning: " + document.querySelector("#learning").value;
  const activity = document.querySelector("#learning").value;
  const docId = date.toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(/[/: ]/g, "");

  const db = firebase.firestore();
  db.collection("LearningOnlyProd").doc(name + ": " + docId).set({
    date: dateString,
    time: timeString,
    name: name,
    activity: activity
  })
    .then(function () {
      console.log("Document written with ID: ", docId);
    })
    .catch(function (error) {
      console.error("Error adding document: ", error);
    });
  document.getElementById("ackMsg").innerHTML = "Done Champ!";
}

window.addEventListener("orientationchange", function () {
  if (window.innerHeight > window.innerWidth) {
    document.getElementById("landscape-message").style.display = "block";
  } else {
    document.getElementById("landscape-message").style.display = "none";
  }
});

window.onload = function () {
  var loadingIcon = document.getElementById("loading-icon");
  setTimeout(function () {
    loadingIcon.style.display = "none";
  }, 300);
};