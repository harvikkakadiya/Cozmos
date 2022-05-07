var db = require("./dbConnect");

const testGet = (req, res) => {
  db.query("SELECT * FROM cozmos_user", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
  });

  console.log("Testing the get request");
  try {
    console.log("Inside try block");
    return res.status(200).json({ message: "Test Successful", success: true });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

const controller = { testGet };

module.exports = controller;
