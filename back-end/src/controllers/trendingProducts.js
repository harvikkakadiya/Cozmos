//Author: Rahul Tulani
const bodyParser = require("body-parser");
const express = require("express");
let jwt = require("jsonwebtoken");
const loggedInUser = require("../utils/getLoggedInUser");

var db = require("./dbConnect");

const fetchTrendingProducts = (req, res) => {
  let userId;

  try {
    let sql = " select product_id, p.name, count(1) product_fn from ( " +
        " select product_id, ifnull(quantity, 0) quantity from cozmos.order_items) a, products p " +
        " where p.id = a.product_id group by product_id, p.name order by product_fn desc ";

    let query = db.query(sql, (err, results) => {
      if (err) throw err;
      res.send(JSON.stringify({ status: 200, error: null, response: results, success: true }));
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

const controller = { fetchTrendingProducts };

module.exports = controller;
