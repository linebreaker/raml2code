var commonHelpers, dirname, fs, generator, path, template, util, _;

fs = require('fs');

_ = require('lodash');

util = require('./util.js');

commonHelpers = require("../helpers/common.js").helpers();

path = require('path');

generator = {};

generator.helpers = commonHelpers;

dirname = path.dirname(__filename);

template = path.resolve(dirname, "tmpl/jaxrsResources.hbs");

generator.template = fs.readFileSync(template).toString();

generator.parser = function(data) {
  var annotations, first, k, methodParse, model, parsed, resource, resourceGroup, v, _i, _len, _ref;
  parsed = [];
  methodParse = [];
  annotations = {
    path: "@PathParam",
    query: "@QueryParam",
    body: ""
  };
  _ref = data.resources;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    resource = _ref[_i];
    util.parseResource(resource, methodParse, annotations);
  }
  resourceGroup = _.groupBy(methodParse, function(method) {
    return method.displayName;
  });
  for (k in resourceGroup) {
    v = resourceGroup[k];
    model = {};
    if (data.extra) {
      model.extra = data.extra;
    }
    first = _.first(v);
    model.uri = first.uri;
    model.className = "" + first.displayName + "Resource";
    model.methods = v;
    parsed.push({
      name: model.className + ".groovy",
      model: model
    });
  }
  return parsed;
};

module.exports = generator;