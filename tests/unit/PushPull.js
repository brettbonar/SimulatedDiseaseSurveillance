const chai = require("chai");
const mocha = require("mocha");
const sinon = require("sinon");
const expect = chai.expect;

const Push = require("../../Messaging/Push");
const Pull = require("../../Messaging/Pull");

describe("Push-Pull", function () {
  const CONNECTION = { ip: "localhost", port: 12000 };
  const MESSAGE = { "Test": "This is a test" };

  it("Pushes and Pulls", function (done) {
    let push = new Push(CONNECTION);
    let pull = new Pull(CONNECTION);

    pull.on(function (data) {
      expect(data).to.eql(MESSAGE);
      push.close();
      pull.close();
      done();
    });
    
    push.send(MESSAGE);
  })
});
