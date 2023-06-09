const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const jimp = require("jimp");
const path = require("path");
const fs = require("fs").promises;
const { nanoid } = require("nanoid");

const { User } = require("../models/user");
const { ctrlWrapper } = require("../decorators");
const { HttpError, sendEmail } = require("../helpers");
const { SECRET_KEY, SERVER_URL } = process.env;

const avatarsDir = path.resolve("public", "avatars");
const verificationToken = nanoid();

const register = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (user) {
    throw HttpError(409, "Email in use");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email, { d: "retro" });
  const result = await User.create({
    ...req.body,
    password: hashedPassword,
    avatarURL,
    verificationToken,
  });

  const verifyMail = {
    to: email,
    subject: "Verify email",
    html: `<a target="_blanc" href="${SERVER_URL}/api/users/verify/${verificationToken}">Click to verify</a>`,
  };

  await sendEmail(verifyMail);

  res.status(201).json({
    user: {
      email: result.email,
      subscription: result.subscription,
    },
  });
};

const verify = async (req, res) => {
  const { verificationToken } = req.params;

  const user = await User.findOne({ verificationToken });

  if (!user) {
    throw HttpError(404, "User not found");
  }

  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationToken: null,
  });

  res.json({
    message: "Verification successful",
  });
};

const resendVerifyEmail = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw HttpError(400, "missing required field email");
  }

  if (user.verify) {
    throw HttpError(400, "Verification has already been passed");
  }

  const verifyMail = {
    to: email,
    subject: "Verify email",
    html: `<a target="_blanc" href="${SERVER_URL}/api/users/verify/${verificationToken}">Click to verify</a>`,
  };

  await sendEmail(verifyMail);

  res.json({
    message: "Verification email sent",
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user.verify) {
    throw HttpError(401, "Please verify your email address");
  }

  if (!user) {
    throw HttpError(401, "Email or password is wrong");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw HttpError(401, "Email or password is wrong");
  }

  const payload = {
    id: user._id,
  };

  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
  await User.findByIdAndUpdate(user._id, { token });

  res.json({
    token,
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
};

const logout = async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { token: "" });
  res.status(204).end();
};

const getCurrent = async (req, res) => {
  const { subscription, email } = req.user;
  res.json({
    email,
    subscription,
  });
};

const updateSubscription = async (req, res) => {
  const { _id: id } = req.user;
  const { subscription } = req.body;
  const result = await User.findByIdAndUpdate(
    id,
    { subscription },
    {
      new: true,
    }
  );

  res.json(result);
};

const updateAvatar = async (req, res) => {
  const { _id } = req.user;
  const { path: tempUpload, originalname } = req.file;

  const uniquePrefix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const newName = `${uniquePrefix}_${originalname}`;

  const resultUpload = path.join(avatarsDir, newName);
  const avatarURL = path.join("avatars", newName);

  try {
    const image = await jimp.read(tempUpload);
    image.resize(250, 250);
    await image.writeAsync(tempUpload);

    await fs.rename(tempUpload, resultUpload);
    await User.findByIdAndUpdate(_id, { avatarURL });
  } catch {
    await fs.unlink(tempUpload);
  }

  res.json({
    avatarURL,
  });
};

module.exports = {
  register: ctrlWrapper(register),
  verify: ctrlWrapper(verify),
  resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
  login: ctrlWrapper(login),
  logout: ctrlWrapper(logout),
  getCurrent: ctrlWrapper(getCurrent),
  updateSubscription: ctrlWrapper(updateSubscription),
  updateAvatar: ctrlWrapper(updateAvatar),
};
