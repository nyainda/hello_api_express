const User = require('./User');
const Organisation = require('./Organisation');

User.belongsToMany(Organisation, { through: 'UserOrganisation' });
Organisation.belongsToMany(User, { through: 'UserOrganisation' });

module.exports = { User, Organisation };