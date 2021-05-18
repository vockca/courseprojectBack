const MySqlHelper = require("./mySQL/mySQLHelper");

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 3000;
const bcrypt = require('bcrypt');
const saltRounds = 10;

//origin: 'http://localhost',
//origin: 'https://gracious-jennings-2eaa14.netlify.app',

app.use(cookieParser());
app.use(cors({
    credentials: true }));
app.use(express.json());

//const connection = MySqlHelper.initialize('localhost','root','Djghjc1999', 'crowdfundingsite');
const connection = MySqlHelper.initialize('us-cdbr-east-03.cleardb.com','b052c723b05660','1770549d', 'heroku_9202c60e1f8bc22');

connection.connect();

app.get("/userInfo", (req, res) => {
    const userCookieJwt = req.cookies['USER'];
    //console.log(req.cookies['USER']);


    jwt.verify(userCookieJwt, 'verySecretWord', function(err, decoded) {
        console.log(decoded);
        if (err) {
            res.status(401).json(
                {
                    msg: 'Error with authorization',
                    data: null,
                });
        } else {
            MySqlHelper.getUserInfo(decoded.login, (data) => {
                res.status(200).json(
                    {
                        msg: 'User is authorized',
                        data: data,
                    });
            })
        }
    });

    console.log('user connected');
});

app.get("/campaigns", (req, res) => {
    console.log('user connected');
    MySqlHelper.getCampaings((campaigns) => {
        if (campaigns.length === 0) {
            res.status(200).json(
                {
                    msg: "There is no campaigns yet",
                    data: campaigns,
                })
        }
        res.status(200).json(
            {
                msg: "success",
                data: campaigns,
            })
    })
})

app.get('/MainPage/campaignDetails/:id', (req, res) => {
    const id = req.params.id;
    MySqlHelper.getCampaignInfo(id,(campaign) => {
        console.log(campaign[0]);
        if (campaign.length === 0) {
            res.send(
                {
                    msg: "There is no campaigns yet",
                    data: campaign[0],
                })
        }
        res.send(
            {
                msg: "success",
                data: campaign[0],
            })
    })
})

app.post("/SignUp", async (req, res) => {
    console.log('user is trying to signing up');
    console.log(req.body);
    let body = req.body;
    let encryptedPass = await bcrypt.hash(body.password, saltRounds);
    MySqlHelper.registerUser(body.login, body.firstName, body.lastName, body.email, encryptedPass, res);
});

app.post("/CreateCampaign", async (req, res) => {
    console.log('user is trying to create campaign');
    console.log(req.body);
    let body = req.body;
    MySqlHelper.createCampaign(body.campaignName, body.bonuses, body.campaignTheme, body.campaignVideo, body.moneyAmount, body.campaignInfo, body.campaignPictures, body.tags,'default', res);
});

app.post("/LogIn", async (req, res) => {
    let body = req.body;

    MySqlHelper.getUserHashedPass(body.login, res, async (data) => {
        if( data.answerType === 'reject') {
            res.status(400).json(
                {
                    msg: data.msg,
                    data: '',
                });
        } else {
            let encryptedPass = data.password;

            let isPassMatch = await bcrypt.compare(body.password, encryptedPass);

            if (isPassMatch) {
                const token = jwt.sign({
                        login: body.login,
                        password: body.password,
                    }, 'verySecretWord', { expiresIn: 60 * 60 * 1000}
                );

                res.cookie('USER', token, { maxAge: (60 * 60 * 1000), httpOnly: false  });

                res.status(200).json(
                    {
                            msg:"you are authorized",
                            data: body.login,
                        });
            } else {
                res.status(400).json(
                    {
                        msg: "Incorrect password!",
                        data: '',
                    })
            }
        }
    });
    //let promise = await bcrypt.compare(body.password, encryptedPass);
//  let promise = await bcrypt.compare('12345', encryptedPass);
//     if (promise) {
//         res.status(200).send({msg:"you are authorized"})
//     } else {
//         res.status(400).json({msg: "Incorrect password!"})
//     }
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});

