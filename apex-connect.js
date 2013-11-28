/**
 * Connect object constructor
 * @constructor
 */
var Connect = function(){
  //constructor
}

/**
 * Apex server hostname
 * @type {null}
 */
Connect.prototype.server = null

/**
 * Secret used to connect to the Apex server
 * @type {null}
 */
Connect.prototype.secret = null

/**
 * Auth token received from Apex
 * @type {null}
 */
Connect.prototype.auth_token = null
/**
 * User token received
 * @type {null}
 */
Connect.prototype.user_token = null

/**
 * Initial connect call that establishes the auth
 * session with the apex server
 *
 * Fires fn on completion with fn(err,auth_token)
 *
 * @param server
 * @param secret
 * @param fn
 */
Connect.prototype.connect = function(server,secret,fn){
  Connect.server = server
  Connect.secret = secret
  //do some sort of connect request
  Connect.auth_token = "received from server"
  fn(null,Connect.auth_token)
}

/**
 * Authorization function to receive a user_token
 *
 * Fires fn on completion with fn(err,user_token)
 *
 * @param collection
 * @param auth_id
 * @param auth_password
 * @param fn
 */
Connect.prototype.authorize = function(collection,auth_id,auth_password,fn){
  Connect.collection = collection
  Connect.auth_id = auth_id
  Connect.auth_password = auth_password
  //do some sort of auth request
  Connect.user_token = "received from server"
  fn(null,Connect.user_token)
}

//export module
module.exports = exports = Connect