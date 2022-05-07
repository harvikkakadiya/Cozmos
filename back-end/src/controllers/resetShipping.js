//Author: Rahul Tulani
const bodyParser = require("body-parser");
const express = require("express");
let jwt = require("jsonwebtoken");
const loggedInUser = require("../utils/getLoggedInUser");

var db = require("./dbConnect");

//For all the saved addresses in the user profile, this POST API sets the Shipping Indicator to N.
//This API is created to reset all the shipping indicators to N before the user makes a new selection or enters a new address for which we set the Shipping Indicator as Y. 
const resetShippingAddress = (req, res) => {

  try {
    if (req && req.headers && req.headers.authorization) {
      loggedInUser.getUser(req.headers.authorization, function (err, id) {
        userId = id;
      });
    }

    if (!userId) {
      return res.status(404).json({ message: "Cannot get user", success: false });
    }

    let sqlReset = "UPDATE address SET shipping_ind = 'N' where user_id = " + userId;
    
    let query = db.query(sqlReset, (err, results) => {
      if (err) throw err;
      res.send(JSON.stringify({ status: 200, error: null, response: results, success: true }));
      db.commit;
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

const controller = { resetShippingAddress };

module.exports = controller;
