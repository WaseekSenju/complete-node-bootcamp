const mongoose = require('mongoose');
const validator = require('validator');
const bycrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    requried: [true, 'Please provide us your name'],
    minLength: 10,
    maxLength: 40,
    unique: true,
  },
  photo: String,
  role:{
    type:String,
    enum :['user','guide','admin','lead-guide'],
    default:'user'
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: true,
    minLength: 8,
    select: false,
  },
  confirmPassword: {
    type: String,
    required: true,
    validate: {
      //This only works CREATE on SAVE!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Password are not the same',
    },
  },
  passwordChangedAt : {
    type:Date,
  },
});
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bycrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  candiatePassword,
  userPassword
) {
  return await bycrypt.compare(candiatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter =  function (
 JWTTimestamp
) {
  if(this.passwordChangedAt){
    const changedTimeStamp = parseInt(this.passwordChangedAt.getTime()/1000,10);
    console.log(changedTimeStamp,JWTTimestamp);
    return JWTTimestamp < changedTimeStamp;
  }

  //Not changed
  return false;
};
const User = mongoose.model('User', userSchema);

module.exports = User;
