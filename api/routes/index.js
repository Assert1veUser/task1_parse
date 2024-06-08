const task1Routes = require('./task1_route');
module.exports = function(app, db) {
    task1Routes(app, db);
};