const workshopper = require('workshopper-adventure');
const path = require('path');

const typescripting = workshopper({
  title: 'City University of Seattle TYPESCRIPTING',
  exerciseDir: path.join(__dirname, 'exercises'),
  appDir: __dirname,
  languages: ['en'],
});

typescripting.addAll([
  'types',
]);

module.exports = typescripting;
