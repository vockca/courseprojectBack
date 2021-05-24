const ServerMessages = require('../serverMessages');
const MySqlHelper = require("../../mySQL/mySQLHelper");
const jwt = require('jsonwebtoken');

function userEndpoints (app) {

    app.get("/userInfo/:username", (req, res) => {
        const username = req.params.username;
        const userCookieJwt = req.headers.authorization;

        jwt.verify(userCookieJwt, 'verySecretWord', function (err, decoded) {
            if (err) {
                res.status(401).json(ServerMessages.userNotAuthorized(null));

            } else {
                MySqlHelper.getUserInfo(username, (data, err) => {
                    if (decoded.admin || decoded.login === username) {
                        res.status(200).json(
                            {
                                msg: 'User is authorized',
                                data: data,
                                isEditable: (decoded.admin ? false : true),
                            });

                    } else {
                        res.status(200).json(
                            {
                                msg: 'User is authorized',
                                data: data,
                                isEditable: false,
                            }
                        );
                    }
                })
            }
        });
    });

    app.put("/userInfo", (req, res) => {
        MySqlHelper.updateUserInfo(req.body, (data, err) => {
            if (err) {
                res.status(400).json(ServerMessages.serverError(null));

            } else {
                MySqlHelper.getUserInfo(req.body['user_login'], (data, err) => {
                    if (err) {
                        res.status(400).json(ServerMessages.serverError(null));

                    } else {
                        const token = jwt.sign({
                                login: req.body.login,
                                admin: data['user_isAdmin'],
                            }, 'verySecretWord', {expiresIn: 60 * 60 * 1000}
                        );
                        res.status(200).json(ServerMessages.success(token));
                    }
                })
            }
        })
    });
}


module.exports = userEndpoints;