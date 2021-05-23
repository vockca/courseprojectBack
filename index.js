const MySqlHelper = require("./mySQL/mySQLHelper");

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 3000;
const bcrypt = require('bcrypt');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: 'nackca',
    api_key: '132565546611861',
    api_secret: 'W7ASR2RJmPW-KAcyQalERS7j9Nc'
});

const saltRounds = 10;

app.use(cors());
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true, }));

MySqlHelper.initialize('us-cdbr-east-03.cleardb.com', 'b052c723b05660', '1770549d', 'heroku_9202c60e1f8bc22');

app.post("/images", async (req, res) => {
    const fileStr = req.body.data;


    let uploadResponse = await cloudinary.uploader.upload(fileStr, {
        upload_preset: 'default'
    })

    res.status(200).json({
        url: uploadResponse.url,
    });
})


//MySqlHelper.handleDisconnect('us-cdbr-east-03.cleardb.com','b052c723b05660','1770549d', 'heroku_9202c60e1f8bc22')

//create object which contains cooked msgs to simplify code
app.get("/users", (req, res) => {
    const userCookieJwt = req.headers.authorization;

    jwt.verify(userCookieJwt, 'verySecretWord', function (err, decoded) {
        if (err || !decoded.admin) {
            res.status(401).json(
                {
                    msg: 'Error with authorization',
                    data: null,
                });
        } else {
            MySqlHelper.getUsers((data, err) => {
                if (err) {
                    console.log(err);
                    res.status(400).json(
                        {
                            msg: 'Error',
                            data: null,
                        }
                    );
                } else {
                    res.status(200).json(
                        {
                            msg: 'Success',
                            data: data,
                        }
                    );
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
            console.log(err);
            res.status(401).json(
                {
                    msg: 'Access error',
                    data: null,
                }
            );
        } else {
            if (!decoded.admin) {
                res.status(400).json(
                    {
                        msg: 'Access denied',
                        data: null,
                    }
                );
            } else {
                MySqlHelper.getSpecialUserInfoById('user_isAdmin', userId, (data) => {
                    let isUserAdmin = data['user_isAdmin'];
                    MySqlHelper.changeValue('user_isAdmin', !isUserAdmin, userId, (data, err) => {
                        if (err) {
                            console.log(err);
                            res.status(400).json(
                                {
                                    msg: 'Error',
                                    data: err,
                                }
                            );
                        }
                        res.status(200).json(
                            {
                                msg: 'user is Admin',
                                data: data,
                            }
                        );
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
            console.log(err);
            res.status(401).json(
                {
                    msg: 'Access error',
                    data: null,
                }
            );
        } else {
            if (!decoded.admin) {
                res.status(400).json(
                    {
                        msg: 'Access denied',
                        data: null,
                    }
                );
            } else {
                MySqlHelper.getSpecialUserInfoById('user_isBanned', userId, (data) => {
                    let isUserBanned = data['user_isBanned'];
                    MySqlHelper.changeValue('user_isBanned', !isUserBanned, userId, (data, err) => {
                        if (err) {
                            console.log(err);
                            res.status(400).json(
                                {
                                    msg: 'Error',
                                    data: err,
                                }
                            );
                        }
                        res.status(200).json(
                            {
                                msg: 'user is Admin',
                                data: data,
                            }
                        );
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
            console.log(err);
            res.status(401).json(
                {
                    msg: 'Access error',
                    data: null,
                }
            );
        } else {
            if (decoded.admin) {
                MySqlHelper.deleteUser(userId, (data, err) => {
                    if (err) {
                        console.log(err);
                        res.status(400).json(
                            {
                                msg: 'Error',
                                data: err,
                            }
                        );
                    }
                    res.status(200).json(
                        {
                            msg: 'User deleted',
                            data: data,
                        }
                    );
                })
            } else {
                res.status(400).json(
                    {
                        msg: 'Access denied',
                        data: null,
                    }
                );
            }
        }
    });
})

app.get("/userInfo/:username", (req, res) => {
    const username = req.params.username;
    const userCookieJwt = req.headers.authorization;

    jwt.verify(userCookieJwt, 'verySecretWord', function (err, decoded) {
        if (err) {
            console.log(err);
            res.status(401).json(
                {
                    msg: 'Error with authorization',
                    data: null,
                }
            );
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
    console.log(req.body);
    MySqlHelper.updateUserInfo(req.body, (data, err) => {
        if (err) {
            res.status(400).json({
                msg: "Error, cant update user info",
                data: data,
            })
        } else {
            MySqlHelper.getUserInfo(req.body['user_login'], (data, err) => {
                if (err) {
                    console.log(err);
                    res.status(400).json(
                        {
                            msg: "Error",
                            data: null,
                        })
                } else {
                    const token = jwt.sign({
                            login: req.body.login,
                            admin: data['user_isAdmin'],
                        }, 'verySecretWord', {expiresIn: 60 * 60 * 1000}
                    );
                    res.status(200).json(
                        {
                            msg: "you are authorized",
                            data: token,
                        }
                    );
                }
            })
        }
    })
});

app.get("/campaigns", (req, res) => {
    MySqlHelper.getCampaings((campaigns) => {
        if (campaigns.length === 0) {
            res.status(200).json(
                {
                    msg: "There is no campaigns yet",
                    data: campaigns,
                }
            )
        }
        res.status(200).json(
            {
                msg: "success",
                data: campaigns,
            }
        )
    })
})

app.get("/tags", (req, res) => {
    MySqlHelper.getTags((tags) => {
        if (tags.length === 0) {
            res.status(200).json(
                {
                    msg: "There is no campaigns yet",
                    data: tags,
                }
            )
        }
        res.status(200).json(
            {
                msg: "success",
                data: tags,
            }
        )
    })
})

app.get('/MainPage/campaignDetails/:id', (req, res) => {
    const id = req.params.id;
    MySqlHelper.getCampaignInfo(id, (campaign) => {
        if (campaign.length === 0) {
            res.send(
                {
                    msg: "There is no campaigns yet",
                    data: null,
                }
            )
        }
        res.send(
            {
                msg: "success",
                data: campaign[0],
            }
        )
    })
})

app.post("/SignUp", async (req, res) => {
    console.log('user is trying to signing up');
    let body = req.body;
    let encryptedPass = await bcrypt.hash(body.password, saltRounds);
    MySqlHelper.registerUser(body, encryptedPass, (data, err) => {
        if (err) {
            res.status(400).json(
                {
                    msg: 'Error, cant register user',
                    data: data,
                }
            )
        } else {
            res.status(200).json(
                {
                    msg: 'user is registered',
                    data: data,
                }
            )
        }
    });
});

app.post("/CreateCampaign", async (req, res) => {
    console.log('user is trying to create campaign');
    console.log(req.body);
    let body = req.body;
    MySqlHelper.createCampaign(body.user, body.campaign, body.imgs, (data, err) => {
        if (err) {
            res.status(400).json({
                msg: 'Error, cant create campaign',
                data: null,
            })
        } else {
            res.status(200).json({
                msg: 'Campaign is created',
                data: data,
            })
        }
    });
});

app.post("/LogIn", async (req, res) => {
    console.log(req.body)
    let body = req.body;

    MySqlHelper.getUserHashedPass(body.login, res, async (data) => {
        if (data.answerType === 'reject') {
            res.status(400).json(
                {
                    msg: data.msg,
                    data: null,
                    token: null,
                });
        } else {
            let encryptedPass = data.password;

            let isPassMatch = await bcrypt.compare(body.password, encryptedPass);

            if (isPassMatch) {
                MySqlHelper.getUserInfo(body.login, (data, err) => {
                    if (err) {
                        console.log(err);
                        res.status(400).json(
                            {
                                msg: "Incorrect password!",
                                data: null,
                                token: null,
                            })
                    } else {
                        const token = jwt.sign({
                                login: body.login,
                                admin: data['user_isAdmin'],
                            }, 'verySecretWord', {expiresIn: 60 * 60 * 1000}
                        );
                        res.status(200).json(
                            {
                                msg: "you are authorized",
                                data: data,
                                token: token,
                            });
                    }
                })
            } else {
                res.status(400).json(
                    {
                        msg: "Incorrect password!",
                        data: null,
                    })
            }
        }
    });
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});

