// Created by @Amit Parekh

// ITEMS TO CHANGE FOR A DEMO
var nameOfOrganization = "KBA";
var orgLogoURL = "";
var width = "";
var height = "60";
var logoImageHTML = "<img src='" + orgLogoURL + "' width='" + width + "' height='" + height + "' />";
var titleMessage = "Welcome to " + nameOfOrganization + "!";
var messageBeforeLogin = "Please Login/Sign-up first to access the portal.";
var welcomeMessageAfterLogin = "welcome to the " + nameOfOrganization + " Portal!";

// URL mapping, from hash to a function that responds to that URL action

const router = {
  "/": () => showContent("content-home"),
  "/profile": () =>
    requireAuth(() => showContent("content-profile"), "/profile"),
  "/login": () => login()
};

//Declare helper functions

/**
 * Iterates over the elements matching 'selector' and passes them
 * to 'fn'
 * @param {*} selector The CSS selector to find
 * @param {*} fn The function to execute for every element
 */
const eachElement = (selector, fn) => {
  for (let e of document.querySelectorAll(selector)) {
    fn(e);
  }
};

/**
 * Tries to display a content panel that is referenced
 * by the specified route URL. These are matched using the
 * router, defined above.
 * @param {*} url The route URL
 */
const showContentFromUrl = (url) => {
  if (router[url]) {
    router[url]();
    return true;
  }

  return false;
};

/**
 * Returns true if `element` is a hyperlink that can be considered a link to another SPA route
 * @param {*} element The element to check
 */
const isRouteLink = (element) =>
  element.tagName === "A" && element.classList.contains("route-link");

/**
 * Displays a content panel specified by the given element id.
 * All the panels that participate in this flow should have the 'page' class applied,
 * so that it can be correctly hidden before the requested content is shown.
 * @param {*} id The id of the content to show
 */
const showContent = (id) => {
  eachElement(".page", (p) => p.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
};


// NEW
const updateUI = async () => {

  emailParam = GetURLParameter('eml');
  var emailId = decodeURI(emailParam);
  console.log("emailParam in URL string : " + emailParam);
  console.log("Email ID in URL string : " + emailId);

  var userIdParam = GetURLParameter('uzr');
  var userId = decodeURI(userIdParam);
  console.log("User ID in URL string : " + userId);

  var stateParam = GetURLParameter('state');
  var auth0DtateValue = decodeURI(stateParam)
  console.log("State Value in URL string : " + auth0DtateValue);

  document.getElementById("userId").value = userId;
  document.getElementById("emailId").value = fixEmailString(emailId);
  document.getElementById("auth0State").value = auth0DtateValue;

};

window.onpopstate = (e) => {
  if (e.state && e.state.url && router[e.state.url]) {
    showContentFromUrl(e.state.url);
  }
};

// Helper function

function fixEmailString(emailId) {

  var fixedEmailId = emailId.replace(/%40/g, "@");

  return fixedEmailId;
}
