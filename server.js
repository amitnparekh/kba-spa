const express = require('express');
var request = require('request');
var response = require('response');
const app = express();
//const jwt = require('express-jwt');
//const jwksRsa = require('jwks-rsa');
const cors = require('cors');
const bodyParser = require('body-parser');

// Enable CORS
app.use(cors());

const https = require('https');
const http = require('http');
const url = require('url');
const fs = require('fs');

const { join } = require("path");

// Added for API related sample
const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const jwtAuthz = require('express-jwt-authz');

const authConfig = require("./auth_config.json");

var axios = require("axios").default;

// Line to be configured for a demo
const appName = authConfig.orgName + " Application";
const httpPort = authConfig.httpPort;
const httpsPort = authConfig.httpsPort;

// npm install express cors express-jwt jwks-rsa body-parser express-jwt-authz path fs http https url --save

// your express configuration here
// Serve static assets from the /public folder
app.use(express.static(join(__dirname, "public")));

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

var auth0 = require('auth0');
var ManagementClient = auth0.ManagementClient;

// The cert and keys for the HTTPS Server
const privateKey = fs.readFileSync('key.pem', 'utf8');
const certificate = fs.readFileSync('cert.pem', 'utf8');

const credentials = { key: privateKey, cert: certificate };

app.options('*', cors()) // include before other routes


// Update KBA Data
app.post('/kba/check', function (req, res) {

  console.log("Endpoint '/kba/check' was invoked.");

  var kbaData = url.parse(req.url, true).query;

  var dobParam = GetURLParameter('dob', req.url);
  var dob = decodeURI(dobParam);
  console.log("DOB in URL string : " + dob);

  var postcodeParam = GetURLParameter('postcode', req.url);
  var postcode = decodeURI(postcodeParam)
  console.log("postcode in URL string : " + postcode);

  var userEmailIdParam = GetURLParameter('emailId', req.url);
  var emailId = decodeURI(userEmailIdParam)
  console.log("emailId in URL string : " + emailId);

  var userIdParam = GetURLParameter('userId', req.url);
  var userId = decodeURI(userIdParam)
  console.log("userId in URL string : " + userId);


  console.log("Got params  : " + JSON.stringify(kbaData));

  // Check the KBA data given by the User in the CRM
  checkUserKBAinput(userId, dob, postcode);

  console.log("method:: API /kba/check :: Global var kbaCheckOutcome = " + kbaCheckOutcome);

  if (kbaCheckOutcome === "PASSED") {
    return res.status(200).send({ msg: kbaCheckOutcome });
  } else if (kbaCheckOutcome === "FAILED") {
    return res.status(200).send({ msg: kbaCheckOutcome });
  } else if (kbaCheckOutcome === "ERROR") {
    return res.status(200).send({ msg: kbaCheckOutcome });
  } else {
    return res.status(200).send({ msg: "ERROR" });
  }

});

// Endpoint to serve the configuration file
app.get("/auth_config.json", (req, res) => {
  res.sendFile(join(__dirname, "auth_config.json"));
});

// Serve the deny login page
app.get("/denylogin", (_, res) => {
  console.log("Endpoint /denylogin was invoked. Serving denylogin.html");
  res.sendFile(join(__dirname, "denylogin.html"));
});

// Serve the Error page
app.get("/error", (_, res) => {
  console.log("Endpoint /error was invoked. Serving error.html");
  res.sendFile(join(__dirname, "error.html"));
});

// Serve the index page for all other requests
app.get("/*", (_, res) => {
  console.log("Endpoint /* was invoked. Serving index.html");
  res.sendFile(join(__dirname, "index.html"));
});


// Error handler so that a JSON response is returned from your API in the event of a missing or invalid token.
app.use(function (err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    // There should be redirect to the login page.
    return res.status(401).send({ msg: "Invalid or Missing token" });
  }

  next(err, req, res);
});


// function added for modifying KBA info stored in the user_appmetadata.
// Here the userId is actually the user 'sub' attribute.

// Gobal Variable for 
var kbaCheckOutcome = "";

function checkUserKBAinput(userId, dob, postcode) {

  console.log('checkUserKBAinput function called.');

  // Using the access token, create a new auth0.Management instance by passing it the account's Auth0 domain, and the Access Token.
  try {

    // Get a handle to the Auth0 Management API client
    var auth0Manage = getAuth0ManagementClient();

    if (auth0Manage != null) {

      // The Management Client is a valid object and be used for User Management.
      console.log("Got the auth0Manage client object. ");


      // Check the User's KBA Data against what is stored in the User's Auth0 MetaData
      // .....OR.........r
      // make a call to a CRM API here. Hard-coded values checked.
      if (dob === '09-09-1999' && postcode === '1999') {
        kbaCheckOutcome = "PASSED";
      } else {
        kbaCheckOutcome = "FAILED";
      }
      console.log("method:: checkUserKBAinput :: var kbaCheckOutcome = " + kbaCheckOutcome);

      var appMetaData = {};

      appMetaData = {
        "last_kba_check_outcome": kbaCheckOutcome,
        "last_step_up_check_type": "KBA"
      };

      var params = { id: userId };

      auth0Manage.updateAppMetadata(params, appMetaData, function (err, user) {
        if (err) {
          // Handle error.
          console.log(err);
          console.log("User Metadata was NOT updated for User: " + userId);
          kbaCheckOutcome = "ERROR";
        } else {
          // Updated user.
          console.log("User Metadata successfully updated for User: " + userId);
        }
      });

    } else {
      kbaCheckOutcome = "ERROR";
    }

  } catch (error) {
    console.log(error);
    kbaCheckOutcome = "ERROR";
  }

};


// function added for modifying KBA info stored in the user_metadata.
function getAuth0ManagementClient() {

  console.log('getAuth0ManagementClient function called.');

  // Using the access token, create a new auth0.Management instance by passing it the account's Auth0 domain, and the Access Token.
  try {

    /**
     * Client Id and Client Secret of API Explorer App from Auth Config file.
     * domain: authConfig.domain,
     */
    return new ManagementClient({
      domain: authConfig.domain,
      clientId: authConfig.mgmtAPI_clientId,
      clientSecret: authConfig.mgmtAPI_clientSecret,
      scope: authConfig.mgmtAPI_scopes,
      audience: authConfig.mgmtAPI_audience
    });

  } catch (error) {
    console.log(error);
    return null;
  }

};


// Helper function

function GetURLParameter(sParam, sPageURL) {

  var sURLVariables = sPageURL.split("&");

  for (var i = 0; i < sURLVariables.length; i++) {
    var sParameterName = sURLVariables[i].split("=");
    if (sParameterName[0] == sParam) {
      return sParameterName[1];
    }
  }
}

module.exports = app;

const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

httpServer.listen(httpPort);
console.log(appName + " running on HTTP port " + httpPort);

httpsServer.listen(httpsPort);
console.log(appName + " running on HTTPS port " + httpsPort);
