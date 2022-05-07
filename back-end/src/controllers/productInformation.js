const express = require("express");
var db = require('./dbConnect');

const productInformation = (req,res) => {
    console.log("Product Catalogue Get Request");
    try {
        console.log(req.params.id);   
        db.query("select * from products where id = ?;",req.params.id, (err, result) => {
            if(err)
                throw err;
            res.send(JSON.stringify({"status": 200, "error": null, "response": result}));
        });
    } catch (error) {
        return res
        .status(500)
        .json({ message: "Internal Server Error", success: false });
    }
}

const controller = {productInformation};

module.exports = controller