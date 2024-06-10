const task1Routes = require('./task1_route');
const task2Routes = require('./task2_route');
module.exports = function(app, db) {
    task1Routes(app, db);
    task2Routes(app, db);
};