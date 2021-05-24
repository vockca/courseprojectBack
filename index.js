const MySqlHelper = require("./mySQL/mySQLHelper");
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cloudinary = require('cloudinary').v2;
const ServerMessages = require('./src/serverMessages');
const campaignEndpoints = require('./src/endpoints/campaignEndpoints');
const userEndpoints = require('./src/endpoints/userEndpoints');
const adminEndpoints = require('./src/endpoints/adminEndpoints');
const commentaryEndpoints = require('./src/endpoints/commentaryEndpoints');

const app = express();
const port = process.env.PORT || 3000;

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

campaignEndpoints(app);
userEndpoints(app);
adminEndpoints(app);
commentaryEndpoints(app);


app.post("/images", async (req, res) => {
    const fileStr = req.body.data;


    let uploadResponse = await cloudinary.uploader.upload(fileStr, {
        upload_preset: 'default'
    })

    res.status(200).json({
        url: uploadResponse.url,
    });
})


app.get("/tags", (req, res) => {
    MySqlHelper.getTags((tags) => {
        res.status(200).json(ServerMessages.success(tags));
    })
})


app.post("/SignUp", async (req, res) => {
    let body = req.body;
    let encryptedPass = await bcrypt.hash(body.password, saltRounds);

    MySqlHelper.registerUser(body, encryptedPass, (data, err) => {
        if (err) {
            res.status(400).json(ServerMessages.serverError(null));

        } else {
            res.status(200).json(ServerMessages.success(data));
        }
    });
});


app.post("/LogIn", async (req, res) => {
    const body = req.body;

    MySqlHelper.getUserHashedPass(body.login, res, async (data) => {
        if (data.answerType === 'reject') {
            res.status(400).json(
                {
                    msg: data.msg,
                    data: null,
                    token: null,
                });
        } else {
            const encryptedPass = data.password;

            let isPassMatch = await bcrypt.compare(body.password, encryptedPass);

            if (isPassMatch) {
                MySqlHelper.getUserInfo(body.login, (data, err) => {
                    if (data['user_isBanned']) {
                        res.status(200).json(ServerMessages.userBanned(null));

                    } else {
                        console.log(data['user_id']);
                        const token = jwt.sign({
                                login: body.login,
                                admin: data['user_isAdmin'],
                                id: data['user_id'],
                            }, 'verySecretWord', {expiresIn: 60 * 60 * 1000}
                        );

                        res.status(200).json(
                            {
                                msg: "you are authorized",
                                data: data,
                                token: token,
                            }
                        );
                    }
                })
            } else {
                res.status(400).json(ServerMessages.userNotAuthorized(null))
            }
        }
    });
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});

