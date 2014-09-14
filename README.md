<!--![voyager](/support/images/banner-722x280.png)-->

Voyager
=======

A STATIC SITE GENERATOR FROM THE EDGE OF THE SOLAR SYSTEM.

Installation
------------

    $ npm install -g voyager

What?
-----

Voyager is a static site generator and task runner.

Why?
----

There are many static site generators out there, many are awesome:
[wintersmith](http://wintersmith.io/), [blacksmith](http://blacksmith.jit.su/),
and Google's [web starter kit](https://developers.google.com/web/starter-kit/)
to name a few. In fact, this project was created and inspired by the above 
projects, along with the [gulp](http://gulpjs.com/) build system. The
[web starter kit](https://developers.google.com/web/starter-kit/) was the
closest tool to what I needed, but it lacked in one key area: I wanted a 
generator. [Gulp](http://gulpjs.com/) completely changed my workflow for the
better, but it was tricky to integrate it outside of the `gulp` CLI.

How?
----

Underneath Gulp is the powerful package [vinyl-fs](https://github.com/wearefractal/vinyl-fs). Methods like `src`, `dest`, and `watch` are basically just moved into
the gulp namespace. If you isolate vinyl-fs, you can use it outside of gulp, and
– most importantly – can still seamlessly use your favorite
[gulp plugins](http://gulpjs.com/plugins/). This allowed for familiar tasks to
be written while not inventing a new plugin architecture entirely.

Tasks in voyager are run in sequence, as opposed to parallel. Common/opinionated
tasks are available for use by default; however, you may create new tasks, or
even overwrite existing tasks for your own use.
	
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

License
-------

ISC, see the LICENSE file for details.
