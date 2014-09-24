VOYAGER (alpha)
===============

[![wercker status](https://app.wercker.com/status/a6a9346cd1fa1d24d19799d710ddab22/m "wercker status")](https://app.wercker.com/project/bykey/a6a9346cd1fa1d24d19799d710ddab22)

Voyager is a static site generator with a built-in task runner, inspired by
[gulp][2] and Google's [Web Starter Kit][7].

### Installation

    $ npm i voyager

### Goals

**Provide a build boilerplate for static sites**

Starting a new project should be quick and easy. With this in mind, 
[voyager-generator][1] was created. The generator is meant to be installed
globally via [npm][5]. Starting a new project is as easy as `voyager my-project`.

**Provide an environment with no tech constraints**

As developers, trying out the new (or old) hotness is important to our growth.
Voyager is tech agnostic – pick a tech you want to use, find a plugin or write
a task, and you are up and running. No clientside dependencies are introduced
via voyager.

**Create a plugin ecosystem to streamline builds**

If you use [gulp][2], chances are you have written (or copy/pasted) the same tasks
over and over. Voyager's plugin ecosystem is meant to alleviate this time
consuming operation at the start of every project. Just install the 
[voyager plugin][6] that you need via npm and voyager will do the rest. No
voyagerfile in the root of your project, no config to tell voyager to use it,
it only needs to exist in your package.json as a dependency/devDependency.

Starting a project with Voyager
-------------------------------

If you haven't already installed the [voyager-generator][1], install it with

    $ npm i -g voyager-generator

"What, no sudo?" - see [this post][8] by Isaac Z. Schlueter

To generate the voyager skeleton, run

    $ voyager my-new-project

You will be prompted with a few questions to build out your initial 
package.json.

Next

    $ cd my-new-project/
    $ npm i
    $ npm start

By now the project skeleton has been created, dependencies have been installed,
the default tasks have been run, and a static server will be started on port
[3000][9]. If this "it just works" gimmick didn't _just work_, please 
[log an issue][10].

When you are ready to build a final version of your project, run

    $ npm run build

and check the newly created "build" directory.

**Project Structure**

A freshly generated voyager project has the following structure.

    .
    ├── .gitignore
    ├── .jshintrc
    ├── bin
    │   └── cmd
    ├── package.json
    ├── src
    │   ├── apple-touch-icon-precomposed.png
    │   ├── favicon.ico
    │   ├── fonts
    │   ├── humans.txt
    │   ├── images
    │   │   ├── banner-722x280.png
    │   │   ├── icon.png
    │   │   └── touch
    │   │       ├── chrome-touch-icon-196x196.png
    │   │       └── ms-touch-icon-144x144-precomposed.png
    │   ├── index.html
    │   ├── javascripts
    │   │   ├── lib
    │   │   ├── main.js
    │   │   └── vendor
    │   ├── robots.txt
    │   └── stylesheets
    │       ├── lib
    │       ├── main.css
    │       └── vendor
    └── tasks

All project files that will become part of the final product are included within
the `src` directory. Any tasks that you may want to define exist inside of the
`tasks` directory - this is empty by default. The `bin` directory contains
a command file which is referenced in package.json, which allows for the
voyager commands `build`, `clean`, and `start` to be run via `num run ${command}`.

After running `npm start`, a new directory is created in the root of your project
and is ignored in git.

    .
    └── .dev
        ├── apple-touch-icon-precomposed.png
        ├── favicon.ico
        ├── humans.txt
        ├── images
        │   ├── banner-722x280.png
        │   ├── icon.png
        │   └── touch
        │       ├── chrome-touch-icon-196x196.png
        │       └── ms-touch-icon-144x144-precomposed.png
        ├── index.html
        ├── javascripts
        │   └── main.js
        ├── robots.txt
        └── stylesheets
            └── main.css

The `.dev` directory is to be considered a staging area, this is from where the 
voyager static server serves.

After running `npm build`, a new directory is created in the root of your project
and is ignored in git.

    .
    └── build
        ├── apple-touch-icon-precomposed.png
        ├── favicon.ico
        ├── humans.txt
        ├── images
        │   ├── banner-722x280.png
        │   ├── icon.png
        │   └── touch
        │       ├── chrome-touch-icon-196x196.png
        │       └── ms-touch-icon-144x144-precomposed.png
        ├── index.html
        ├── javascripts
        │   └── main.js
        ├── robots.txt
        └── stylesheets
            └── main.css

The `build` directory is the final product. All files have been processed and
are ready for production.

Tasks
-----

Tasks are at the core of voyager. As a developer, your interaction with tasks
can be anywhere from none at all, local task development, or even plugin 
authoring. To aid you in this process, tasks are written in the common form
introduced by the streaming build system, [gulp][2]. In fact, all 
[gulp plugins][3] can be used in tasks. This is by design. Gulp already has a 
healthy plugin ecosystem and it would be a shame not to leverage it. It should 
be noted that plugins in voyager differ from those within gulp, as voyager 
plugins are analogous to a set of gulp tasks.

### Build Phases

For the [time being][11], all tasks must be registered as one of three build
phases: "read", "write", or "build". 

**Read**

All tasks in the "read" phase are run first, and do not modify any files or 
directories. They only _read_ files in the stream and report back. Examples
include linting tasks and tests.

**Write**

Tasks in the "write" phase are executed after all "read" tasks have finished.
These tasks _write_ files to the development staging directory (/.dev/) so they
can be served up by the internal static server.

**Build**

Tasks in the "build" phase are executed after all "read" and "write" tasks have
finished, and are only called when running `npm run build`. These tasks
take files in the `.dev` staging directory and move/process them
over to the `build` directory.

### Default Tasks

Voyager ships with a set of default tasks to get you started. These tasks
merely move files from `src` to `.dev` to `build` – no processing is done.

### Local Tasks

Local tasks exists within the `tasks` directory. These are tasks written by you.
Voyager loads these tasks last, so you have final say in how your project works.

### Plugin development

As voyager is still in an alpha release - plugin development is not recommended
until feature lockdown at [beta][4].

API
---

To get a more thorough understanding of voyager, it is best to read the source.
This section serves as at best an overview.

**voyager#task**

Register a task with voyager.

    voyager.task('read', 'my-task-name', function (done) {
      // synchronous, asynchronous, or streamed
      done();
    });

Example:

    var voyager = require('voyager')
      , less = require('gulp-less')
      , plumber = require('gulp-plumber')
      , vfs = require('vinyl-fs');

    voyager.task('write', 'less', function (done) {
      this.src(['stylesheets/**/*.less', '!stylesheets/vendor/**'])
        .pipe(plumber())
        .pipe(less())
        .pipe(this.out('stylesheets'))
        .on('end', done);
    });

    voyager.watch(['stylesheets/**/*.less', '!stylesheets/vendor/**'], 'less');

It is important to note that you can overwrite voyager's default tasks defined 
in the `tasks` directory. To add custom tasks, write and include them in the
`tasks` directory. Voyager's tasks are loaded first, then any 
'voyager-*' npm package, and then your custom tasks. You have the final say in 
the end.

**voyager#run**

Run a registered task.

    voyager.run('taskname');
  
Tasks are automatically wrapped in a Promise, so you can chain calls.

    voyager.run('taskname')
      .then(voyager.run.bind(voyager, 'anothertask'))
      .then(function () {
        console.log('done!');
      });

You can also run a series of tasks.

    voyager.run(['one', 'two', 'three']);

Or, you can choose to run specific phases of the build.

    voyager.run(['read', 'write']);

**voyager#watch**

Registers a glob pattern with a set of phases/tasks.

    voyager.watch(['javascripts/**/*.js', '!javascripts/vendor/**'], ['scripts']);

Only tasks from the "read" and "write" phases are run.

**voyager#cancelWatch**

Until a [clever solution][12] is found, this is the only method available to
cancel a conflicting watch task. It removes any tasks bound to the passed in
globs.

    voyager.cancelWatch(['javascripts/**/*.js']);

License
-------

ISC, see the LICENSE file for details.

[1]: https://github.com/davidglivar/voyager-generator
[2]: http://gulpjs.com
[3]: http://gulpjs.com/plugins/
[4]: https://github.com/davidglivar/voyager/milestones/BETA
[5]: https://www.npmjs.org/package/voyager-generator
[6]: https://www.npmjs.org/search?q=voyager-
[7]: https://developers.google.com/web/starter-kit/
[8]: http://howtonode.org/introduction-to-npm
[9]: http://localhost:3000/
[10]: https://github.com/davidglivar/voyager/issues
[11]: https://github.com/davidglivar/voyager/issues/11
[12]: https://github.com/davidglivar/voyager/issues/10
