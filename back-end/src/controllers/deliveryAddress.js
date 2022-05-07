//Author: Rahul Tulani
const bodyParser = require("body-parser");
const express = require("express");
let jwt = require("jsonwebtoken");
const loggedInUser = require("../utils/getLoggedInUser");

var db = require("./dbConnect");
//This API handles the functionality to store the delivery address entered by the loggedin user to the user database.
//Also, sets the shipping indicator as 'Y' for the address entered.
const storedeliveryAddress = (req, res) => {
  
  try {
    if (req && req.headers && req.headers.authorization) {
      loggedInUser.getUser(req.headers.authorization, function (err, id) {
        userId = id;
      });
    }
    console.log(userId);
    if (!userId) {
      return res.status(404).json({ message: "Cannot get user", success: false });
    }

    let data = {
      street: req.body.street,
      city: req.body.city,
      province: req.body.province,
      zip: req.body.zip,
      country: req.body.country,
      shipping_ind: req.body.shipping_ind,
      title: req.body.title,
      user_id: userId,
    };
    let sql = "INSERT INTO address SET ?";
    console.log(data);
    let query = db.query(sql, data, (err, results) => {
      if (err) throw err;
      res.send(JSON.stringify({ status: 200, error: null, response: results, success: true }));
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

const controller = { storedeliveryAddress };

module.exports = controller;
