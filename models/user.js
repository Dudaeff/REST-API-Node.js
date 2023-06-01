const { Schema, model } = require("mongoose");
const Joi = require("joi");
const handleMongooseError = require("../helpers");

const userSchema = new Schema(
  {
    password: {
      type: String,
      required: [true, "Set password for user"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    subscription: {
      type: String,
      enum: ["starter", "pro", "business"],
      default: "starter",
    },
    avatarURL: String,
    token: String,
  },
  { versionKey: false, timestamps: true }
);

userSchema.set("save", handleMongooseError);

const authenticate = Joi.object({
  password: Joi.string().required().min(6),
  email: Joi.string().required().email(),
});

const updateSubscription = Joi.object({
  subscription: Joi.string().required().valid("starter", "pro", "business"),
});

const userSchemas = {
  authenticate,
  updateSubscription,
};

const User = model("user", userSchema);

module.exports = {
  User,
  userSchemas,
};
