![voyager](/support/images/banner-722x280.png)

A static site generator from the edge of the solar system.

Installation
------------

    $ npm install -g voyager
	
Commands
--------

**init**

Create a new voyager project in an empty directory.

    $ voyager init

This will prompt a few questions to help create your package.json file and will
install any necessary dependencies.

**start**

Start the local static server and watch files for changes.

    $ voyager start
	
This command is aliased as `voyager s`.

**build**

Build a production ready version of your site.

    $ voyager build
	
**task**

Run a specific task, including custom tasks.

    $ voyager task [yourtask]

API
---

**voyager#task**

Register a task with voyager.

    voyager.task('taskname', function (done) {
      // synchronous, async, or streams
      done();
    });
	
Example:

    var voyager = require('voyager')
      , less = require('gulp-less')
      , plumber = require('gulp-plumber')
      , vfs = require('vinyl-fs');

    voyager.task('styles:less', function (done) {
      vfs.src([
          './src/stylesheets/**/*.less'
        , '!./src/stylesheets/vendor/**'
        ])
        .pipe(plumber())
        .pipe(less())
        .pipe(vfs.dest('./.dev/stylesheets'))
        .on('end', done);
    });
	
It is important to note that you can overwrite voyager's default tasks defined in the 'tasks' directory. To add custom tasks, create a 'tasks' directory inside your project and include them there. Voyager's tasks are loaded first, and then your custom tasks.

**voyager#run**

Run a registered task.

    voyager.run('taskname');
	
Tasks are automatically wrapped in a Promise, so you can chain calls.

    voyager.run('taskname')
      .then(voyager.run.bind(voyager, 'anothertask'))
      .then(function () {
        console.log('done!');
      });
