// في هذا الملف ، قم بإعداد وحدة المستخدم (المدرس) الخاصة بك | in this file, set up your user module

// 1. قم باستيراد مكتبة moongoose | import the mongoose library

// 2. قم بتحديد مخطط المدرس | start defining your user schema
const mongoose = require("mongoose");
const shortid = require("shortid");
const hashPassword = require("./helpers");

const Schema = mongoose.Schema;
const model = mongoose.model;

// 3. إنشاء نموذج المدرس | create  the user model

const teacherSchema = new Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  city: String,
  birthdate: String,
  salt: String,
});

teacherSchema.pre("save", function (next) {
  //this function will be called before saving

  // if the salt does not exist
  if (!this.salt) {
    this.salt = shortid.generate();
  }

  // if it does
  if (this.salt) {
    this.password = hashPassword(this.password, this.salt);
  }

  next();
});
// تخزين كلمة السر بعد عمل الهاش
const teacherModel = new model("teacher", teacherSchema);
// 4. تصدير الوحدة | export the module
module.exports = teacherModel;
