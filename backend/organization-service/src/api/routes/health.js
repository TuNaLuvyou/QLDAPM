"use strict";

const { health } = require("../controllers/healthController");

const express = require("express");

const router = express.Router();

router.get("/", health);

module.exports = router;
