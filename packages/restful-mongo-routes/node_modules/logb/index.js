var bunyan = require('bunyan'),
    path = require('path');


/***
 *
 * @param name {string}
 * @returns {bunyan logger}
 */
module.exports.getLogger = function(name, opts) {
    var matches, options;

    var logLevel;

    opts = opts || {};

    logLevel = process.env.LOG_LEVEL || 'info';


    matches = name.match(/\/[^\/]+$/g);
    if (matches) {
        name = matches[0];
    }

    options = {};
    options.name = name;
    options.stream = process.stdout;
    options.level = logLevel;


    return bunyan.createLogger(options);
}