var should = require("should")
var Connect = require("./apex-connect.js")
var nock = require('nock')


var server = "http://localhost"
var secret = "tehSecret"

var nockServer = nock(server)
  .post('/wrongpath/auth/connect', {"secret": "" }).reply(404)
  .post('/auth/connect', {"secret": secret }).reply(201,{"auth": "ok", "token":"1234"})
  .post('/auth/connect', {"secret": "" }).reply(201,{"auth": "fail", "token":""})
  .post('/auth/connect', {"secret": secret }).reply(201,{"auth": "ok", "token":"1234"})
  .post('/auth/authorize', {"token": "1234" , "id": "user" , "secret" : "", "collection" : "staff" }).reply(201,{"auth": "fail", "user_token":""})
  .post('/auth/authorize', {"token": "1234" , "id": "user" , "secret" : "1234", "collection" : "staff" }).reply(201,{"auth": "ok", "user_token":"ABCD"})


describe("Connect and authenticate",function(){
  it("Should not connect to the apex server",function(t){

    var c = new Connect(server + "/wrongpath", "")
    c.connect(function(err, token){
      should.not.exist(token)
      should.exist(err)
      err.should.equal("Could not contact server : 404")
      t();
    })
  })
  it("Fail auth to the apex server",function(t){
    var c = new Connect(server , "")
    c.connect(function(err, token){
      should.not.exist(token)
      should.exist(err)
      err.should.equal("Could not authenticate")
      t();
    })
  })
  it("Auth to the apex server",function(t){
    var c = new Connect(server , secret)
    c.connect(function(err, token){
      should.exist(token)
      should.not.exist(err)
      t();
    })
  })
})

describe("Authorize users",function(){
  var c = new Connect(server , secret)

  it("Should connect",function(t){
    c.connect(function(err, token){
        should.exist(token)
        should.not.exist(err)
        t()
    })
  })

  it("Should not authorize user",function(t){
    c.authorize("staff", "user", "",
      function(err, user_token){
        should.not.exist(user_token)
        should.exist(err)
        t()
    })
  })

  it("Should authorize user",function(t){
    c.authorize("staff", "user", "1234",
      function(err, user_token){
        should.exist(user_token)
        should.not.exist(err)
        t()
    })
  })

})