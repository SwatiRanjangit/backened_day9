const express = require("express");
const app = express();
const { connectDB } = require("./config/db");

//middleware
app.use(express.json());
app.use(express.static("content"));
app.use(express.urlencoded({ extends: false }));

const PORT = 1338;

app.listen(PORT, () => {
  console.log("server is running");
  connectDB();
});
