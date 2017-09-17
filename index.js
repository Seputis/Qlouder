'use strict';

// [START] Variables
const express = require('express');
const firebase = require('firebase');
const admin = require("firebase-admin");
const path = require('path');
const escape = require('escape-html');
const appDir = path.dirname(require.main.filename);
const serviceAccount = require("./firebase-admin.json");
const app = express();
// [END]

app.use(express.static(__dirname + '/public'));

// Firebase admin initializing
  admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://qlouder-c2c18.firebaseio.com/"
  });

// [START] BigQuery
// Imports the Google Cloud client library
const BigQuery = require('@google-cloud/bigquery');
// Array for future queries
var queryArray = [];
// [END]

// [START] Stuff for Google
const projectId = "challenge-aironas";
// [END]

// Getting request from client side with repo name
app.get("/search/:repo?", executeQuery, returnArrayToFrontEnd);

// First middleware
function executeQuery(req, res, next) {
    // GitHub Repo Name taken from the Front-End
    const repoName = req.query.repo;
    // The SQL query to run
    const sqlQuery = "SELECT * FROM [bigquery-public-data:github_repos.sample_repos] WHERE repo_name CONTAINS \""+ escape(repoName) + "\" LIMIT 24";

    // Instantiates a client
    const bigquery = BigQuery({
        projectId: projectId
    });

    // Query options list: https://cloud.google.com/bigquery/docs/reference/v2/jobs/query
    const options = {
        query: sqlQuery,
        useLegacySql: true // Use standard SQL syntax for queries. 
    };

    // Runs the query
    bigquery
        .query(options)
        .then((results) => {
          const rows = results[0];
          printResult(rows);
          queryArray = rows;
          return next();
        })
        .catch((err) => {
          console.error('ERROR:', err);
        });
}

function returnArrayToFrontEnd(req, res, next) {
    res.json({
      queryArray
    })
}


function printResult (rows) {
  rows.forEach(function (row) {
    let str = '';
    for (let key in row) {
      if (str) {
        str = `${str}\n`;
        queryArray.push(str);
      }
      str = `${str}${key}: ${row[key]}`;
      queryArray.push(str);
    }
  });
  return queryArray;
}

// Launch server on PORT 9000
app.listen(9000);