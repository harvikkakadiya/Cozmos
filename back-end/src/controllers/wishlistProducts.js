// AUTHOR: MEET PATEL

const bodyParser = require('body-parser');
const express = require("express");
const loggedInUser = require("../utils/getLoggedInUser");


var db = require('./dbConnect');

const showWishlistedProduct = (req, res) => {
    console.log("Get request wishlisted product");

    let userId;

    try{
        if (req && req.headers && req.headers.authorization) {
            loggedInUser.getUser(req.headers.authorization, function (err, id) {
              userId = id;
            });
        }
        let sql = "select * from products where id in (select product_id from wishlist where user_id= " +userId +");";
        let query = db.query(sql,(err, results) => {
            if(err) throw err;
            return res.status(200).json({success: true, "message": "data Retrieved Successfully", "response": results});
        });
         
    }
    catch(error){
        return res
        .status(500)
        .json({message: "Internal Server Error", success: false });
    }
};

const deleteWishlist = (req, res, next) => {
    console.log("Delete Wishlist called");
    let userId;
    try{
        if (req && req.headers && req.headers.authorization) {
            loggedInUser.getUser(req.headers.authorization, function (err, id) {
              userId = id;
            });
          }
        console.log("Line 41");
        let deleteSql = "DELETE FROM wishlist WHERE product_id ="+ req.body.product_id;
        let query1 = db.query(deleteSql,(err, results) => {
            if(err) throw err;
            console.log("err:",err);
            console.log("results:",results);
            // res.send(JSON.stringify({"status":200, "error":null, "response": results}));
            return next();
        });
        // let sql = "select * from products where id in (select product_id from wishlist where user_id= " +userId +");";
        // let query2 = db.query(sql,(err, results) => {
        //     if(err) throw err;
        //     console.log("err:",err);
        //     console.log("results:",results)
        //     return res.status(200).json({success: true, "message": "Product deleted from wishlist successfully", "response": results});
        // });
    }
    catch(error){
        console.log("error wq3efr : ",error);
        return res
        .status(500)
        .json({message: "Internal Server Error", success: false });
    }
};

const addTocartWishlistRemove = (req,res) => {
    console.log("Add to Cart Wishlist Called");
    let userId;
    try{
        if (req && req.headers && req.headers.authorization) {
            loggedInUser.getUser(req.headers.authorization, function (err, id) {
              userId = id;
            });
        }
        let addtocartSql = "INSERT INTO cart (`user_id`,`product_id`,`quantity`) VALUES ('" + userId + "','" + req.body.product_id + "','1');";
        let query1 = db.query(addtocartSql,(err, results) => {
            if(err) throw err;
            console.log("err:",err);
            console.log("results:",results)
        });
        let deleteSql = "DELETE FROM wishlist WHERE product_id ="+ req.body.product_id;
        let query2 = db.query(deleteSql,(err, results) => {
            if(err) throw err;
            console.log("err:",err);
            console.log("results:",results);
        });
        let getsql = "select * from products where id in (select product_id from wishlist where user_id= " +userId +");";
        let querye = db.query(getsql,(err, results) => {
            if(err) throw err;
            console.log("err:",err);
            console.log("results:",results)
            return res.status(200).json({success: true, "message": "Product added and removed from database successfully Product deleted from wishlist successfully", "response": results});
        });

    }
    catch(error){
        console.log("error wq3efr : ",error);
        return res
        .status(500)
        .json({message: "Internal Server Error", success: false });
    }

}

const controller = { showWishlistedProduct, deleteWishlist, addTocartWishlistRemove };

module.exports = controller;