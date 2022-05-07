// This is a middleware which will be used in all the routes that requires User Authentication.
let jwt = require("jsonwebtoken");
const mysql = require("mysql");
let db = require("../controllers/dbConnect");
let constants = require("../../constants/constants");

function getUser(token, callback) {
  try {
    jwt.verify(token, process.env.JWT_SECRET_TOKEN, function (err, decoded) {
      if (err) {
        //res.send({ message: "Authentication failed" });
      } else {
        if (decoded && decoded.id) {
          console.log("fetching id");
          console.log(decoded.id);
          callback(null, decoded.id);
        }
      }
    });
  } catch (error) {}
}

const controller = { getUser };

module.exports = controller;
