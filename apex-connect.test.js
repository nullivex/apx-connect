var expect = require("chai").expect
  , Connect = require("./apex-connect.js")
  , nock = require("nock")
  , server = "http://localhost"
  , secret = "tehSecret"

nock(server)
  .post("/wrongpath/auth/connect",{"secret": "" })
    .reply(404)
  .post("/auth/connect",{"secret": secret })
    .reply(201,{"auth":"ok","token":"1234"})
  .post("/auth/connect",{"secret": "" })
    .reply(201,{"auth":"fail","token":""})
  .post("/auth/connect",{"secret": secret})
    .reply(201,{"auth":"ok","token":"1234"})
  .post("/auth/authorize",{"token":"1234","id":"user","secret":"","collection":"staff"})
    .reply(201,{"auth":"fail","token":""})
  .post("/auth/authorize",{"token": "1234","id":"user","secret":"1234","collection":"staff"})
    .reply(201,{"auth":"ok","token":"ABCD"})

describe("Apex",function(){
  it("should fail to connect to the wrong host",function(done){
    var c = new Connect(server + "/wrongpath","")
    c.connect(function(err,token){
      expect(err).to.equal("Could not contact server: 404")
      expect(token).to.equal(undefined)
      done()
    })
  })
  it("should fail to connect with missing secret",function(done){
    var c = new Connect(server,"")
    c.connect(function(err,token){
      expect(err).to.equal("Could not connect")
      expect(token).to.equal(null)
      done()
    })
  })
  it("should connect",function(done){
    var c = new Connect(server,secret)
    c.connect(function(err,token){
      expect(err).to.equal(null)
      expect(token).to.equal("1234")
      done()
    })
  })
})

describe("Apex authorize",function(){
  var c = new Connect(server,secret)

  it("should connect",function(done){
    c.connect(function(err,token){
      expect(err).to.equal(null)
      expect(token).to.equal("1234")
      done()
    })
  })

  it("should fail on invalid credentials",function(done){
    c.authorize("staff","user","",function(err,user_token){
      expect(err).to.equal("Could not authorize")
      expect(user_token).to.equal(null)
      done()
    })
  })

  it("should successfully authorize 'user'",function(done){
    c.authorize("staff","user","1234",function(err,user_token){
      expect(err).to.equal(null)
      expect(user_token).to.equal("ABCD")
      done()
    })
  })

})