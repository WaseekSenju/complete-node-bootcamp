const nodemailer = require('nodemailer');
const AppError = require('./appError');

const sendEmail = async (options) => {
  //1) Create a transpoter

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  //2) Define the email optins

  //3) Actually send the email
  try {
    const mailOptions = {
      from: 'Waseek Ahmed <waseeq@gmail.com>',
      to: options.email,
      subject: options.subject,
      text: options.text,
    };

    await transporter.sendMail(mailOptions);
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({
      validateBeforeSave: false,
    });

    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }
};

module.exports = sendEmail;
