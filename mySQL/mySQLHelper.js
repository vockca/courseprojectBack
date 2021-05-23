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

    // handleDisconnect: (host, user, password, database) => {
    //
    //     function handleDisconnect(host, user, password, database) {
    //         MySqlHelper.initialize(host, user, password, database); // Recreate the connection, since
    //                                                         // the old one cannot be reused.
    //
    //         MySqlObj.connection.connect(function(err) {              // The server is either down
    //             if(err) {                                     // or restarting (takes a while sometimes).
    //                 console.log('error when connecting to db:', err);
    //                 setTimeout(() => handleDisconnect(host, user, password, database), 2000); // We introduce a delay before attempting to reconnect,
    //             }                                     // to avoid a hot loop, and to allow our node script to
    //         });                                     // process asynchronous requests in the meantime.
    //                                                 // If you're also serving http, display a 503 error.
    //         MySqlObj.connection.on('error', function(err) {
    //             console.log('db error', err);
    //             if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
    //                 handleDisconnect(host, user, password, database);                         // lost due to either server restart, or a
    //             } else {                                      // connnection idle timeout (the wait_timeout
    //                 throw err;                                  // server variable configures this)
    //             }
    //         });
    //     }
    //
    //     handleDisconnect(host, user, password, database);
    // },

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

    getTags : async (callback) => {
        const  sqlLine = 'SELECT campaign_tags FROM campaigns';
        MySqlObj.connection.query(sqlLine, async (err, result) => {
            callback(JSON.parse(JSON.stringify(result)));
        })
    },

    getCampaignInfo : async (campaignId, callback) => {
    const  sqlLine = `SELECT * FROM campaigns WHERE campaign_id="${campaignId}"`;
    MySqlObj.connection.query(sqlLine, async (err, result) => {
        const obj = JSON.parse(JSON.stringify(result));

        const  sqlLine2 = `SELECT user_login FROM users WHERE user_id="${result[0]['campaign_creator_id']}"`
        MySqlObj.connection.query(sqlLine2, async (err, result) => {
            obj[0]['user'] = JSON.parse(JSON.stringify(result[0]));
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

