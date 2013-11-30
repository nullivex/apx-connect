var expect = require("chai").expect
  , Connect = require("./apex-connect.js")
  , nock = require("nock")
  , server = "http://localhost"
  , secret = "tehSecret"
  , scope = nock(server)

describe("Apex",function(){

  it("should fail to connect to the wrong host",function(done){
    scope.post("/wrongpath/auth/connect",{secret:""}).reply(404)
    var c = new Connect(server + "/wrongpath","")
    c.connect(function(err,token){
      expect(err).to.equal("Server call failed with response: 404")
      expect(token).to.equal(undefined)
      done()
    })
  })

  it("should fail to connect with missing secret",function(done){
    scope.post("/auth/connect",{secret:""}).reply(200,{error:"invalid secret",token:""})
    var c = new Connect(server,"")
    c.connect(function(err,token){
      expect(err).to.equal("Server returned an error: invalid secret")
      expect(token).to.equal(undefined)
      done()
    })
  })

  it("should connect",function(done){
    scope.post("/auth/connect",{secret:secret}).reply(200,{error:"",token:"1234"})
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
    scope.post("/auth/connect",{secret:secret}).reply(200,{error:"",token:"1234"})
    c.connect(function(err,token){
      expect(err).to.equal(null)
      expect(token).to.equal("1234")
      done()
    })
  })

  it("should fail on invalid credentials",function(done){
    scope
      .post("/auth/authorize",{token:"1234",id:"user",password:"",collection:"staff"})
      .reply(200,{error:"invalid credentials",token:""})
    c.authorize({collection:"staff",id:"user",password:""},function(err,user_token){
      expect(err).to.equal("Server returned an error: invalid credentials")
      expect(user_token).to.equal(undefined)
      done()
    })
  })

  it("should successfully authorize 'user'",function(done){
    scope
      .post("/auth/authorize",{token:"1234",id:"user",password:"1234",collection:"staff"})
      .reply(200,{"error":"","token":"ABCD"})
    c.authorize({collection:"staff",id:"user",password:"1234"},function(err,inst){
      expect(err).to.equal(null)
      expect(inst).to.be.a("object")
      expect(inst.token).to.equal("ABCD")
      done()
    })
  })

})

describe("Apex call",function(){
  var c = new Connect(server,secret)
    , apex

  it("should connect",function(done){
    scope.post("/auth/connect",{secret:secret}).reply(200,{error:"",token:"1234"})
    c.connect(function(err,token){
      expect(err).to.equal(null)
      expect(token).to.equal("1234")
      done()
    })
  })

  it("should authorize",function(done){
    scope
      .post("/auth/authorize",{token:"1234",id:"user",password:"1234",collection:"staff"})
      .reply(200,{"error":"","token":"ABCD"})
    c.authorize({collection:"staff",id:"user",password:"1234"},function(err,inst){
      expect(err).to.equal(null)
      expect(inst).to.be.a("object")
      expect(inst.token).to.equal("ABCD")
      //save instance
      apex = inst
      done()
    })
  })

  it("should create a staff member",function(done){
    scope
      .post("/staff/create",{
        email: "test@user.org",
        password: "test1234",
        "name[first]": "user",
        "name[last]": "one",
        token: "ABCD"
      })
      .reply(200,{"error":"",id:"newstaffid"})
    apex.call(
      "/staff/create",
      {
        email: "test@user.org",
        password: "test1234",
        name: {
          first: "user",
          last: "one"
        }
      },
      function(err,res){
        expect(err).to.equal(null)
        expect(res.id).to.equal("newstaffid")
        done()
      }
    )
  })

  it("should fail gracefully on a bad route",function(done){
    scope
      .post("/user/create",{
        email: "test@user.org",
        password: "test1234",
        "name[first]": "user",
        "name[last]": "one",
        token: "ABCD"
      })
      .reply(200,{"error":"invalid route"})
    apex.call(
      "/user/create",
      {
        email: "test@user.org",
        password: "test1234",
        name: {
          first: "user",
          last: "one"
        }
      },
      function(err,res){
        expect(err).to.equal("Server returned an error: invalid route")
        expect(res).to.equal(undefined)
        done()
      }
    )
  })

})