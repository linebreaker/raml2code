var raml2code =require('../..');
var path = require('path');
var fs = require('fs');
var gutil = require('gulp-util');
var wrapAssertion = require("../helpers").wrapAssertion;

var chai = require('chai');
chai.should();

describe('RAML to Retrofit client ', function () {

  it('should generate a resource interface from RAML file', function(done) {
    var gen = require("../../lib/generators/groovy/jaxrsInterface");
    var raml2codeInstance = raml2code({generator:gen, extra: {package: 'org.gex'}});
    var ramlPath = path.join(__dirname, '../raml/cats.raml');
    var examplePath = path.join(__dirname, '../examples/GatitosResource.groovy');

    var ramlContents = fs.readFileSync(ramlPath);
    var exampleContents = fs.readFileSync(examplePath);

    raml2codeInstance.write(new gutil.File({
      path: ramlPath,
      contents: ramlContents
    }));

    raml2codeInstance.on('data', function(file){
      var content = file.contents.toString('utf8');
      //console.log("=======");
      //console.log(content);
      //console.log("=======");
      if(file.path == 'GatitosResource.groovy'){
        wrapAssertion(function () {
          file.isBuffer().should.equal(true);
          var content = file.contents.toString('utf8');
          exampleContents = exampleContents.toString('utf8').split('\n');
          content.split('\n').forEach(function(e,i){
            e.should.equal(exampleContents[i]);
          });
        }, done);

      }
    });

    raml2codeInstance.on('error', function(error) {
      console.log("error", error);
    });

  });

});