var AWS = require('aws-sdk');

var s3 = new AWS.S3();

// Bucket names must be unique across all S3 users

var myBucket = 'bbonar-simulated-disease-surveillance';

var myKey = 'myBucketKey';

params = {Bucket: myBucket, Key: myKey, Body: 'Hello!'};

s3.putObject(params, function(err, data) {

    if (err) {

        console.log(err)

    } else {

        console.log("Successfully uploaded data to myBucket/myKey");

    }

 });