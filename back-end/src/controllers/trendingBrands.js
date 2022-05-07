//Author: Rahul Tulani
const bodyParser = require("body-parser");
const express = require("express");
let jwt = require("jsonwebtoken");
const loggedInUser = require("../utils/getLoggedInUser");

var db = require("./dbConnect");

const fetchTrendingBrands = (req, res) => {
  let userId;

  try {
    let sql =
      " select p.brand, count(1) brand_fn from ( " +
      " select product_id, ifnull(quantity, 0) quantity from cozmos.order_items) a, products p " +
      " where p.id = a.product_id group by p.brand order by brand_fn desc ";

    let query = db.query(sql, (err, results) => {
      if (err) throw err;
      res.send(JSON.stringify({ status: 200, error: null, response: results, success: true }));
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

const controller = { fetchTrendingBrands };

module.exports = controller;
