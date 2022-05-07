//Author: Fenil Shah

const loggedInUser = require("../utils/getLoggedInUser");
const constants = require("../../constants/constants");
const db = require("./dbConnect");

//This method fetches the details of the items present in the cart of a particular user.
const fetchCartItems = (req, res) => {
  console.log("Inside fetchCartItems method");
  let userId;

  try {
    loggedInUser.getUser(req.headers.authorization, function (err, id) {
      userId = id;
    });

    console.log(`The User ID is ${userId}`);

    const user_id = userId;

    //I have referred the below query from:
    //https://www.delftstack.com/howto/mysql/mysql-select-from-multiple-tables/#use-join-to-select-from-multiple-tables-in-mysql
    //and
    // https://stackoverflow.com/questions/47837796/sql-calculate-total-price

    db.query(
      `SELECT DISTINCT c.product_id, p.thumbnail_path, p.name, p.brand, p.selling_price, c.quantity FROM cart c, products p WHERE c.product_id = p.id AND c.user_id = ? 
      UNION 
      SELECT 0 AS cart_id, '#' as thumbnail_path, 'Total' AS title, 'Brand' AS brand, SUM(p.selling_price*c.quantity) AS total_price, SUM(c.quantity) AS total_items FROM cart c, products p WHERE c.product_id = p.id AND c.user_id = ?;
      `,
      [user_id, user_id],
      (err, result) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: constants.INTERNAL_SERVER_ERROR_MESSAGE,
          });
        } else if (result.length > 0) {
          return res.status(200).json({ success: true, response: result });
        } else {
          return res.status(400).json({
            success: false,
            message: "Cart does not exist",
          });
        }
      }
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: constants.INTERNAL_SERVER_ERROR_MESSAGE,
    });
  }
};

const controller = { fetchCartItems };

module.exports = controller;
