const express = require("express");
var db = require('./dbConnect');

const productCatalogue = (req,res) => {
    console.log("Product Catalogue Get Request");
    try {
        let statement = "select * from products"
        let queryResult = db.query(statement, (err, result) => {
            if(err)
                throw err;
                
            res.send(JSON.stringify({"status": 200, "error": null, "response": result}));
            console.log(result)
        });
    } catch (error) {
        return res
        .status(500)
        .json({ message: "Internal Server Error", success: false });
    }
}

const controller = {productCatalogue};

module.exports = controller