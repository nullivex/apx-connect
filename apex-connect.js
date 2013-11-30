var request = require("request")

/**
 * Connect object constructor
 * @constructor
 */
var Connect = function Connect(server,secret){
  //constructor
  var self = this

  /**
   * Apex server hostname
   * @type {null}
   */
  self.server = server

  /**
   * Secret used to connect to the Apex server
   * @type {null}
   */
  self.secret = secret

  /**
  * Server session token received from Apex
  * @type {null}
  */
  self.token = null
}

/**
 * Main API call function
 *
 * @param call  The URI to call
 * @param data  Data to pass to the call
 * @param fn  Callback function fn(err,res)
 */
Connect.prototype.call = function(call,data,fn){
  var self = this
  if("/auth/connect" !== call && !self.token)
    fn("Not connected to the server")
  else {
    //finalize data
    if(self.token) data.token = self.token
    //make request
    request.post(
      self.server + (call.match(/^\/.*/) ? call : "/" + call),
      {form: data},
      function(err,res,body){
        if(200 !== res.statusCode ){
          fn("Server call failed with response: " + res.statusCode)
        } else {
          body = JSON.parse(body)
          if(body.error) fn("Server returned an error: " + body.error)
          else fn(null,body)
        }
      }
    )
  }
}

/**
 * Initial connect call that establishes the auth
 * session with the apex server
 *
 * Fires fn on completion with fn(err,auth_token)
 *
 * @param fn
 */
Connect.prototype.connect = function(fn){
  var self = this
    , data = {secret: self.secret}
  self.call("/auth/connect",data,function(err,res){
    if(err) fn(err)
    else if(res.token){
      self.token = res.token
      fn(null,res.token)
    } else {
      self.token = null
      fn("Could not connect",null)
    }
  })
}

/**
 * Authorization function to receive a user_token
 *
 * Req Object {
 *  collection: "staff",
 *  id: "email@email.org",
 *  password: "pass1234"
 * }
 *
 * Fires fn on completion with fn(err,user_token)
 *
 * @param req  Request object eg above
 * @param fn
 */
Connect.prototype.authorize = function(req,fn){
  var self = this
    , data = {
      token : self.token,
      collection : req.collection,
      id: req.id,
      password : req.password
    }
  self.call("/auth/authorize",data,function(err,res){
    if(err) fn(err)
    else if(res.token){
      //setup user instance of connect
      var inst = new Connect(self.server,self.secret)
      inst.connect = undefined
      inst.authorize = undefined
      inst.token = res.token
      fn(null,inst)
    } else {
      fn("Could not authorize",null)
    }
  })
}

//export module
module.exports = exports = Connect