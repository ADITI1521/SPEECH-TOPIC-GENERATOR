const authApiBaseUrl = "http://localhost:5001/api/auth";

async function signupUser() {
    const name = document.getElementById("name")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value;

    if (!name || !email || !password) {
        alert("Please fill in your name, email and password.");
        return;
    }

    try {
        const response = await fetch(`${authApiBaseUrl}/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.msg || data.message || "Signup failed");
        }

        alert("Signup successful. Please log in.");
        window.location.href = "login.html";
    } catch (error) {
        alert(error.message);
    }
}

async function loginUser() {
    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value;

    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }

    try {
        const response = await fetch(`${authApiBaseUrl}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.msg || "Login failed");
        }

        localStorage.setItem("userId", data.userId);
        localStorage.setItem("userName", data.name);
        window.location.href = "index.html";
    } catch (error) {
        alert(error.message);
    }
}
