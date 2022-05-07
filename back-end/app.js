require("dotenv").config()
const express = require("express");
const bodyparser = require("body-parser");
const router = require("./src/routes/routes.js");
var cors = require('cors');
const cookieParser = require("cookie-parser");
const session = require("express-session");



const app = express();
app.use(cors());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));


app.use(cookieParser());
app.use(bodyparser.urlencoded({ extended: true }));

app.use(
  session({
    key: "userId",
    secret: "subscribe",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 60 * 60 * 24,
    },
  })
);


const port = process.env.PORT || 8080;

app.use("/", router);

app.listen(port, () => {
  console.log(`Application is listening on port ${port}`);
});
