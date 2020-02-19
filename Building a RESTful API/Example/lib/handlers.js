var _data = require('./data');
var helpers = require('./helpers');
var config = require('./config');

var handlers = {};

handlers.users = function(data, callback) {
    var acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    } else {
        callback(405);
    }
};

handlers._users = {};

handlers._users.post = function(data, callback) {
    var firstName = typeof(data.payload.firstName) == 'string' 
    && data.payload.firstName.trim().length > 0 ?
    data.payload.firstName.trim() : false;

    var lastName = typeof(data.payload.lastName) == 'string' 
    && data.payload.lastName.trim().length > 0 ?
    data.payload.lastName.trim() : false;

    var phone = typeof(data.payload.phone) == 'string' 
    && data.payload.phone.trim().length == 10 ?
    data.payload.phone.trim() : false;

    var password = typeof(data.payload.password) == 'string' 
    && data.payload.password.trim().length > 0 ?
    data.payload.password.trim() : false;

    var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' 
    && data.payload.tosAgreement == true ? true : false;

    if (firstName && lastName && phone && tosAgreement) {
        _data.read('users', phone, function(err, data) {
            if (err) {
                var hashedPassword = helpers.hash(password);

                if (hashedPassword) {
                    var userObject = {
                        'firstName' : firstName,
                        'lastName' : lastName,
                        'phone' : phone,
                        'hashedPassword' : hashedPassword,
                        'tosAgreement' : true
                    };
    
                    _data.create('users', phone, userObject, function(err){
                        if (!err) {
                            callback(200);
                        } else {
                            console.log(err);
                            callback(500, { 'Error': 'Could not create the new user'});
                        }
                    });
                } else {
                    callback(500, { 'Error': 'Could not hash the user\'s password' });
                }
            } else {
                callback(400, { 'Error' : 'User exists' });
            }
        });
    } else {
        callback(400, { 'Error': "Missign required fields"});
    }
}

handlers._users.get = function(data, callback) {
    var phone = typeof(data.queryStringObject.phone) == 'string' 
    && data.queryStringObject.phone.trim().length == 10 
    ? data.queryStringObject.phone.trim() : false;

    if(phone) {
        _data.read('users', phone, function(err, data) {
            if(!err && data) {
                delete data.hashedPassword;
                callback(200, data);
            } else {
                callback(404);
            }
        });
    } else {
        callback(400, { 'Error' : 'Missing required field' });
    }
}

handlers._users.put = function(data, callback) {
    var phone = typeof(data.payload.phone) == 'string' 
    && data.payload.phone.trim().length == 10 
    ? data.payload.phone.trim() : false;

    var firstName = typeof(data.payload.firstName) == 'string' 
    && data.payload.firstName.trim().length > 0 ?
    data.payload.firstName.trim() : false;

    var lastName = typeof(data.payload.lastName) == 'string' 
    && data.payload.lastName.trim().length > 0 ?
    data.payload.lastName.trim() : false;

    var password = typeof(data.payload.password) == 'string' 
    && data.payload.password.trim().length > 0 ?
    data.payload.password.trim() : false;

    if (phone) {
        if (firstName || lastName || password) {
            _data.read('users', phone, function(err, userData) {
                if (!err && userData) {
                    if(firstName) {
                        userData.firstName = firstName;
                    }
                    if(lastName) {
                        userData.lastName = lastName;
                    }
                    if(password) {
                        userData.hashedPassword = helpers.hash(password);
                    }
                    _data.update('users', phone, userData, function(err){
                        if(!err) {
                            callback(200);
                        } else {
                            console.log(err);
                            callback(500, { 'Error': 'Could not update the user' });
                        }
                    });
                } else {

                }
            });
        }
    } else {
        callback(400, { 'Error': 'Missign required field'});
    }
}

handlers._users.delete = function(data, callback) {
    var phone = typeof(data.queryStringObject.phone) == 'string' 
    && data.queryStringObject.phone.trim().length == 10 
    ? data.queryStringObject.phone.trim() : false;

    if(phone) {
        _data.read('users', phone, function(err, data) {
            if(!err && data) {
                _data.delete('users', phone, function(err) {
                    if (!err) {
                        callback(200);
                    } else {
                        callback(500, { 'Error' : 'Could not delete the specified user' });
                    }
                });
            } else {
                callback(400, { 'Error' : 'Could not find the specified user' });
            }
        });
    } else {
        callback(400, { 'Error' : 'Missing required field' });
    }
}

