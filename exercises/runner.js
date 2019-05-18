const compareStdOut = require('workshopper-exercise/comparestdout');
// let deepEqual = require('deep-eql');
const execute = require('workshopper-exercise/execute');
const exerciser = require('workshopper-exercise');
const filecheck = require('workshopper-exercise/filecheck');
const fs = require('fs');
const os = require('os');
const path = require('path');
const util = require('util');

let verbose = true; let showInput = true; let initFx; let wrapUpFx; let customFx; let
  wrapperModule;

function runner() {
  const exercise = execute(filecheck(exerciser()));
  const input = Array.prototype.slice.call(arguments);
  let submittedFx; let
    __;

  exercise.addProcessor(function (mode, callback) {
    __ = exercise.__.bind(exercise);
    const testFile = this.args[0];
    try {
      submittedFx = require(path.resolve(process.cwd(), testFile));
    } catch (e) {
      this.emit('fail', e.stack);
      return callback(e, false);
    }

    if (typeof submittedFx !== 'function') {
      const message = __('fail.must_export_function');
      this.emit('fail', message);
      return callback(new Error(message), false);
    }

    callback(null, true);
  });

  if (wrapperModule && wrapperModule.path) {
    exercise.addSetup(function setupWrapperModule(mode, callback) {
      let modulePath = wrapperModule.path;
      if (wrapperModule.options && wrapperModule.options.localized) {
        const localizedPath = modulePath.replace(/\.\w+$/, `_${exercise.lang}$&`);
        if (fs.existsSync(path.resolve(process.cwd(), localizedPath))) {
          modulePath = localizedPath;
        }
      }
      this.solutionCommand = [modulePath, this.solution].concat(this.solutionArgs);
      this.submissionCommand = [modulePath, this.submission].concat(this.submissionArgs);

      if (input.length > 0) {
        const file = `${path.join(os.tmpdir(), path.basename(this.solution))}.input.json`;
        fs.writeFileSync(file, JSON.stringify(input), { encoding: 'utf-8' });
        exercise.addCleanup((mode, pass, callback) => {
          fs.unlink(file, callback);
        });
        this.solutionCommand.splice(2, 0, file);
        this.submissionCommand.splice(2, 0, file);
      }
      process.nextTick(callback);
    });

    return compareStdOut(exercise);
  }

  exercise.addProcessor(function (mode, callback) {
    if (initFx) { initFx(); }
    const submittedResult = obtainResult(submittedFx, input);
    if (verbose) {
      if (showInput) {
        const displayInput = input.length === 1 ? input[0]
          : input.map(o => typeof o === 'function' ? o.toString() : o);
        console.log(__('input'), util.inspect(displayInput, { colors: true }).replace(/,\n\s*/g, ', '));
      }
      console.log(__('submission'), util.inspect(submittedResult, { colors: true }).replace(/,\n\s*/g, ', '));
    }

    if (mode === 'run') {
      return callback(null, true);
    }

    if (initFx) { initFx(); }
    const solutionFx = require(this.solution);
    const solutionResult = obtainResult(solutionFx, input);
    if (verbose) {
      console.log(__('solution'), util.inspect(solutionResult, { colors: true }).replace(/,\n\s*/g, ', '));
    }
    const resultsMatch = exercise.ignoreReturnValue ? true : deepEqual(submittedResult, solutionResult);
    callback(null, resultsMatch);
  });

  if (wrapUpFx) {
    exercise.addVerifyProcessor(wrapUpFx);
  }

  return exercise;
}

function obtainResult(fx, input) {
  if (customFx) {
    input = [fx].concat(input);
    return customFx.apply(null, input);
  }
  return fx.apply(null, input);
}

runner.custom = function custom(fx) {
  customFx = fx;
  return runner;
};

runner.hideInput = function quiet() {
  showInput = false;
  return runner.apply(null, arguments);
};

runner.init = function init(fx) {
  initFx = fx;
  return runner;
};

runner.quiet = function quiet() {
  verbose = false;
  return runner.apply(null, arguments);
};

runner.wrapWith = function wrapWith(modulePath, options) {
  verbose = false;
  wrapperModule = { path: modulePath, options };
  return runner.apply(null, Array.prototype.slice.call(arguments, 1));
};

runner.wrapUp = function wrapUp(fx) {
  wrapUpFx = fx;
  return runner;
};

module.exports = runner;
