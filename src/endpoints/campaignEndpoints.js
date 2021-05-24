const ServerMessages = require('../serverMessages');
const MySqlHelper = require("../../mySQL/mySQLHelper");
const jwt = require('jsonwebtoken');


function campaignEndpoints (app) {

    app.get("/campaigns", (req, res) => {
        MySqlHelper.getCampaings((campaigns) => {
            res.status(200).json(ServerMessages.success(campaigns));
        })
    })

    app.get("/:username/campaigns", (req, res) => {
        const username = req.params.username;

        MySqlHelper.getUserCampaigns(username,(campaigns) => {
            console.log(campaigns);
            res.status(200).json(ServerMessages.success(campaigns));
        })
    })

    app.get('/MainPage/campaignDetails/:id', (req, res) => {
        const id = req.params.id;
        MySqlHelper.getCampaignInfo(id, (campaign) => {
            if (campaign.length === 0) {
                res.send(ServerMessages.dataError(campaign))
            }
            console.log(campaign);
            res.send(ServerMessages.success(campaign))
        })
    })

    app.post("/CreateCampaign", async (req, res) => {
        const body = req.body;

        MySqlHelper.createCampaign(body.user, body.campaign, body.imgs, (data, err) => {
            if (err) {
                res.status(400).json(ServerMessages.serverError(null));

            } else {
                res.status(200).json(ServerMessages.success(data));
            }
        });
    });

    app.post("/CreateCampaignNews", async (req, res) => {
        const body = req.body;
        const userCookieJwt = req.headers.authorization;
        console.log(body);

        jwt.verify(userCookieJwt, 'verySecretWord', function (err, decoded) {
            if (err) {
                res.status(401).json(ServerMessages.userNotAuthorized(null));
            } else {
                console.log(decoded.id);
                if (body.campaign['campaign_creator_id'] === decoded.id || decoded.login === 'admin') {
                    MySqlHelper.createCampaignNews(body.news, body.campaign, body.img, decoded.id, decoded.login, (data, err) => {
                        if (err) {
                            res.status(400).json(ServerMessages.serverError(null));

                        } else {
                            res.status(200).json(ServerMessages.success(data));
                        }
                    });

                } else {
                    res.status(400).json(ServerMessages.errorWithStatus(null));
                }
            }
        });
    });

    app.get('/:id/campaignNews', async  (req, res) => {
        const campaignId = req.params.id;

        MySqlHelper.getCampaignNews(campaignId, (data, err) => {
            if (err) {
                res.status(400).json(ServerMessages.serverError(null));

            } else {
                res.status(200).json(ServerMessages.success(data));
            }
        })
    });

    app.delete('/campaignNews/:id', async  (req, res) => {
        const newsId = req.params.id;
        const userCookieJwt = req.headers.authorization;
        console.log(userCookieJwt);

        jwt.verify(userCookieJwt, 'verySecretWord', function (err, decoded) {
            if (err) {
                res.status(401).json(ServerMessages.userNotAuthorized(null));
            } else {
                MySqlHelper.getCampaignNewsInfo(newsId, (data) => {
                    if (decoded.admin || data['news_creator_login'] === decoded.login) {
                        MySqlHelper.deleteCampaignNews(newsId, (data, err) => {
                            if (err) {
                                res.status(400).json(ServerMessages.serverError(null));

                            } else {
                                res.status(200).json(ServerMessages.success(data));
                            }
                        })
                    } else {
                        res.status(400).json(ServerMessages.errorWithStatus(null));
                    }
                })
            }
        });
    });
}


module.exports = campaignEndpoints;