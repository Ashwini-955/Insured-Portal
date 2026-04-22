const express = require("express");
const router = express.Router();
const { getPoliciesByEmail } = require("../controllers/policyController");

const policies = require("../data/policies.json");

router.get("/email/:email", getPoliciesByEmail);

router.get("/", (req, res) => {
  res.json(policies);
});

module.exports = router;