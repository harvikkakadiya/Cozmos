// Author: Harsh Patel
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const constants = require("../../constants/constants");
let db = require('./dbConnect');

const saltRounds = 10;
const registerUser = (req,res) => {
    try {
        // check for inputs and apply validation
        if (req && req.body && req.body.first_name) {

            let first_name = req.body.first_name;
            let last_name = req.body.last_name;
            let email = req.body.email;
            let password = req.body.password;

            if (first_name.trim().length < 1 || last_name.trim().length < 1 || email.trim().length < 1 || password.length < 8) {
                return res.status(400).json({success: false, message: constants.BAD_REQUEST_MESSAGE});
            }
            first_name = first_name.trim();
            last_name = last_name.trim();
            email = email.trim();

            if (!(/^[a-zA-Z]+$/.test(first_name))) {

                return res.status(400).json({success: false, message: "First name not following format"});
            }
            if (!(/^[a-zA-Z]+$/.test(last_name))) {
                return res.status(400).json({success: false, message: "Last name not following format"});

            }
            if (!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
                return res.status(400).json({success: false, message: "Email not following format"});

            }
            if (!(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,26}$/.test(password))) {
                return res.status(400).json({success: false, message: "password not following format"});
            }

            bcrypt.hash(password, saltRounds, (err, hash) => {
                if (err) {
                    return res.status(500).json({success: false, message: constants.INTERNAL_SERVER_ERROR_MESSAGE});
                }

                // insert after encrypting the password
                db.query(
                    "INSERT INTO cozmos_user (first_name, last_name, email, password) VALUES (?,?,?,?)",
                    [first_name, last_name, email, hash],
                    (err, result) => {

                        if (err) {

                            return res.status(200).json({success: false, message: "Email already exists"});
                        }
                        if (result) {
                            return res.status(200).json({success: true, message: "User registered successfully"});
                        }
                    }
                );
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: constants.INTERNAL_SERVER_ERROR_MESSAGE, success: false });
    }
}

const controller = { registerUser  };

module.exports = controller;