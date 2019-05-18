let exercise = require('workshopper-exercise')();
const filecheck = require('workshopper-exercise/filecheck');
const execute = require('workshopper-exercise/execute');
const comparestdout = require('workshopper-exercise/comparestdout');
// const runner = require('../runner');

// Override the default executor
// const execute = require('../../execute');

// checks that the submission file actually exists
exercise = filecheck(exercise);

// // execute the solution and submission in parallel with spawn()
exercise = execute(exercise);
// console.log(exercise.getStdout());
// // compare stdout of solution and submission
exercise = comparestdout(exercise);

module.exports = exercise;
