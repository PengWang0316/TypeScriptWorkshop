// Based on workshopper-exercise/execute
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const after = require('after');
const xtend = require('xtend');

function execute(exercise, opts = {}) {
  function setup(mode, callback) {
    [this.submission] = this.args;

    // default args, override if you want to pass special args to the
    // solution and/or submission, override this.setup to do this
    this.submissionArgs = Array.prototype.slice.call(1, this.args);
    this.solutionArgs = Array.prototype.slice.call(1, this.args);

    // edit/override if you want to alter the child process environment
    this.env = xtend(process.env);

    // set this.solution if your solution is elsewhere
    if (!this.solution) {
      this.solution = path.join(this.dir, './solution/solution.ts');
    }

    process.nextTick(callback);
  }


  function kill() {
    [this.submissionChild, this.solutionChild].forEach((child) => {
      if (child && typeof child.kill === 'function') {
        child.kill();
      }
    });

    setTimeout(() => {
      this.emit('executeEnd');
    }, 10);
  }


  function processor(mode, callback) {
    const ended = after(mode === 'verify' ? 2 : 1, kill.bind(this));

    // backwards compat for workshops that use older custom setup functions
    if (!this.solutionCommand) {
      this.solutionCommand = [this.solution].concat(this.solutionArgs);
    }

    if (!this.submissionCommand) {
      this.submissionCommand = [this.submission].concat(this.submissionArgs);
    }

    this.typescriptExec = path.resolve(__dirname, './node_modules/typescript/bin/tsc');

    this.submissionChild = spawn(this.typescriptExec, this.submissionCommand, { env: this.env });
    this.submissionStdout = this.getStdout('submission', this.submissionChild);

    setImmediate(() => { // give other processors a chance to overwrite stdout
      this.submissionStdout.on('end', ended);
    });

    if (mode === 'verify') {
      this.solutionChild = spawn(this.typescriptExec, this.solutionCommand, { env: this.env });
      this.solutionStdout = this.getStdout('solution', this.solutionChild);

      setImmediate(() => { // give other processors a chance to overwrite stdout
        this.solutionStdout.on('end', ended);
      });
    }

    process.nextTick(() => {
      callback(null, true);
    });
  }

  exercise.addSetup(setup);
  exercise.addProcessor(processor);

  // override if you want to mess with stdout
  exercise.getStdout = (type, child) => child.stdout;

  exercise.getSolutionFiles = function (callback) {
    console.log(this.dir);
    const translated = path.join(this.dir, `./solution_${this.lang}`);
    const fallback = path.join(this.dir, './solution');

    function checkPath(dir, cb) {
      fs.exists(dir, (exists) => {
        if (!exists) return cb(null, []);

        fs.readdir(dir, (err, list) => {
          if (err) return cb(err);

          list = list
            .filter(f => (/\.js$/).test(f))
            .map(f => path.join(dir, f));
          cb(null, list);
        });
      });
    }

    checkPath(translated, (err, list) => {
      if (list && list.length > 0) return callback(null, list);

      checkPath(fallback, callback);
    });
  };

  return exercise;
}

module.exports = execute;
