//Author: Rahul Tulani
const bodyParser = require("body-parser");
const express = require("express");

var db = require("./dbConnect");
//a user can have multiple addresses saved in their profile. This API sets the shipping indicator of the previously selected address 
//or new address entered as 'Y'. Eventually, a user will have only address which will be marked as shipping adddress ==> Shipping Indicator = Y
//The Shipping indicator is needed to find the shipping address and assign it in the order generation.
const setShippingAddress = (req, res) => {
  try {
    let data = { id: req.body.id };
    console.log(data.id);
    let sql = "UPDATE address SET shipping_ind = 'Y' where id = " + data.id;

    let query = db.query(sql, (err, results) => {
      if (err) throw err;
      res.send(JSON.stringify({ status: 200, error: null, response: results, success: true }));
      db.commit;
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

const controller = { setShippingAddress };

module.exports = controller;
