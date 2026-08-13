import { supabase } from "./supabase-config.js";

const loginForm = document.getElementById("adminLoginForm");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const email = document.getElementById("adminEmail").value.trim();
    const password = document.getElementById("adminPassword").value;

    loginMessage.textContent = "Logging in...";

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        console.error("Login error:", error);

        loginMessage.textContent =
            "Login failed: " + error.message;

        return;
    }

    console.log("Login successful:", data);

    if (data.session) {

        loginMessage.textContent = "Login successful!";

        // Dashboard redirect
        window.location.href = "./admin-dashboard.html";

    } else {

        loginMessage.textContent =
            "Login successful, but no session was created.";
    }
});