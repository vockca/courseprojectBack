const ServerMessages = require('../serverMessages');
const MySqlHelper = require("../../mySQL/mySQLHelper");
const jwt = require('jsonwebtoken');

function adminEndpoints (app) {
    app.get("/users", (req, res) => {
        const userCookieJwt = req.headers.authorization;

        jwt.verify(userCookieJwt, 'verySecretWord', function (err, decoded) {
            if (err || !decoded.admin) {
                res.status(400).json(ServerMessages.userNotAuthorized(null));

            } else {
                MySqlHelper.getUsers((data, err) => {
                    if (err) {
                        res.status(400).json(ServerMessages.serverError(null));

                    } else {
                        res.status(200).json(ServerMessages.success(data));
                    }
                })
            }
        });
    })

    app.put("/users/changeAdminStatus/:userid", (req, res) => {
        const userId = req.params.userid;
        const userCookieJwt = req.headers.authorization;

        jwt.verify(userCookieJwt, 'verySecretWord', function (err, decoded) {
            if (err) {
                res.status(401).json(ServerMessages.userNotAuthorized(null));

            } else {
                if (!decoded.admin) {
                    res.status(400).json(ServerMessages.errorWithStatus(null));

                } else {
                    MySqlHelper.getSpecialUserInfoById('user_isAdmin', userId, (data) => {
                        let isUserAdmin = data['user_isAdmin'];

                        MySqlHelper.changeValue('user_isAdmin', !isUserAdmin, userId, (data, err) => {
                            if (err) {
                                res.status(400).json(ServerMessages.serverError(null));

                            } else {
                                res.status(200).json(ServerMessages.success(data));
                            }
                        })
                    })
                }
            }
        });
    })


    app.put("/users/changeBanStatus/:userid", (req, res) => {
        const userId = req.params.userid;
        const userCookieJwt = req.headers.authorization;

        jwt.verify(userCookieJwt, 'verySecretWord', function (err, decoded) {
            if (err) {
                res.status(400).json(ServerMessages.userNotAuthorized(null));

            } else {
                if (!decoded.admin) {
                    res.status(400).json(ServerMessages.errorWithStatus(null));

                } else {
                    MySqlHelper.getSpecialUserInfoById('user_isBanned', userId, (data) => {
                        let isUserBanned = data['user_isBanned'];

                        MySqlHelper.changeValue('user_isBanned', !isUserBanned, userId, (data, err) => {
                            if (err) {
                                res.status(400).json(ServerMessages.serverError(null));

                            } else {
                                res.status(200).json(ServerMessages.success(data));
                            }
                        })
                    })
                }
            }
        });
    })


    app.delete("/users/:userid", (req, res) => {
        const userId = req.params.userid;
        const userCookieJwt = req.headers.authorization;

        jwt.verify(userCookieJwt, 'verySecretWord', function (err, decoded) {
            if (err) {
                res.status(401).json(ServerMessages.userNotAuthorized(null));
            } else {
                if (decoded.admin) {
                    MySqlHelper.deleteUser(userId, (data, err) => {
                        if (err) {
                            res.status(400).json(ServerMessages.serverError(null));

                        } else {
                            res.status(200).json(ServerMessages.success(data));
                        }
                    })
                } else {
                    res.status(400).json(ServerMessages.errorWithStatus(null));
                }
            }
        });
    })
}


module.exports = adminEndpoints;