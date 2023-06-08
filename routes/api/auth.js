const express = require("express");

const { authController } = require("../../controllers");

const { authenticate, upload } = require("../../middlewares");

const { validateBody } = require("../../helpers");

const { userSchemas } = require("../../models/user");

const router = express.Router();

router.post(
  "/register",
  validateBody(userSchemas.authenticate),
  authController.register
);

router.post(
  "/login",
  validateBody(userSchemas.authenticate),
  authController.login
);

router.post("/logout", authenticate, authController.logout);

router.get("/current", authenticate, authController.getCurrent);

router.patch(
  "",
  authenticate,
  validateBody(userSchemas.updateSubscription),
  authController.updateSubscription
);

router.patch(
  "/avatars",
  authenticate,
  upload.single("avatar"),
  authController.updateAvatar
);

module.exports = router;
