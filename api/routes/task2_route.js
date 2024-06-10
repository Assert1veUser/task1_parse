module.exports = function(app, db) {
    const bodyParser = require('body-parser');
    app.use(bodyParser.json());

};