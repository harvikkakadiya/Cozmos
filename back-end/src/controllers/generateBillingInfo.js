//Author: Rahul Tulani
const bodyParser = require("body-parser");
const express = require("express");
let jwt = require("jsonwebtoken");
const loggedInUser = require("../utils/getLoggedInUser");
const nodemailer = require("nodemailer");

var db = require("./dbConnect");

//This API stores the Billing information corresponding the order placed by the user. It takes the order id generated from the
//generateOrder.js API and inserts the billing information entered by the user to the order_billing_info table.

const generateBillingInfo = (req, res) => {
  try {
    if (req && req.headers && req.headers.authorization) {
      loggedInUser.getUser(req.headers.authorization, function (err, id) {
        userId = id;
      });
    }
    console.log("User ID: ", userId);
    if (!userId) {
      return res
        .status(404)
        .json({ message: "Cannot get user", success: false });
    }

    let data = {
      order_id: req.body.orderId,
      name: req.body.name,
      email: req.body.email,
      address: req.body.address,
      country: req.body.country,
      city: req.body.city,
      zip: req.body.zip,
      payment_type: req.body.paymentType,
      user_id: userId,
    };
    let sql = "INSERT INTO order_billing_info SET ?";

    let query = db.query(sql, data, async (err, results) => {
      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "",
          pass: "",
        },
      });

      //Sending mail of Order Placed Successfully
      let info = await transporter.sendMail({
        from: "Cozmos Admin", // sender address
        to: data.email, // email address of receiver
        subject: "Order Placed Successfully!", // Subject line
        html: `<html><body> Your order - ${data.order_id} is placed successfully.</body></html>`,
      });
      console.log("Message sent: %s", info.messageId);

      if (err) throw err;
      res.send(
        JSON.stringify({
          status: 200,
          error: null,
          response: results,
          success: true,
        })
      );
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", success: false });
  }
};

const controller = { generateBillingInfo };

module.exports = controller;
