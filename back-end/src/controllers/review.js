const bodyParser = require('body-parser');
const express = require("express");
const loggedInUser = require("../utils/getLoggedInUser");
var db = require('./dbConnect');

const addReview = (req, res) => {
    let userId;
    try {
        if (req && req.headers && req.headers.authorization) {
            loggedInUser.getUser(req.headers.authorization, function (err, id) {
                userId = id;
            });
        }
        console.log("req.body.product_id: ", req.body);
        if (req && req.body && req.body.product_id) {
            let data = { product_id: req.body.product_id, rating: req.body.rating, comments: req.body.comments }
            let sql = "INSERT INTO review (`user_id`,`product_id`,`rating`,`comments`) VALUES ('" + userId + "','" + req.body.product_id + "','" + req.body.rating + "','" + req.body.comments + "')";
            console.log(data);
            let query = db.query(sql, (err, results) => {
                console.log(err);
                if (err) throw err;
                console.log("results", results);
                res.status(200).json({ success: true, message: "Added Product to wishlist successfully" });
            });
        }
    }
    catch (error) {
        console.log("error", error);
        return res
            .status(500)
            .json({ message: "Internal Server Error", success: false });
    }
}

const getreview = (req, res) => {
    console.log("Get request of reviewd product product");

    let userId;

    try {
        if (req && req.headers && req.headers.authorization) {
            loggedInUser.getUser(req.headers.authorization, function (err, id) {
                userId = id;
            });
        }
        console.log(req.params.id);   
        db.query("select * from review where product_id = ?;",req.params.product_id, (err, result) => {
            if(err)
                throw err;
            res.send(JSON.stringify({"status": 200, "error": null, "response": result}));
        });

    }
    catch (error) {
        return res
            .status(500)
            .json({ message: "Internal Server Error", success: false });
    }
};

const controller = { addReview, getreview };

module.exports = controller;