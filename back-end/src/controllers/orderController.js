// Author: Harvik Kakadiya

const bodyParser = require("body-parser");
const express = require("express");
let jwt = require("jsonwebtoken");
const { BAD_REQUEST_MESSAGE } = require("../../constants/constants");
const loggedInUser = require("../utils/getLoggedInUser");
const nodemailer = require("nodemailer");

var db = require("./dbConnect");

const getOrders = (req, res) => {
    let userId;

    try {
        if (req && req.headers && req.headers.authorization) {
            loggedInUser.getUser(req.headers.authorization, function (err, id) {
                userId = id;
            });
        }

        if (req.query.status == 'past') {
            var filter = " `a`.completed_status=1";
        } else if (req.query.status == "canceelled") {
            var filter = " `a`.cancel_status=1";
        } else {
            var filter = " `a`.completed_status=0 and `a`.cancel_status=0";
        }

        let sql = "SELECT a.id as order_id, a.order_total_amount, b.* FROM cozmos.order as a inner join address as b on `a`.`address_id`=`b`.`id` where `a`.user_id="+userId + " and" + filter;

        let query = db.query(sql, (err, results) => {
            if (err) throw err;
            res.send({ status: 200, error: null, response: results });
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", success: false });
    }
};


const updateOrderStatus = async (req, res) => {
    let userId;

    try {
        if (req && req.headers && req.headers.authorization) {
            loggedInUser.getUser(req.headers.authorization, function (err, id) {
                userId = id;
            });
        }

        var order_id = req.body.order_id

        if (!order_id) {
            res.send({ status: 400, error: BAD_REQUEST_MESSAGE, response: {} });
            return;
        }

        if (req.body.status == "completed") {
            var status = "completed_status=1"
        } else if (req.body.status == "cancelled") {
            var status = "cancel_status=1"
        } else {
            res.send({ status: 400, error: BAD_REQUEST_MESSAGE, response: {} });
            return
        }

        db.query(
            "SELECT * FROM cozmos_user WHERE id = ?;",
            userId,
            async (err, result) => {

                let transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: '',
                        pass: ''
                    }
                });

                // Send mail
                let info = await transporter.sendMail({
                    from: 'Cozmos Admin', // sender address
                    to: result[0].email, // list of receivers
                    subject: "Status update!", // Subject line
                    html: `<html><body> Your order - ${order_id} is ${req.body.status}</body></html>`
                });
            }
        )

        let sql = "update `order` set " + status + " where id=" + order_id + " and user_id=" + userId;

        let query = db.query(sql, (err, results) => {
            if (err) throw err;
            res.send({ status: 200, error: null, response: results });
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", success: false });
    }

}

const getOrderDetails = (req, res) => {
    let userId;

    try {
        if (req && req.headers && req.headers.authorization) {
            loggedInUser.getUser(req.headers.authorization, function (err, id) {
                userId = id;
            });
        }

        var order_id = req.query.order_id
        console.log(req.query)

        if (!order_id) {
            console.log("bad")
            res.send({ status: 400, error: BAD_REQUEST_MESSAGE, response: {} });
            return;
        }

        let sql = "SELECT * from order_items inner join " +
            "`order` on order_items.order_id=order.id inner join " +
            " `products` on order_items.product_id=products.id " +
            "where order.id=" + order_id + " and order.user_id=" + userId;

        let query = db.query(sql, (err, results) => {
            if (err) throw err;
            
            let BillingInfo = "SELECT * FROM order_billing_info where order_id=" + order_id;

            db.query(BillingInfo, (e, BillingInfoResults) => {
                res.send({ status: 200, error: null, response: results, billingInfo: BillingInfoResults });
            })
        });


    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", success: false });
    }

}

const controller = { getOrders, updateOrderStatus, getOrderDetails };

module.exports = controller;
