const mysql = require('mysql');

const MySqlObj = {
    connection : null,
}

const MySqlHelper = {
    initialize: (host, user, password, database) => {
        return MySqlObj.connection = mysql.createPool({
            host     : host,
            user     : user,
            password : password,
            database : database,
        })
    },


    registerUser: (userObj, password, callback) => {
        const isAdmin = (userObj.login === 'admin');
        const sqlLine = `insert into users SET user_login='${userObj.login}', user_firstname='${userObj.firstName}', user_lastname='${userObj.lastName}', user_email='${userObj.email}', user_password='${password}', user_isAdmin=${isAdmin}`;
        MySqlObj.connection.query(sqlLine, function(err) {
            if (err) {
                console.log(err);
                callback(null, err);
            }
            else {
                callback({});
            }
        });
    },

    deleteUser: (userId, callback) => {
        const  sqlLine = `DELETE FROM users WHERE user_id = ${userId}`;
        MySqlObj.connection.query(sqlLine, (err, data) => {
            if (err) {
                console.log(err);
            } else {
                console.log(data);
                callback(data);
            }
        });
    },

    changeValue: (column, value, userId, callback) => {
        const  sqlLine = `UPDATE users SET ${column} = ${value} WHERE user_id = ${userId};`
        MySqlObj.connection.query(sqlLine, (err, data) => {
            if (err) {
                console.log(err);
                callback(null, err);
            } else {
                callback(data);
            }
        });
    },

    getUsers: (callback) => {
        const  sqlLine = `SELECT * FROM users;`
        MySqlObj.connection.query(sqlLine, (err, data) => {
            if (err) {
                console.log(err);
            } else {
                callback(data);
            }
        });
    },

    getUserInfo: (userLogin, callback) => {
        const  sqlLine = `SELECT user_id, user_email, user_login, user_firstname, user_lastname, user_isAdmin, user_isBanned FROM users WHERE user_login='${userLogin}';`
        MySqlObj.connection.query(sqlLine, (err, data) => {
            if (err) {
                console.log(err);
            } else {
                callback(data[0]);
            }
        });
    },

    getSpecialUserInfoById: (column, userId, callback) => {
        const  sqlLine = `SELECT ${column} FROM users WHERE user_id='${userId}';`
        MySqlObj.connection.query(sqlLine, (err, data) => {
            if (err) {
                console.log(err);
            } else {
                console.log(data[0]);
                callback(data[0]);
            }
        });
    },

    updateUserInfo: (userObject, callback) => {
        const  sqlLine = `UPDATE users SET user_login = '${userObject['user_login']}', user_email = '${userObject['user_email']}', user_firstname = '${userObject['user_firstname']}', user_lastname = '${userObject['user_lastname']}'` +
        `WHERE user_id = ${userObject['user_id']}`;
        MySqlObj.connection.query(sqlLine, function(err) {
            if (err) {
                console.log(err);
                callback(null, err);
            }
            else {
                callback('');
            }
        });
    },


    createCampaign: (userObj, campaignObj, imgs, callback) => {
        const sqlLine = `insert into campaigns SET campaign_name='${campaignObj.campaignName}', campaign_bonuses='${campaignObj.bonuses}',`+
`campaign_theme='${campaignObj.campaignTheme}',campaign_money_amount=${campaignObj.moneyAmount}, campaign_video='${campaignObj.campaignVideo}',`+
`campaign_pictures='${imgs}', campaign_info='${campaignObj.campaignInfo}', campaign_tags='${campaignObj.tags}',`+
`campaign_creator_id='${userObj['user_id']}', campaign_latest_update='${Date.now()}'`;
        MySqlObj.connection.query(sqlLine, function(err) {
                if (err) {
                    console.log(err);
                    callback(null, err);
                }
                else {
                    callback({
                        msg: 'campaign successfully created',
                        data: '',
                    });
                }
        });
    },

    getCampaings : async (callback) => {
        const  sqlLine = 'SELECT * FROM campaigns';
        MySqlObj.connection.query(sqlLine, async (err, result) => {
            callback(JSON.parse(JSON.stringify(result)));
        })
    },

    getUserCampaigns : async (userLogin, callback) => {
        const  sqlLine = `SELECT * FROM (SELECT * FROM users WHERE user_login = '${userLogin}') as usr INNER JOIN` +
        `(SELECT * FROM campaigns) AS camp ON user_id = campaign_creator_id`;
        MySqlObj.connection.query(sqlLine, async (err, result) => {
            if (err) {
                console.log(err);
            }
            callback(result);
        })
    },

    getTags : async (callback) => {
        const  sqlLine = 'SELECT campaign_tags FROM campaigns';
        MySqlObj.connection.query(sqlLine, async (err, result) => {
            callback(JSON.parse(JSON.stringify(result)));
        })
    },

    getCampaignInfo : async (campaignId, callback) => {
    const  sqlLine = `SELECT * FROM campaigns WHERE campaign_id="${campaignId}"`;
    MySqlObj.connection.query(sqlLine, async (err, result) => {
        const obj = JSON.parse(JSON.stringify(result[0]));

        const  sqlLine2 = `SELECT user_login FROM users WHERE user_id="${result[0]['campaign_creator_id']}"`
        MySqlObj.connection.query(sqlLine2, async (err, result) => {
            obj['user'] = JSON.parse(JSON.stringify(result[0]));
            callback(obj);
        });
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
        });
    },

    createCampaignNews: (newsObj, campaignObj, img, creatorId, creatorLogin, callback) => {
        const sqlLine = `INSERT INTO news SET news_header='${newsObj.newsHeader}', news_text='${newsObj.newsText}',`+
            `news_img='${img}', news_creator_login='${creatorLogin}', news_creator_id='${creatorId}', news_campaign_id=${campaignObj['campaign_id']}, news_date='${Date.now()}'`;
        MySqlObj.connection.query(sqlLine, function(err) {
            if (err) {
                console.log(err);
                callback(null, err);
            }
            else {
                callback({
                    msg: 'campaign successfully created',
                    data: '',
                });
            }
        });
    },

    deleteCampaignNews: (newsId, callback) => {
        const  sqlLine = `DELETE FROM news WHERE news_id = ${newsId}`;

        MySqlObj.connection.query(sqlLine, function(err) {
            if (err) {
                console.log(err);
                callback(null, err);
            }
            else {
                callback({
                    msg: 'campaign successfully created',
                    data: '',
                });
            }
        });
    },

    getCampaignNews: (campaignId, callback) => {
        const sqlLine = `SELECT * FROM news WHERE news_campaign_id = ${campaignId}`;
        MySqlObj.connection.query(sqlLine, function(err, data) {
            if (err) {
                console.log(err);
                callback(null, err);
            }
            else {
                callback(data);
            }
        });
    },

    getCampaignNewsInfo: (newsId, callback) => {
        const sqlLine = `SELECT * FROM news WHERE news_id = ${newsId}`;
        MySqlObj.connection.query(sqlLine, function(err, data) {
            if (err) {
                console.log(err);
                callback(null, err);
            }
            else {
                callback(data[0]);
            }
        });
    },

    createCommentary: (userId, newsId, text, callback) => {
        const sqlLine = `INSERT INTO commentaries SET commentaries_user_id='${userId}', commentaries_text='${text}',`+
            `commentaries_news_id='${newsId}', commentaries_date='${Date.now()}'`;

        MySqlObj.connection.query(sqlLine, function(err, data) {
            if (err) {
                console.log(err);
                callback(null, err);
            }
            else {
                callback(data);
            }
        });
    },

    getCommentaries: (newsId, callback) => {
        const sqlLine = `SELECT * FROM (SELECT * FROM (SELECT * FROM commentaries WHERE commentaries_news_id = ${newsId}) as c INNER JOIN` +
        `(SELECT user_login, user_id from users) as userLogin ON commentaries_user_id = user_id) AS comm`;

        MySqlObj.connection.query(sqlLine, function(err, data) {
            if (err) {
                console.log(err);
                callback(null, err);
            }
            else {
                callback(data);
            }
        });
    },


    // selectAllNewsFromUser : (userId, campaignId, callback) => {
    //     const sqlLine = `SELECT *` +
    //         `FROM (SELECT * FROM campaigns WHERE campaign_id=${campaignId}) AS campaign` +
    //         `LEFT JOIN (SELECT * FROM news LEFT JOIN (SELECT * FROM commentaries WHERE commentaries_user_id = ${userId})`+
    //         `ON commentaries_news_id = news_id) ON campaign_id = news_campaign_id`;
    //
    //     MySqlObj.connection.query(sqlLine, async (err, result) => {
    //
    // }.
}

module.exports = MySqlHelper;

