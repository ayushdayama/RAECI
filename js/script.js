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

// Function to retrieve options from Firebase and populate the select element
function populateSelectOptions() {
  const userSelect = $('#user-select');
  const defaultOption = $('<option value="SelectOne" selected>Select Achiever\'s Name</option>');
  userSelect.empty().append(defaultOption);

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