const workshopper = require('workshopper-adventure');
const path = require('path');

const typescripting = workshopper({
  title: 'TYPESCRIPTING',
  exerciseDir: path.join(__dirname, 'exercise'),
  appDir: __dirname,
  languages: ['en'],
});

module.exports = typescripting;
