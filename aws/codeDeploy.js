const AWS = require('aws-sdk');
const codedeploy = new AWS.CodeDeploy({ region: 'us-west-2'});
const q = require("q");

function codeDeploy() {
  var params = {
    applicationName: 'simulated-disease-surveillance', /* required */
    autoRollbackConfiguration: {
      enabled: false,
      // events: [
      //   DEPLOYMENT_FAILURE | DEPLOYMENT_STOP_ON_ALARM | DEPLOYMENT_STOP_ON_REQUEST,
      //   /* more items */
      // ]
    },
    deploymentConfigName: 'CodeDeployDefault.AllAtOnce',
    deploymentGroupName: 'SDS',
    //description: 'STRING_VALUE',
    fileExistsBehavior: "OVERWRITE",//DISALLOW | OVERWRITE | RETAIN,
    ignoreApplicationStopFailures: true,//true || false,
    revision: {
      gitHubLocation: {
        commitId: '9ca47f11e8b35b731ec41b0315f9232fc4b570a6',
        repository: 'brettbonar/SimulatedDiseaseSurveillance'
      },
      revisionType: "GitHub",//S3 | GitHub | String,
      // s3Location: {
      //   bucket: 'STRING_VALUE',
      //   bundleType: tar | tgz | zip | YAML | JSON,
      //   eTag: 'STRING_VALUE',
      //   key: 'STRING_VALUE',
      //   version: 'STRING_VALUE'
      // },
      // string: {
      //   content: 'STRING_VALUE',
      //   sha256: 'STRING_VALUE'
      // }
    },
    // targetInstances: {
    //   // autoScalingGroups: [
    //   //   'STRING_VALUE',
    //   //   /* more items */
    //   // ],
    //   ec2TagSet: {
    //     ec2TagSetList: [
    //       [
    //         {
    //           Key: 'SDS',
    //           Type: "KEY_ONLY",//KEY_ONLY | VALUE_ONLY | KEY_AND_VALUE,
    //           Value: 'simulated-disease-surveillance'
    //         },
    //         /* more items */
    //       ],
    //       /* more items */
    //     ]
    //   },
    //   // tagFilters: [
    //   //   {
    //   //     Key: 'STRING_VALUE',
    //   //     Type: KEY_ONLY | VALUE_ONLY | KEY_AND_VALUE,
    //   //     Value: 'STRING_VALUE'
    //   //   },
    //   //   /* more items */
    //   // ]
    // },
    //updateOutdatedInstancesOnly: true,//true || false
  };

  let deferred = q.defer();
  codedeploy.createDeployment(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
    
    var params = {
      deploymentId: data.deploymentId /* required */
    };
    codedeploy.waitFor('deploymentSuccessful', params, function(err, data) {
      if (err) deferred.reject(err);
      else     deferred.resolve(data);
    });
  });

  return deferred.promise;
}

module.exports = codeDeploy;
