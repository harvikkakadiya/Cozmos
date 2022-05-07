// Author: Harsh Patel
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const constants = require("../../constants/constants");
let db = require('./dbConnect');
const loggedInUser = require("../utils/getLoggedInUser");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require('uuid');

const saltRounds = 10;


const login = (req, res) => {
    try {
        // first checking body contains both email and password and then checking if email exist
        if (req && req.body && req.body.email && req.body.password) {
            const email = req.body.email;
            const password = req.body.password;

            db.query(
                "SELECT * FROM cozmos_user WHERE email = ?;",
                email,
                (err, result) => {
                    if (err) {
                        return res.status(500).json({success: false, message: constants.INTERNAL_SERVER_ERROR_MESSAGE});
                        // res.send({ err: err });
                    }

                    if (result.length > 0) {
                        bcrypt.compare(password, result[0].password, (error, response) => {
                            if (response) {
                                req.session.user = result;
                                // create jwt token and getting secret from env
                                const token = jwt.sign(
                                    {id: result[0].id},
                                    process.env.JWT_SECRET_TOKEN,
                                );
                                // Update token in database
                                db.query(
                                    " UPDATE cozmos_user set jwt_token = ? WHERE email = ?;",
                                    [token, email],
                                    (err, result) => {
                                        if (err) {
                                            return res.status(500).json({
                                                success: false,
                                                message: constants.INTERNAL_SERVER_ERROR_MESSAGE
                                            })
                                        } else if (result.changedRows > 0) {
                                            return res.status(200).json({success: true, token: token});
                                        }
                                    })

                            } else {
                                return res.status(401).json({
                                    success: false,
                                    message: "Wrong username/password combination!"
                                });
                            }
                        });
                    } else {
                        return res.status(401).json({success: false, message: "Wrong username/password combination!"});
                    }
                }
            );
        } else {
            return res.status(400).json({success: false, message: constants.BAD_REQUEST_MESSAGE})
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: constants.INTERNAL_SERVER_ERROR_MESSAGE, success: false });
    }
};

const checkLogin = (req,res)=> {
    res.status(200).json({success: true, message: "Valid User" });
}

const getUserDetails = (req,res) => {

    let userId;

    try {
        // check for token and fetch user details
        if (req && req.headers && req.headers.authorization) {
            loggedInUser.getUser(req.headers.authorization, function (err, id) {
                userId = id;
            });
            let sql = "SELECT * FROM cozmos_user where id = " + userId;
            console.log(sql);
            let query = db.query(sql, (err, results) => {
                console.log("err: ",err);
                console.log("results: ",results);
                if (err) {
                    return res.status(401).json({success: false, message: "Unable to fetch details!" });
                }
                else if(results) {
                    // create response object to send required details
                    let responseObject = {
                        first_name : results[0].first_name,
                        last_name : results[0].last_name,
                        email : results[0].email,
                    }
                    res.status(200).json({success: true, userData: responseObject});
                }

            });
        } else {
            res.status(200).json({ success: false, message: "Authentication failed" });
        }
        console.log("hello");
        console.log(userId);


    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", success: false });
    }

}

const updateUserDetails = (req, res) => {
    console.log("Line 103");
    let userId;
    try {
        if (req && req.headers && req.headers.authorization) {
            loggedInUser.getUser(req.headers.authorization, function (err, id) {
                userId = id;
            });

            // check for email, firstname, lastname, validate
            if(req && req.body && req.body.email && req.body.first_name && req.body.last_name){

                const email = req.body.email;
                const first_name = req.body.first_name;
                const last_name = req.body.last_name;
                console.log("email" ,email);
                if(first_name.trim().length < 1 || last_name.trim().length < 1 || email.trim().length < 1){
                    return res.status(400).json({success: false,message: constants.BAD_REQUEST_MESSAGE});
                }

                if(!(/^[a-zA-Z]+$/.test(first_name))){

                    return res.status(400).json({success: false,message: "First name not following format"});
                }
                if(!(/^[a-zA-Z]+$/.test(last_name))){
                    return res.status(400).json({success: false,message: "Last name not following format"});

                }
                if(!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))){
                    return res.status(400).json({success: false,message: "Email not following format"});

                }
                // let  update_query = "select id, street, city, province, zip, country, shipping_ind, upper(title) as title from address " + "where user_id = " + userId;

                // After validation update user
                db.query(
                    " UPDATE cozmos_user set first_name = ?, last_name = ?, email = ? WHERE id = ?;",
                    [first_name,last_name,email,userId] ,
                    (err,result) => {
                        console.log("err: " ,err);
                        console.log("result: " ,result);
                        if(err){
                            console.log("LINE 142");
                            return res.status(200).json({success: false,message: "Email already exists"});
                            // return res.status(500).json({success: false,message: constants.INTERNAL_SERVER_ERROR_MESSAGE})
                        } else if(result){
                            console.log("LINE 145");
                            return res.status(200).json({success: true,message: "User updated successfully"});
                        }
                    })
            } else {
                console.log("Line 132: ");
                return res.status(400).json({success: false,message: constants.BAD_REQUEST_MESSAGE})
            }
        } else {
            console.log("Line 135: ");
            res.status(200).json({ success: false, message: "Authentication failed" });
        }
        console.log("LINE 158");
    }
    catch (error) {
        console.log("Line 142: ");
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", success: false });
    }

};

