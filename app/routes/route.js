// في هذا الملف ، قم بإعداد طرق التطبيق الخاصة بك | in this file, set up your application routes

// 1. استيراد وحدةالمدرس | import the teacher module

// 2. استيراد وحدة الطالب | import the student module

// 3. تسجيل مدرس جديد و تخزين بياناته | new teacher sign up

// 4. تسجيل دخول مدرس و ارجاع التوكن | teacher login and response with jwt token

// 5. إعداد طرق مختلفة | setup the different routes (get, post, put, delete)
const mongoose = require("mongoose");
const studentModel = require("../models/Student");
const Joi = require("@hapi/joi");
const hashPassword = require("../models/helpers");
const jwt = require("jsonwebtoken");
const teacherModel = require("../models/Teacher");

const setRoutes = (app) => {
  //testing for the sake of testing
  app.get("/hello", (req, res) => {
    res.send("hello");
  });

  app.post("/blog", async (req, res) => {
    console.log(req);
    const { title, body } = req.body;
    const Schema = mongoose.Schema;
    const model = mongoose.model;

    try {
      const blogSchema = new Schema({
        title: String,
        body: String,
      });
      const blogModel = new model("blog", blogSchema);

      const newBlog = new blogModel({
        title,
        body,
      });

      res.send(newBlog);
      newBlog.save();
    } catch (error) {
      res.statusCode = 400;
      res.send(error.message);
    }
  });
  // here I end my testing so go a head and enjoy 😎

  // ----- TEACHER ------
  app.post("/teacher/register", async (req, res) => {
    //destructuring
    const { name, password, email, city, birthdate } = req.body;

    // using Joi to validate the teacher input
    const teacherBodySchema = Joi.object({
      email: Joi.string().email().required(),
      name: Joi.string().required(),
      password: Joi.string().min(6).required(),
      city: Joi.string().required(),
      birthdate: Joi.string().required(),
    });

    // validation
    const validationResult = teacherBodySchema.validate(req.body);

    //incase of in error
    if (validationResult.error) {
      res.statusCode = 400;
      res.send(validationResult.error.details[0].message);
      console.log(req.body);
      return;
    }
    try {
      //registering the new teacher
      const newTeacher = new teacherModel({
        name,
        email,
        password,
        city,
        birthdate,
      });

      //final step => seve and send the new teacher
      newTeacher.save();
      res.send(newTeacher);
    } catch (error) {
      // incase of an error
      res.statusCode = 400;
      res.send(error.message);
    }
  });

  app.post("/teacher/login", async (req, res) => {
    //destructuring
    const { email, password } = req.body;

    //find the teacher
    const teacher = await teacherModel.findOne({ email: email });

    //if there is no teacher
    if (!teacher) {
      res.statusCode = 401;
      res.send("user does not exist ");
    } else {
      if (teacher.password === hashPassword(password, teacher.salt)) {
        const token = jwt.sign({ sub: teacher._id }, teacher.salt, {
          expiresIn: 30,
        });
        res.send(token);
        console.log(teacher);
      } else {
        res.statusCode = 401;
        res.send("the password that you hane entered is wrong");
      }
    }
  });

  // ----- STUDENT ------
  app.post("/student/register", async (req, res) => {
    //first make sure they have permission : token
    try {
      const token = req.headers.authorization;

      if (!token) {
        res.statusCode = 401;
        res.send("you have no permission");
        return;
      }

      const decodedToken = jwt.decode(token);

      const user = await teacherModel.findById(decodedToken.sub);

      if (!user) {
        res.statusCode = 401;
        res.send("you have no permission");
        return;
      }
    } catch (error) {
      res.statusCode = 401;
      res.send(error.message);
    }

    // destructuring
    const { name, password, email, city, birthdate } = req.body;

    // using Joi to validate the student input
    const studentBodySchema = Joi.object({
      email: Joi.string().email().required(),
      name: Joi.string().required(),
      password: Joi.string().min(6).required(),
      city: Joi.string().required(),
      birthdate: Joi.string().required(),
    });
    // validation
    const validetionResult = studentBodySchema.validate(req.body);

    // incase of an error
    if (validetionResult.error) {
      res.statusCode = 400;
      res.send(validetionResult.error.details[0].message);
      console.log(req.body);
      return;
    }
    try {
      // create the new student
      const newStudent = new studentModel({
        name,
        email,
        password,
        city,
        birthdate,
      });

      // final step => save and send the new student
      newStudent.save();
      res.send(newStudent);
    } catch (error) {
      res.statusCode = 400;
      res.send(error.message);
    }
  });

  app.post("/student/login", async (req, res) => {
    // destructuring
    const { email, password } = req.body;
    console.log(email);
    // find the student
    const student = await studentModel.findOne({ email: email });
    console.log(student);

    if (!student) {
      res.statusCode = 401;
      res.send("user does not exist");
    } else {
      //check the password
      if (student.password === hashPassword(password, student.salt)) {
        //make the token
        const token = jwt.sign({ sub: student._id }, student.salt, {
          expiresIn: 30,
        });
        //send the token
        res.send(token);
        console.log(student);
      } else {
        res.statusCode = 401;
        res.send("the password that you hane entered is wrong");
      }
    }
  });

  app.get("/students", async (req, res) => {
    // make sure they have permission : token
    try {
      const token = req.headers.authorization;

      //no token
      if (!token) {
        res.statusCode = 401;
        res.send("you have no permission");
        console.log("no token");
        return;
      }

      const decodedToken = jwt.decode(token);

      console.log(decodedToken);

      const user = await teacherModel.findById(decodedToken.sub);

      // wrong token
      if (!user) {
        res.statusCode = 401;
        res.send("you have no permission");
        console.log("no user");
        return;
      }

      jwt.verify(token, user.salt);
    } catch (error) {
      res.statusCode = 401;
      res.send(error.message);
    }

    //send all of the students
    const students = await studentModel.find({});

    res.send(students);
  });

  app.get("/students/:id", async (req, res) => {
    console.log(req.params.id);

    //check anf validate the params
    const paramsSchema = Joi.object({
      id: Joi.string().required(),
    });

    const validetionResult = paramsSchema.validate(req.params);
    console.log(validetionResult);
    if (validetionResult.error) {
      res.statusCode = 400;
      res.send(validetionResult.error.details[0].message);

      return;
    }

    const conditions = {
      _id: req.params.id,
    };

    //find the student
    const student = await studentModel.findById(conditions);

    if (!student) {
      res.statusCode = 404;
      res.send("not id is not viled");
    } else {
      //
      const { birthdate, name, city } = req.body;
      console.log(birthdate);
      console.log(req.body);
      if (birthdate) {
        student.birthdate = birthdate;
        student.save();
      }
      if (name) {
        student.name = name;
        student.save();
      }
      if (city) {
        student.city = city;
        student.save();
      }
      res.send(student);
    }
  });
};

module.exports = setRoutes;

// 3. تصدير الوحدة | export the module
