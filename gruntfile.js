module.exports = function(grunt) {
  //basic config
  grunt.initConfig({
    mochaTest: {
      admin: {
        src: ["*.test.js"]
      }
    },
    watch: {
      "test": {
        files: ["*.js"],
        tasks: ["test"]
      }
    }
  })
  //load modules
  grunt.loadNpmTasks("grunt-mocha-test")
  grunt.loadNpmTasks("grunt-contrib-watch")

  //server tasks
  grunt.registerTask("test",["mochaTest"])

  //shortcut task to update everything
  grunt.registerTask("update","Update/prune npm",function(){
    var dir_root = __dirname
      , done = this.async()
    require("async").eachSeries(
      [
        {cmd: "npm", args: ["install"], opts:{cwd:dir_root}},
        {cmd: "npm", args: ["update"], opts:{cwd:dir_root}},
        {cmd: "npm", args: ["prune"], opts:{cwd:dir_root}}
      ],
      function(opts,fn){
        grunt.log.writeln("Executing " + opts.cmd + " " + opts.args.join(" "))
        grunt.util.spawn(opts,function(err,res){
          if(err) fn(err)
          else {
            if(res.stderr) grunt.log.ok(res.stderr)
            if(res.stdout) grunt.log.ok(res.stdout)
            fn()
          }
        })
      },
      function(err){
        if(err) throw err
        done()
      }
    )
  })
}
