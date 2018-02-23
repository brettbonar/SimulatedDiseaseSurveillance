const AWS = require("aws-sdk");
const ssm = new AWS.SSM();

function runCoordinator(process) {


  let params = {
    DocumentName: "AWS-RunShellScript", /* required */
    Comment: "Run Process: " + process.id,
    TimeoutSeconds: 60,
    Parameters: {
      "commands": [
        "node ./startProcess.js --type coordinator"
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
  for (const process of config.processes) {
    if (process.type === "coordinator") {
      //runCoordinator(config, process);
    } else if (process.type === "doa") {
      //runDoa(config, process);
    } else if (process.type === "hds") {
      //runHds(config, process);
    } else if (process.type === "emr") {
      //runEmr(config, process);
    }
  }
}

module.exports = runProcesses;
