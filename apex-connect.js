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
  * Auth token received from Apex
  * @type {null}
  */
  self.auth_token = null

  /**
   * User token received
   * @type {null}
   */
  self.user_token = null

  self.call = function(call,data,fn){
    request.post(
      self.server + call,
      data,
      function(err,res,body){
        if(201 !== res.statusCode ){
          self.auth_token = null
          fn("Could not contact server: " + res.statusCode,null)
        } else {
          body = JSON.parse(body)
          fn(null,body)
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
    , data = {form:{ secret:this.secret }}
  self.call("/auth/connect",data,function(err,res){
    if(err) fn(err)
    else if(res.auth && res.auth == "ok" && res.token){
      self.auth_token = res.token
      fn(null,res.token)
    } else {
      self.auth_token = null
      fn("Could not connect",null)
    }
  })
}

/**
 * Authorization function to receive a user_token
 *
 * Fires fn on completion with fn(err,user_token)
 *
 * @param collection
 * @param id
 * @param secret
 * @param fn
 */
Connect.prototype.authorize = function(collection,id,secret,fn){
  var self = this
    , data = {
      form:{
        token : self.auth_token,
        collection : collection,
        id: id,
        secret : secret
      }
    }
  if(!self.auth_token){
    fn("Not connected to the server",null)
    return
  }
  self.call("/auth/authorize",data,function(err,res){
    if(err) fn(err)
    else if(res.auth && res.auth == "ok" && res.token){
      self.auth_token = res.token
      fn(null,res.token)
    } else {
      fn("Could not authorize",null)
    }
  })
}

//export module
module.exports = exports = Connect