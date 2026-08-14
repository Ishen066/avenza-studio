import { supabase } from "./supabase-config.js";

const loginForm =
    document.getElementById("adminLoginForm");

const loginMessage =
    document.getElementById("loginMessage");

const loginButton =
    document.getElementById("adminLoginBtn");

const emailInput =
    document.getElementById("adminEmail");

const passwordInput =
    document.getElementById("adminPassword");

const passwordToggle =
    document.getElementById("passwordToggle");


// =====================================
// CHECK EXISTING SESSION
// =====================================

const {
    data: { session }
} = await supabase.auth.getSession();

if (session) {
    window.location.href =
        "./admin-dashboard.html";
}


// =====================================
// SHOW / HIDE PASSWORD
// =====================================

if (passwordToggle) {

    passwordToggle.addEventListener(
        "click",
        function () {

            const icon =
                passwordToggle.querySelector("i");

            if (
                passwordInput.type === "password"
            ) {

                passwordInput.type = "text";

                icon.classList.remove("fa-eye");
                icon.classList.add("fa-eye-slash");

                passwordToggle.setAttribute(
                    "aria-label",
                    "Hide password"
                );

            } else {

                passwordInput.type = "password";

                icon.classList.remove(
                    "fa-eye-slash"
                );

                icon.classList.add("fa-eye");

                passwordToggle.setAttribute(
                    "aria-label",
                    "Show password"
                );

            }

        }
    );
}


// =====================================
// LOGIN
// =====================================

loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const email =
            emailInput.value.trim();

        const password =
            passwordInput.value;


        loginMessage.className =
            "admin-login-message";

        loginMessage.textContent =
            "Signing in...";


        loginButton.disabled = true;

        loginButton.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            <span>Signing In...</span>
        `;


        const {
            data,
            error
        } = await supabase.auth
            .signInWithPassword({

                email: email,
                password: password

            });


        if (error) {

            console.error(
                "Login error:",
                error
            );

            loginMessage.className =
                "admin-login-message error";

            loginMessage.textContent =
                "Invalid email or password.";

            loginButton.disabled = false;

            loginButton.innerHTML = `
                <span>Login to Dashboard</span>
                <i class="fas fa-arrow-right"></i>
            `;

            return;
        }


        if (data.session) {

            loginMessage.className =
                "admin-login-message success";

            loginMessage.textContent =
                "Login successful! Redirecting...";


            setTimeout(() => {

                window.location.href =
                    "./admin-dashboard.html";

            }, 500);

        } else {

            loginMessage.className =
                "admin-login-message error";

            loginMessage.textContent =
                "Unable to create login session.";


            loginButton.disabled = false;

            loginButton.innerHTML = `
                <span>Login to Dashboard</span>
                <i class="fas fa-arrow-right"></i>
            `;
        }

    }
);