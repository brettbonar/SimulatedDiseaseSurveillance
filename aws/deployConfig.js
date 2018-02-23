const AWS = require('aws-sdk');
const s3 = new AWS.S3();

// Bucket names must be unique across all S3 users

var myBucket = 'bbonar-simulated-disease-surveillance';
var myKey = 'deployed.json';

function deployConfig(config) {
  let params = { Bucket: myBucket, Key: myKey, Body: JSON.stringify(config) };
  s3.putObject(params, function(err, data) {

      if (err) {

          console.log(err)

      } else {

          console.log("Successfully uploaded data to myBucket/myKey");

      }

   }).promise();
}

module.exports = deployConfig;
