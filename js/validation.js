function validateRegister() {
    const name = document.getElementById("reg-name").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const pass = document.getElementById("reg-password").value.trim();
    const confirm = document.getElementById("reg-confirm").value.trim();

    // Name check
    if (name.length < 3) {
        alert("Name must be at least 3 characters.");
        return false;
    }

    // Email check
    if (!email.includes("@") || !email.includes(".")) {
        alert("Enter a valid email address.");
        return false;
    }

    // Password length
    if (pass.length < 6) {
        alert("Password must be at least 6 characters.");
        return false;
    }

    // Password match
    if (pass !== confirm) {
        alert("Passwords do not match.");
        return false;
    }

    return true; // allow form to submit
}
 