handlers.tokens = function(data, callback) {
    var acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data, callback);
    } else {
        callback(405);
    }
};

handlers._tokens = {};

handlers._tokens.post = function(data, callback) {
    var phone = typeof(data.payload.phone) == 'string' 
    && data.payload.phone.trim().length == 10 
    ? data.payload.phone.trim() : false;

    var password = typeof(data.payload.password) == 'string' 
    && data.payload.password.trim().length > 0 ?
    data.payload.password.trim() : false;

    if (phone && password) {
        _data.read('users', phone, function(err, userData) {
            if (!err && userData) {
                var hashedPassword = helpers.hash(password);
                if(hashedPassword == userData.hashedPassword) {
                    var tokenId = helpers.createRandomString(20);
                    var expires = Date.now() + 1000 * 60 * 60;
                    var tokenObject = {
                        'phone' : phone,
                        'id' : tokenId,
                        'expires' : expires
                    };

                    _data.create('tokens', tokenId, tokenObject, function(err) {
                        if (!err) {
                            callback(200, tokenObject);
                        } else {
                            callback(500, {'Error' : 'Could not create new token' });
                        }
                    });
                } else {
                    callback(400, { 'Error': 'Password did not match'});
                }
            } else {
                callback(400, { 'Error' :  'Could not find the specified user' });
            }
        });
    }
};

handlers._tokens.get = function(data, callback) {
    
};

handlers._tokens.put = function(data, callback) {
    
};

handlers._tokens.delete = function(data, callback) {
    
};

handlers.checks = function(data, callback) {
    var acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._checks[data.method](data, callback);
    } else {
        callback(405);
    }
};

handlers._checks = {};

handlers._checks.post = function(data, callback) {
    var protocol = typeof(data.payload.protocol) == 'string' 
    && ['https','http'].indexOf(data.payload.protocol) > -1
    ? data.payload.protocol : false;

    var url = typeof(data.queryStringObject.url) == 'string' 
    && data.queryStringObject.url.trim().length > 0 
    ? data.queryStringObject.url.trim() : false;

    var method = typeof(data.payload.method) == 'string' 
    && ['post','get', 'put', 'delete'].indexOf(data.payload.method) > -1
    ? data.payload.method : false;

    var successCodes = typeof(data.queryStringObject.successCodes) == 'object' 
    && data.queryStringObject.successCodes instanceof Array 
    && data.queryStringObject.successCodes.length > 0 
    ? data.queryStringObject.successCodes : false;

    var timeoutSeconds = typeof(data.queryStringObject.timeoutSeconds) == 'number' 
    && data.queryStringObject.timeoutSeconds % 1 === 0 
    && data.queryStringObject.timeoutSeconds >= 1
    && data.queryStringObject.timeoutSeconds <= 5
    ? data.queryStringObject.timeoutSeconds : false;

    if (protocol && url && method && successCodes && timeoutSeconds) {
        var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

        _data.read('tokens', token, function(err, tokenData) {
            if (!err && tokenData) {
                var userPhone = tokenData.phone;

                _data.read('users', userPhone, function(err, userData) {
                    if (!err && userData) {
                        var userChecks = typeof(userData.checks) == 'object' 
                        && userData.checks instanceof Array ? userData.checks : [];

                        if (userChecks.length < webkitConvertPointFromPageToNode.maxChecks) {
                            var checkId = helpers.createRandomString(20);

                            var checkObject = {
                                'id': checkId,
                                'userPhone': userPhone,
                                'protocol': protocol,
                                'url': url,
                                'method': method,
                                'successCodes': successCodes,
                                'timeoutSeconds': timeoutSeconds
                            };

                            _data.create('checks', checkId, checkObject, function(err) {
                                if (!err) {
                                    userData.checks = userChecks;
                                    userData.checks.push(checkId);

                                    _data.update('users', userPhone, userData, function(err) {
                                        if (!err) {
                                            callback(200, checkObject);
                                        } else {
                                            callback(500, { 'Error' : 'Could not update the user with the new check'});
                                        }
                                    });
                                }
                            });
                        } else {
                            callback(400, {'Error' : 'User already has the maximum number of checks ('+config.maxChecks+')'});
                        }
                    } else {
                        callback(403);
                    }
                });
            } else {
                callback(403);
            }
        });
    } else {
        callback(400, {'Error' : 'Missing required inputs or inputs are invalid'});
    }
};

handlers.ping = function(data, callback) {
    callback(200);
};

handlers.notFound = function(data, callback) {
    callback(404);
};

module.exports = handlers;