const changePassword = (req,res) => {

    let userId;
    try {
        console.log("req: ",req.body);
        if (req && req.headers && req.headers.authorization) {
            loggedInUser.getUser(req.headers.authorization, function (err, id) {
                userId = id;
            });

            // check for password, apply validation
            if(req && req.body && req.body.password && req.body.newPassword ){

                const password = req.body.password;
                const new_password = req.body.newPassword;
                if(!(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,26}$/.test(new_password))){
                    return res.status(400).json({success: false,message: "New password not following format"});
                }
                db.query(
                    "SELECT * FROM cozmos_user WHERE id = ?;",
                    userId,
                    (err, result) => {
                        if (err) {
                            return res.status(500).json({success: false,message: constants.INTERNAL_SERVER_ERROR_MESSAGE});
                            // res.send({ err: err });
                        }

                        if (result.length > 0) {
                            // encrypt password from user and check db password if success go ahead
                            bcrypt.compare(password, result[0].password, (error, response) => {
                                if (response) {
                                    console.log("response");
                                    // Encrypt new password and update for user
                                    bcrypt.hash(new_password, saltRounds, (err, hash) => {
                                        db.query(
                                            " UPDATE cozmos_user set password = ? WHERE id = ?;",
                                            [hash, userId],
                                            (err, result) => {
                                                console.log("err: ", err);
                                                console.log("result: ", result);
                                                if (err) {
                                                    console.log("LINE 142");
                                                    return res.status(200).json({
                                                        success: false,
                                                        message: "An error occurred while updating password"
                                                    });
                                                    // return res.status(500).json({success: false,message: constants.INTERNAL_SERVER_ERROR_MESSAGE})
                                                } else if (result) {
                                                    console.log("LINE 145");
                                                    return res.status(200).json({
                                                        success: true,
                                                        message: "User updated successfully"
                                                    });
                                                }
                                            })
                                    });
                                } else {
                                    console.log("LINE 223");
                                    return res.status(200).json({success: false, message: "Old Password does not match" });
                                }
                            });
                        } else {
                            return res.status(401).json({success: false, message: "Wrong username/password combination!" });
                        }
                    }
                );




                // let  update_query = "select id, street, city, province, zip, country, shipping_ind, upper(title) as title from address " + "where user_id = " + userId;


            }
            else {
                console.log("Line 132: ");
                return res.status(400).json({success: false,message: constants.BAD_REQUEST_MESSAGE})
            }
        } else {
            console.log("Line 135: ");
            return res.status(200).json({ success: false, message: "Authentication failed" });
        }
        console.log("LINE 158");
    }
    catch (error) {
        console.log("Line 142: ");
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", success: false });
    }
};

const getEmailForForgotPassword = async (req,res) => {
    let token1 = uuidv4();
    console.log("token: ",token1);
    try {
        // check for email
        if (req && req.body && req.body.email) {
            const email = req.body.email;

            db.query(
                "SELECT * FROM cozmos_user WHERE email = ?;",
                email,
                (err, result) => {
                    if (err) {
                        return res.status(500).json({success: false, message: constants.INTERNAL_SERVER_ERROR_MESSAGE});
                        // res.send({ err: err });
                    }


                    if (result.length > 0) {
                        // generate token and store it in db
                        let forgot_password_token = uuidv4();
                        console.log("result.length: ", result.length);
                        console.log("result.length: ", result);
                        // console.log("token: ",token);

                        db.query(
                            " UPDATE cozmos_user set forgot_password_token = ? WHERE email = ?;",
                            [forgot_password_token, email],
                            async (err, result) => {
                                if (err) {
                                    console.log("err: ", err);
                                    return res.status(500).json({
                                        success: false,
                                        message: constants.INTERNAL_SERVER_ERROR_MESSAGE
                                    })
                                } else if (result.changedRows > 0) {
                                    console.log("result.changedRows: ", result.changedRows)


                                    let testAccount = await nodemailer.createTestAccount();

                                    let transporter = nodemailer.createTransport({
                                        service: 'gmail',
                                        auth: {
                                            user: '',
                                            pass: ''
                                        }
                                    });

                                    // create url for resetting password to be sent in mail
                                    let url = constants.FRONT_END_URL;
                                    url += "/set-password?query=";
                                    url += forgot_password_token
                                    console.log("url", url);
                                    let passwordContent = "<span> Here is the link to reset your password</span>";
                                    passwordContent += `<a href=${url}>Click here to reset password</a>`;

                                    // Send mail
                                    let info = await transporter.sendMail({
                                        from: '"Cozmos Admin', // sender address
                                        to: email, // list of receivers
                                        subject: "Reset your Password", // Subject line
                                        html: passwordContent
                                    });

                                    console.log("Message sent: %s", info.messageId);
                                    return res.status(200).json({
                                        success: true,
                                        token: forgot_password_token,
                                        url: url,
                                        message: "Check your email for resetting the password!"
                                    });

                                }
                            })
                        // return res.status(200).json({success: true});
                    } else {
                        return res.status(200).json({
                            success: true,
                            message: "Check your email for resetting the password!"
                        });
                    }


                });
        } else {
            return res.status(400).json({success: false, message: constants.BAD_REQUEST_MESSAGE})
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: constants.INTERNAL_SERVER_ERROR_MESSAGE, success: false });
    }
};

