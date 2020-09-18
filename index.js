//  استيراد المكتبات المطلوبة | import the required libraries
//  تأكد من تنزيل الوحدات المطلوبة | make sure to download the required modules
//import express from "express";
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const setRoutes = require("./app/routes/route.js");

const start = async () => {
  try {
    //connect to the database
    await mongoose.connect("mongodb://localhost:27017/FullStackDB", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("connected to DB , create app");
    // create the app
    const app = express();
    // using body-parser to parse the body because express dont do that
    app.use(bodyParser.json()); // this step is very important otherwise postman send the body in a very weird way
    app.use(bodyParser.urlencoded({ extended: true }));

    //handlling every thing
    setRoutes(app);
    app.listen(1050);
  } catch (error) {
    // incase of an error
    console.log(error);
  }
};

//actually starting the app
start();

// لا تنسى تحديد وظيفة الخادم | don't forget to define the server function that listens to requests
