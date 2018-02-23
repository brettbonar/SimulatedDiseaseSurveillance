// Load the SDK for JavaScript
const AWS = require("aws-sdk");
const q = require("q");

// Set the region 
AWS.config.update({region: "us-west-2"});
// Use Q implementation of Promise
AWS.config.setPromisesDependency(require('Q').Promise);

// Create EC2 service object
const ec2 = new AWS.EC2({apiVersion: "2016-11-15"});

function createInstance(process) {// AMI is amzn-ami-2011.09.1.x86_64-ebs
  let instanceParams = {
    ImageId: "ami-91af20e9", 
    InstanceType: "t2.micro",
    KeyName: "bbonar",
    MinCount: 1,
    MaxCount: 1
  };

  let deferred = new q.defer();
  
  // Create a promise on an EC2 service object
  let instancePromise = new AWS.EC2({apiVersion: "2016-11-15"}).runInstances(instanceParams).promise();
  
  // Handle promise's fulfilled/rejected states
  instancePromise.then(
    function(data) {
      console.log(data);
      let instanceId = data.Instances[0].InstanceId;
      console.log("Created instance", instanceId);
      // Add tags to the instance
      tagParams = {Resources: [instanceId], Tags: [
         {
            Key: "SDS",
            Value: "simulated-disease-surveillance"
         },
         {
           Key: "Name",
           Value: process.id
         }
      ]};
      // Create a promise on an EC2 service object
      let tagPromise = new AWS.EC2({apiVersion: "2016-11-15"}).createTags(tagParams).promise();
      // Handle promise's fulfilled/rejected states
      tagPromise.then(
        function(data) {
          console.log("Instance tagged");
          deferred.resolve(instanceId);
        }).catch(
          function(err) {
          console.error(err, err.stack);
        });
    }).catch(
      function(err) {
      console.error(err, err.stack);
    });

    return deferred.promise;
}

module.exports = createInstance;
