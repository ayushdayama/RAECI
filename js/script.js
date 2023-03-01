const loginForm = document.getElementById('login-form');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent the form from submitting

    const userSelect = document.getElementById('user-select');
    const passwordInput = document.getElementById('password');

    const selectedUser = userSelect.value;
    const passwordValue = passwordInput.value;

    if ((selectedUser === 'Radhika' && passwordValue === '10xRadhika') || (selectedUser === 'Ayush' && passwordValue === '10xAyush')) {
        window.location.href = 'homepage.html';
    } else {
        const errorMsg = document.getElementById('error-msg');
        errorMsg.textContent = 'Incorrect password, please try again.';
    }
});

function submitForm() {
    var selectValue = document.getElementById("user-select").value;
    sessionStorage.setItem("selectedValue", selectValue);
    window.location.href = "homepage.html";
}