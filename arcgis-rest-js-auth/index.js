import { UserSession } from "@esri/arcgis-rest-auth";
import { clientID } from "./secret";

let session = null;
// Successful login will redirect here. This URL must be registered with the app definition on the server.
const redirectUri = window.location.origin + "/authenticate.html";

document.getElementById("withPopupButton").addEventListener("click", (event) => {
  // Begin an OAuth2 login using a popup.
  UserSession.beginOAuth2({
    clientId: clientID,
    redirectUri: redirectUri,
    popup: true
  })
  .then((newSession) => {
    // Upon a successful login, update the session with the new session.
    session = newSession;
    console.log(session);
    updateSessionInfo(session);
  })
  .catch((error) => {
    console.log(error);
  });
  event.preventDefault();
});

document.getElementById("signOutButton").addEventListener("click", (event) => {
  event.preventDefault();
  session = null; // Clear the previous session.
  localStorage.removeItem("__ARCGIS_REST_USER_SESSION__");
  updateSessionInfo();
});

const serializedSession = localStorage.getItem("__ARCGIS_REST_USER_SESSION__"); // Check to see if there is a serialized session in local storage.

if (serializedSession !== null && serializedSession !== "undefined") {
  let parsed = JSON.parse(serializedSession);
  parsed.tokenExpires = new Date(parsed.tokenExpires); // Cast the tokenExpires property back into a date.
  session = new UserSession(parsed);
  localStorage.removeItem("__ARCGIS_REST_USER_SESSION__");
}

function updateSessionInfo(session) {
  let sessionInfo = document.getElementById("sessionInfo");

  if (session) {
    sessionInfo.classList.remove("bg-info");
    sessionInfo.classList.add("bg-success");
    sessionInfo.innerHTML = "Logged in as " + session.username;
    localStorage.setItem("__ARCGIS_REST_USER_SESSION__", session.serialize());
  } else {
    sessionInfo.classList.remove("bg-success");
    sessionInfo.classList.add("bg-info");
    sessionInfo.innerHTML = "Log in to start a session.";
  }
}

updateSessionInfo(session);
