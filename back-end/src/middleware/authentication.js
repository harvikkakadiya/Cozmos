// This is a middleware which will be used in all the routes that requires User Authentication.
// Author: Harsh Patel
let jwt = require("jsonwebtoken");
const mysql = require("mysql");
let db = require("../controllers/dbConnect");
let constants = require("../../constants/constants");

let authenticator = {
  authentication(req, res, next) {
    // check for token exist or not if not return authentication failed
    if (req && req.headers && req.headers.authorization) {
      jwt.verify(req.headers.authorization, process.env.JWT_SECRET_TOKEN, function (err, decoded) {
        console.log(decoded);
        if (err) {
          console.log("error 1: ", err);
          res.status(200).json({ success: false, message: "Authentication failed" });
        } else {
          if (decoded && decoded.id) {
            db.query("SELECT * FROM cozmos_user WHERE id = ?;", decoded.id, (err, result) => {
              if (err) {
                console.log("error 2: ", err);
                res.status(200).json({
                  success: false,
                  message: "Authentication failed",
                });
              } else if (result.length > 0) {
                // match with database field
                if (result[0].jwt_token === req.headers.authorization) {
                  return next();
                } else {
                  console.log("error 3: ");
                  res.status(200).json({
                    success: false,
                    message: "Authentication failed",
                  });
                }
              }
            });
          } else {
            console.log("error 4: ");
            res.status(200).json({ success: false, message: "Authentication failed" });
          }
        }
      });
    } else {
      console.log("error 5: ");
      res.status(200).json({ success: false, message: "Authentication failed" });
    }
  },
};

module.exports = authenticator;
