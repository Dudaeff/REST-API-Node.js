const { Schema, model } = require("mongoose");
const Joi = require("joi");
const handleMongooseError = require("../helpers");

const contactSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Set name for contact"],
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    favorite: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { versionKey: false, timestamps: true }
);

contactSchema.set("save", handleMongooseError);

const add = Joi.object({
  name: Joi.string().required().error(new Error("missing required name field")),
  email: Joi.string()
    .required()
    .email()
    .error(new Error("missing required name field")),
  phone: Joi.string()
    .required()
    .error(new Error("missing required name field")),
  favorite: Joi.boolean(),
});

const update = Joi.object({
  name: Joi.string(),
  email: Joi.string().email(),
  phone: Joi.string(),
  favorite: Joi.boolean(),
}).min(1);

const updateFavorite = Joi.object({
  favorite: Joi.boolean().required(),
});

const contactSchemas = {
  add,
  update,
  updateFavorite,
};

const Contact = model("contact", contactSchema);

module.exports = {
  Contact,
  contactSchemas,
};
