const { Sequelize } = require('sequelize');

module.exports = new Sequelize('campus-taxi','root','', {
  host: 'localhost',
  dialect: 'mysql'
     
});