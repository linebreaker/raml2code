fs = require('fs')
commonHelpers = require("../helpers/common").helpers()
utilSchemas = require('../util/schemas')
parseResource = require('../util/parseResource')
console.log parseResource
path = require('path')
_ = require('lodash')

generator = {}
generator.helpers = commonHelpers
dirname = path.dirname(__filename)
template = path.resolve(dirname, "tmpl/retrofitClient.hbs")
generator.template = fs.readFileSync(template).toString()

customAdapter = (method, methodParsed)->
  if methodParsed.formData
    methodParsed.additionalAnnotation = "Multipart"
  if methodParsed.formEncoded
    methodParsed.additionalAnnotation = "FormUrlEncoded"

  mediaType = "application/json"
  if method.body and Object.keys(method.body)[0]
    mediaType = Object.keys(method.body)[0]
  if methodParsed.annotation is "DELETE"
    methodParsed.additionalAnnotation = "Headers({\"Content-type: #{mediaType}\"})"

generator.parser = (data) ->
  parsed = []
  schemas = utilSchemas.loadSchemas(data)

  options =
    annotations :
      path: "@Path"
      query: "@Query"
      body: "@Body"
      multiPart: "@Part"
      form: "@Field"
    mapping :
     'string' : "String"
     'boolean' : "Boolean"
     'number' : "BigDecimal"
     'integer' : "Long"
     'array' : "List"
     'object' : "Map"
     'file' : "TypedFile"
  methodParse = []

  for resource in data.resources
    methodParse.push parseResource(resource, options, schemas, customAdapter)

  methodParse = _.flatten(methodParse)

  for method in methodParse
    notReqArgs = _.filter(method.args, (it)->
      it.required == false
    )

    if notReqArgs and notReqArgs.length > 0
      console.log "notReqArgs", notReqArgs, notReqArgs.length
      reqArgs = _.difference(method.args, notReqArgs)
      console.log "reqArgs", reqArgs, reqArgs.length
      permutations = (2 * notReqArgs.length)-1
      console.log "no permutations", permutations + 1
      for(i)
      resolveArrayByMask(permutations, notReqArgs)

  model = {}
  model.methods = methodParse
  model.version = data.version
  if data.extra
    data.extra.package = "#{data.extra.package}.#{data.version}"
    data.extra.importPojos = "#{data.extra.importPojos}.#{data.version}"
    model.extra = data.extra
  model.className = data.title.split(" ").join("")
  parsed.push {name: "#{data.version}/#{model.className}.java" , model}
  parsed


arrayFromMask = (nMask) ->
  # nMask must be between -2147483648 and 2147483647
  throw new TypeError("arrayFromMask - out of range")  if nMask > 0x7fffffff or nMask < -0x80000000
  nShifted = nMask
  aFromMask = []

  while nShifted
    aFromMask.push(Boolean(nShifted & 1))
    nShifted >>>= 1
  aFromMask

resolveArrayByMask = (mask, array) ->
  res = []
  i = array.length - 1
  j = 0

  while i >= 0
    res.push array[i]  if mask[j]
    i--
    j++
  res

module.exports = generator
