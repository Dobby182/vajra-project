// validation.js

// LOGIN VALIDATION
function validateLogin() {
  const email = document.getElementById("login-email");
  const password = document.getElementById("login-password");

  if (email.value.trim() === "") {
    alert("Email is required!");
    return false;
  }

  if (!email.value.includes("@")) {
    alert("Enter a valid email!");
    return false;
  }

  if (password.value.trim() === "") {
    alert("Password cannot be empty!");
    return false;
  }

  if (password.value.length < 6) {
    alert("Password must be at least 6 characters!");
    return false;
  }

  return true;
}

// REGISTER VALIDATION
function validateRegister() {
  const username = document.getElementById("reg-name");
  const email = document.getElementById("reg-email");
  const password = document.getElementById("reg-password");
  const confirm = document.getElementById("reg-confirm");

  if (username.value.trim() === "") {
    alert("Username is required!");
    return false;
  }

  if (!email.value.includes("@")) {
    alert("Enter a valid email!");
    return false;
  }

  if (password.value.length < 6) {
    alert("Password must be at least 6 characters!");
    return false;
  }

  if (password.value !== confirm.value) {
    alert("Passwords do not match!");
    return false;
  }

  return true;
}
