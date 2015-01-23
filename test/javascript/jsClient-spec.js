var test = require("../helpers").test;
var chai = require('chai');
chai.should();

describe('RAML to jsClient', function () {

  var generator = require("../../lib/generators/javascript/jsClient");

  var gatitosAPI = function(done){
    test(generator, done, {package: 'org.gex.client', importPojos: 'com.pojos'}, "javascript/gatitosApiClient.js", "v1/gatitosApiClient.js", false)
  };

  it('should generate a js client from RAML file', gatitosAPI );

});