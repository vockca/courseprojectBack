const jwt = require('jsonwebtoken');
const ServerMessages = require('../serverMessages');
const MySqlHelper = require("../../mySQL/mySQLHelper");

function commentaryEndpoints (app) {

    app.get(`/:newsId/commentaries`, (req, res) => {
        const newsId = req.params.newsId;

        MySqlHelper.getCommentaries(newsId,(commentaries) => {
            res.status(200).json(ServerMessages.success(commentaries));
        })
    });

    app.post(`/:newsId/commentary`, (req, res) => {
        const newsId = req.params.newsId;
        const text = req.body.commentary;
        console.log(req.body);
        const userCookieJwt = req.headers.authorization;

        jwt.verify(userCookieJwt, 'verySecretWord', function (err, decoded) {
            if (err) {
                res.status(400).json(ServerMessages.userNotAuthorized(null));

            } else {
                MySqlHelper.getUserInfo(decoded.login, (data, err) => {
                    if (err) {
                        res.status(400).json(ServerMessages.serverError(null));

                    } else {
                        MySqlHelper.createCommentary(data['user_id'], newsId, text, (data, err) => {
                            if (err) {
                                res.status(400).json(ServerMessages.serverError(null));
                            } else {
                                res.status(200).json(ServerMessages.success(data));
                            }
                        })
                    }
                })
            }
        });

    })
}


module.exports = commentaryEndpoints;