// Created by @Amit Parekh
// This file has the application implementation

/**
 * Retrieves the auth configuration from the server
 */
const fetchAuthConfig = () => fetch("/auth_config.json");

// Will run when page finishes loading
window.onload = async () => {
  updateUI();
};


// function 'callAPI()' was added for API authorization testing when used from the browser.

const callApi = async (operation) => {

  // For example baseURL could be https://hello.us.auth0.com/
  var baseURL = "<your_auth0_domain>";

  try {
    // Get the KBA Form Data.

    var dob = document.getElementById("dob").value;
    var postcode = document.getElementById("postcode").value;
    var userId = document.getElementById("userId").value;
    var emailId = document.getElementById("emailId").value;
    var auth0State = document.getElementById("auth0State").value;
    console.log("dob        : " + dob);
    console.log("postcode   : " + postcode);
    console.log("userId     : " + userId);
    console.log("emailId    : " + emailId);
    console.log("auth0State : " + auth0State);
    var kbaStatus = "Y";

    var redirectURL = baseURL + "continue?state=" + auth0State;

    console.log("redirectURL : " + redirectURL);

    // Submit KBA data to an API.
    var requestURL = "/kba/check";
    console.log("KBA Update 'requestURL' : " + requestURL);

    // Start AXIOS imp
    const options = {
      method: 'post',
      url: requestURL,
      params: {
        dummyParam: "ignoreMe",
        userId: userId,
        emailId: emailId,
        dob: dob,
        postcode: postcode
      },
      headers: {
        Accept: 'application/json'
      }
    };

    // send the request and await the response.
    const response = await axios(options);

    var responseData = response.data;

    console.log("Response from KBA Check API call : " + JSON.stringify(responseData, {}, 2));

    /** Will get JSON response like this.
          {"msg": "PASSED"}  ...or....  {"msg": "FAILED"}  ....or....  {"msg": "ERROR"}
    */

    var message = JSON.stringify(responseData, {}, 2);

    if (message.includes("msg") && message.includes("FAILED")) {
      // Redirect to Access Denied Page
      location.replace("/denylogin");
    } else if (message.includes("msg") && message.includes("ERROR")) {
      // Redirect to Error Page
      location.replace("/error");
    } else if (message.includes("msg") && message.includes("PASSED")) {
      // Redirect back to Auth0
      location.assign(redirectURL);
    } else {
      // Redirect to Error Page
      location.replace("/error");
    }




  } catch (e) {
    // Display errors in the console
    console.error(e);
    //showDebugMessage('Caught Error in function callAPI:' + e);
  }

}

// Helper function

function GetURLParameter(sParam) {

  var sPageURL = window.location.search.substring(1);
  var sURLVariables = sPageURL.split("&");

  for (var i = 0; i < sURLVariables.length; i++) {
    var sParameterName = sURLVariables[i].split("=");
    if (sParameterName[0] == sParam) {
      return sParameterName[1];
    }
  }
}

