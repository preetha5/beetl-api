'use strict';

exports.DATABASE_URL = 
    process.env.DATABASE_URL ||
    global.DATABASE_URL ||
    'mongodb://localhost/admin';
    //'mongodb://admin:admin@ds133360.mlab.com:33360/beetl-api-dev';
// exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL ||
//                       'mongodb://localhost/test-restaurants-app';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL ||
'mongodb://admin:admin@ds133360.mlab.com:33360/beetl-api-dev';
exports.PORT = process.env.PORT || 8080;
exports.JWT_SECRET = process.env.JWT_SECRET || 'preetha';
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';