const mysql = require('mysql');

const MySqlObj = {
    connection : null,
}

const MySqlHelper = {
    initialize: (host, user, password, database) => {
        return MySqlObj.connection = mysql.createConnection({
            host     :  host,
            user     : user,
            password : password,
            database : database,
        })
    },

    registerUser: (login, firstName, lastName, email, password, res) => {
        const sqlLine = `insert into users SET user_login='${login}', user_firstname='${firstName}', user_lastname='${lastName}', user_email='${email}', user_password='${password}'`;
        MySqlObj.connection.query(sqlLine, function(err) {
                if (err) {
                    console.log(err);
                    if (err.code === 'ER_DUP_ENTRY') {
                        res.status(400).json({ msg: 'Such user already exists!'});
                    }
                }
                else {
                    res.status(200).json({msg: 'user registered'});
                    console.log('we did it')
                }
        });
    },

    getUserInfo: (userLogin, callback) => {
        const  sqlLine = `SELECT user_id, user_email, user_login, user_firstname, user_lastname FROM users WHERE user_login='${userLogin}';`
        MySqlObj.connection.query(sqlLine, (err, data) => {
            if (err) {
                console.log(err);
            } else {
                callback(data[0]);
            }
        });
    },

    createCampaign: (campaignName, bonuses, campaignTheme, campaignVideo, moneyAmount, campaignInfo, campaignPictures, campaignTags, campaignCreatorName, res) => {
        const sqlLine = `insert into campaigns SET campaign_name='${campaignName}', campaign_bonuses='${bonuses}',`+
`campaign_theme='${campaignTheme}',campaign_money_amount=${moneyAmount}, campaign_video='${campaignVideo}',`+
`campaign_pictures='${campaignPictures}', campaign_info='${campaignInfo}', campaign_tags='${campaignTags}',`+
`campaign_creator_name='${campaignCreatorName}', campaign_latest_update='${Date.now()}'`;
        MySqlObj.connection.query(sqlLine, function(err) {
                if (err) {
                    console.log(err);
                    if (err.code === 'ER_DUP_ENTRY') {
                        res.status(400).json({ msg: 'Such user already exists!'});
                    }
                }
                else {
                    res.status(200).json({msg: 'campaign successfully created'});
                    console.log('campaign created')
                }
            });
    },

    getCampaings : async (callback) => {
        const  sqlLine = 'SELECT * FROM campaigns';
        MySqlObj.connection.query(sqlLine, async (err, result) => {
            callback(JSON.parse(JSON.stringify(result)));
        })
    },

    getCampaignInfo : async (campaignId, callback) => {
    const  sqlLine = `SELECT * FROM campaigns WHERE campaign_id="${campaignId}"`;
    MySqlObj.connection.query(sqlLine, async (err, result) => {
       // console.log(JSON.parse(JSON.stringify(result)));
        callback(JSON.parse(JSON.stringify(result)));
    });
},

    getUserHashedPass : (login, res, callback) => {
        console.log(login);
        MySqlObj.connection.query(`SELECT user_password FROM users WHERE user_login="${login}";`, async (err, result) => {
            let pass = JSON.parse(JSON.stringify(result));
            if (result.length === 0) {
                res.status(400).json({msg: "The user hasn't been signed up in the system!"})

                password = {
                    answerType : "reject",
                    msg : "The user hasn't been signed up in the system!",
                    password : null,
                }
                callback(password);
            }

            password = {
                answerType : "access",
                msg : 'The user is signed up and passwords match',
                password: pass[0]['user_password'],
            }
            callback(password);
            // if (req.body.password === result[0].password) {
            //     const token = jwt.sign({
            //             id: result[0].id,
            //             email: req.body.email,
            //             password: result[0].password,
            //         }, 'Hahaha', {expiresIn: 3600000}
            //     );
            //
            //     res.cookie('USER', token, {httpOnly: false, maxAge: 3600000});
            //     res.status(200).json({msg: ''});
            //}
            // else {
            //     res.status(400).json({msg: "Incorrect password!"})
            // }

        });
    },
}

module.exports = MySqlHelper;

