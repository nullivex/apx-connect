var should = require("should")

describe("Rage Controller",function(){
  var _content = "___testing the rages___"
    , _id
  it("should save the new rage post",function(done){
    //blindly remove the record first in case the previous tests failed
    Model.findOneAndRemove({content: _content},function(err){
      if(err) throw err
      controller.save({content: _content},function(err,result){
        if(err) throw err
        result.should.have.type("object")
        result.should.have.property("_id")
        _id = result._id
        done()
      })
    })
  })
  it("should find the rage posts",function(done){
    controller.find({content: _content},function(err,result){
      if(err) throw err
      //make sure we got an array of objects
      result.should.have.type("object")
      result.should.have.length(1)
      //shift the array member and verify its our user
      result = result[0]
      result.should.have.type("object")
      result.should.have.property("_id")
      should(result._id.toString()).equal(_id.toString())
      done()
    })
  })
  it("should find a single staff member",function(done){
    controller.findOne({content: _content},function(err,result){
      if(err) throw err
      result.should.have.type("object")
      result.should.have.property("_id")
      should(result._id.toString()).equal(_id.toString())
      done()
    })
  })
  it("should remove the rage post",function(done){
    controller.remove({_id: _id},function(err){
      if(err) throw err
      //confirm staff member no longer exists
      controller.findOne({content: _content},function(err,result){
        if(err) throw err
        if(null === result)
          done()
        else
          done("rage post still exists")
      })
    })
  })
})