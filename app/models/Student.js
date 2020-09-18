// في هذا الملف ، قم بإعداد وحدة المستخدم (الطالب) الخاصة بك | in this file, set up your user module

// 1. قم باستيراد مكتبة moongoose | import the mongoose library
const mongoose = require("mongoose");
const { Model } = require("mongoose");
const shortid = require("shortid");
const hashPassword = require("./helpers");

const Schema = mongoose.Schema;
const model = mongoose.model;
// 2. قم بتحديد مخطط الطالب | start defining your user schema

const studentSchema = new Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  city: String,
  birthdate: String,
  salt: String,
});

studentSchema.pre("save", function (next) {
  console.log(this.salt);
  if (!this.salt) {
    this.salt = shortid.generate();
  }

  if (this.salt) {
    this.password = hashPassword(this.password, this.salt);
  }

  next();
});

// 3. إنشاء نموذج الطالب | create  the user model
const studentModel = new model("student", studentSchema);
// 4. تصدير الوحدة | export the module
module.exports = studentModel;
