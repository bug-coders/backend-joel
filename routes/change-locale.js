'use strict';

const express = require('express');
const router = express.Router();

router.get('/:locale', (req, res, next) => {
  const locale = req.params.locale;
  res.cookie('nodepop-locale', locale, {
    maxAge: 1000 * 60 * 60 * 24 * 30, // 1 mes
  });

  res.redirect(req.get('Referer'));
});

module.exports = router;