const setPassword = (req,res) => {
    let email = "";
    try {
        // check password and token
        if (req && req.body && req.body.password && req.body.forgot_password_token) {
            const password = req.body.password;
            const forgot_password_token = req.body.forgot_password_token;
            console.log("forgot_password_token: ", forgot_password_token);
            // Get user from token and match in database
            db.query(
                "SELECT * FROM cozmos_user WHERE forgot_password_token = ?;",
                forgot_password_token,
                (err, result) => {
                    if (err) {
                        return res.status(500).json({success: false, message: constants.INTERNAL_SERVER_ERROR_MESSAGE});
                        // res.send({ err: err });
                    }


                    if (result.length > 0) {
                        email = result[0].email;

                        // encrypt password and store in database
                        bcrypt.hash(password, saltRounds, (err, hash) => {
                            if (err) {
                                return res.status(500).json({
                                    success: false,
                                    message: constants.INTERNAL_SERVER_ERROR_MESSAGE
                                });
                            }

                            db.query(
                                "UPDATE cozmos_user set password = ? WHERE forgot_password_token = ?",
                                [hash, forgot_password_token],
                                (err, result) => {

                                    if (err) {

                                        // return res.status(200).json({success: false,message: "Email already exists"});
                                    }
                                    if (result) {
                                        console.log("result", result);

                                        // set token as null so user cant update the password with same link
                                        db.query(
                                            "UPDATE cozmos_user set forgot_password_token = ? WHERE email = ?",
                                            [null, email],
                                            (err, result) => {

                                                if (err) {

                                                    return res.status(200).json({
                                                        success: false,
                                                        message: "An error occurred"
                                                    });
                                                }
                                                if (result) {
                                                    console.log("result", result);
                                                    return res.status(200).json({
                                                        success: true,
                                                        message: "User Password updated successfully"
                                                    });
                                                }
                                            }
                                        )
                                        // return res.status(200).json({success: true,message: "User Password updated successfully"});
                                    }
                                }
                            );
                        });

                    } else {
                        return res.status(200).json({
                            success: false,
                            message: "Could not fetch details. Try resetting again"
                        });
                    }


                });
        } else {
            return res.status(400).json({success: false, message: constants.BAD_REQUEST_MESSAGE})
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: constants.INTERNAL_SERVER_ERROR_MESSAGE, success: false });
    }

}

const logout = (req,res) => {
    let userId;
    try {

        if (req && req.headers && req.headers.authorization) {
            loggedInUser.getUser(req.headers.authorization, function (err, id) {
                userId = id;
            });

            //  Update JWT token and set it to null

            db.query(
                " UPDATE cozmos_user set jwt_token = ? WHERE id = ?;",
                ["",userId] ,
                (err,result) => {
                    console.log("err: " ,err);
                    console.log("result: " ,result);
                    if(err){
                        console.log("LINE 142");
                        return res.status(200).json({success: false,message: "Could not log out"});
                        // return res.status(500).json({success: false,message: constants.INTERNAL_SERVER_ERROR_MESSAGE})
                    } else if(result){
                        console.log("LINE 145");
                        return res.status(200).json({success: true,message: "Logged out"});
                    }
                })

        } else {
            res.status(200).json({ success: false, message: "Authentication failed" });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: constants.INTERNAL_SERVER_ERROR_MESSAGE, success: false });
    }

}
const controller = { login ,checkLogin , getUserDetails, updateUserDetails , changePassword, setPassword , getEmailForForgotPassword,logout };

module.exports = controller;