const mongoose = require('mongoose');
const validator = require('validator');
const bycrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  isActive: {
    type: Boolean,
    default: true,
    select: false,
  },
  name: {
    type: String,
    requried: [true, 'Please provide us your name'],
    minLength: 10,
    maxLength: 40,
    unique: true,
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'admin', 'lead-guide'],
    default: 'user',
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
  passwordChangedAt: {
    type: Date,
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetExpires: {
    type: Date,
  },
});

userSchema.pre(/^find/, function (next) {
  this.find({ isActive: { $ne: false } });
  next();
});
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bycrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});
// This is only for when we create new doc we alsot modify password right? so this if statements explains that this.isNew
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 10000;
  next(); // saving to the db is slower than issuing the JWT
});

userSchema.methods.correctPassword = async function (
  candiatePassword,
  userPassword
) {
  return await bycrypt.compare(candiatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log(changedTimeStamp, JWTTimestamp);
    return JWTTimestamp < changedTimeStamp;
  }

  //Not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};
const User = mongoose.model('User', userSchema);

module.exports = User;
