const AWS = require("aws-sdk");
AWS.config.update({region: "us-west-2"});
// Use Q implementation of Promise
AWS.config.setPromisesDependency(require("q").Promise);
const ssm = new AWS.SSM();
const _ = require("lodash");

function runCoordinator(process) {
  process = {
    id: "coordinator",
    instanceId: "i-0563e6c9e6d44ed2b"
  };

  let params = {
    DocumentName: "AWS-RunShellScript", /* required */
    Comment: "Run Process: " + process.id,
    TimeoutSeconds: 60,
    InstanceIds: [
      process.instanceId
    ],
    Parameters: {
      "commands": [
        "cd /home/ec2-user/sds; ./node ./startProcess.js --type coordinator"
        /* more items */
      ],
      /* '<ParameterName>': ... */
    },
  };
  ssm.sendCommand(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
  });
}

function runDoa(process) {
  
  let params = {
    DocumentName: "AWS-RunShellScript", /* required */
    Comment: "Run Process: " + process.id,
    TimeoutSeconds: 60
  };
  ssm.sendCommand(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
  });
}

function runHds(process) {
  
  let params = {
    DocumentName: "AWS-RunShellScript", /* required */
    Comment: "Run Process: " + process.id,
    TimeoutSeconds: 60
  };
  ssm.sendCommand(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
  });
}

function runEmr(process) {
  
  let params = {
    DocumentName: "AWS-RunShellScript", /* required */
    Comment: "Run Process: " + process.id,
    TimeoutSeconds: 60
  };
  ssm.sendCommand(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
  });
}

function runProcesses(config) {
  _.each(config.processes, (proces) => {
    if (process.type === "coordinator") {
      runCoordinator(config, process);
    } else if (process.type === "doa") {
      //runDoa(config, process);
    } else if (process.type === "hds") {
      //runHds(config, process);
    } else if (process.type === "emr") {
      //runEmr(config, process);
    }
  });
}

//module.exports = runProcesses;
runCoordinator();
