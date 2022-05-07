//Author: Rahul Tulani
const bodyParser = require("body-parser");
const express = require("express");
let jwt = require("jsonwebtoken");
const loggedInUser = require("../utils/getLoggedInUser");

var db = require("./dbConnect");

//This is a GET request by which we are fetching all the saved addresses from the logged-in user profile and rendering them on
//the Place Order(Delivery Address selection) page.
const fetchSavedAddress = (req, res) => {
  let userId;

  try {
    if (req && req.headers && req.headers.authorization) {
      loggedInUser.getUser(req.headers.authorization, function (err, id) {
        userId = id;
      });
    }

    if (!userId) {
      return res.status(404).json({ message: "Cannot get user", success: false });
    }

    let sql = "select id, street, city, province, zip, country, shipping_ind, upper(title) as title from address " + "where user_id = " + userId;

    let query = db.query(sql, (err, results) => {
      if (err) throw err;
      res.send(JSON.stringify({ status: 200, error: null, response: results, success: true }));
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

const controller = { fetchSavedAddress };

module.exports = controller;
