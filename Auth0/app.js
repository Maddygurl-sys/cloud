
const domain = "dev-g5564efz0p8po4ys.us.auth0.com";
const clientId = "YvcOASyXGZGCmeLjjci7YNBDOiIQQ1bZ";

let auth0Client;

async function init() {
    try {
        auth0Client = await auth0.createAuth0Client({
            domain: domain,
            clientId: clientId,
            authorizationParams: {
                redirect_uri: "http://localhost:5500"
            }
        });

        if (window.location.search.includes("code=")) {
            await auth0Client.handleRedirectCallback();

            window.history.replaceState(
                {},
                document.title,
                window.location.pathname
            );
        }

        document.getElementById("loginBtn").disabled = false;
        document.getElementById("signupBtn").disabled = false;

        await showUser();
    } catch (error) {
        console.error("Auth0 error:", error);

        document.getElementById("message").innerText =
            "Auth0 initialisation failed";

        document.getElementById("error").innerText =
            error.message;
    }
}

async function login() {
    try {
        await auth0Client.loginWithRedirect();
    } catch (error) {
        document.getElementById("error").innerText = error.message;
    }
}

async function signup() {
    try {
        await auth0Client.loginWithRedirect({
            authorizationParams: {
                screen_hint: "signup"
            }
        });
    } catch (error) {
        document.getElementById("error").innerText = error.message;
    }
}

async function logout() {
    await auth0Client.logout({
        logoutParams: {
            returnTo: "http://localhost:5500"
        }
    });
}

async function showUser() {
    const authenticated = await auth0Client.isAuthenticated();

    document.getElementById("logoutBtn").disabled = !authenticated;

    if (authenticated) {
        const user = await auth0Client.getUser();

        document.getElementById("message").innerText =
            "Welcome " + (user.name || user.email || "User");

        document.getElementById("email").innerText =
            user.email || "";
    } else {
        document.getElementById("message").innerText = "Not Logged In";
        document.getElementById("email").innerText = "";
    }
}

init();

