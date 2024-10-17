document.getElementById('loginForm').onsubmit = function(e) {
    e.preventDefault(); // Prevent form submission
    alert('Login successful!'); // Alert for successful login
    window.location.href = 'dashboard.html'; // Redirect to dashboard
};
