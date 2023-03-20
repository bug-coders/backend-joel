'use strict';

const multer = require('multer');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const storage = require('../../lib/multerConfig.js');
const fs = require('fs');

const Anuncio = mongoose.model('Anuncio');
const { buildAnuncioFilterFromReq } = require('../../lib/utils');

// Return the list of anuncio
router.get('/', (req, res, next) => {
  const start = parseInt(req.query.start) || 0;
  const limit = parseInt(req.query.limit) || 1000; // nuestro api devuelve max 1000 registros
  const sort = req.query.sort || '_id';
  const includeTotal = req.query.includeTotal === 'true';

  const filters = buildAnuncioFilterFromReq(req);

  // Ejemplo hecho con callback, aunque puede hacerse mejor con promesa y await
  Anuncio.list(filters, start, limit, sort, includeTotal, function (err, anuncios) {
    if (err) return next(err);
    res.json({ result: anuncios });
  });
});

// Return the list of available tags
router.get(
  '/tags',
  asyncHandler(async function (req, res) {
    const availableTags = [
      'Instrumentos de viento',
      'Instrumentos de percusión',
      'Instrumentos de cuerda',
      'Electrónica',
    ];
    res.json({ result: availableTags });
  })
);

router.get('/:id', async (req, res) => {
  const id = req.params.id;
  const anuncio = await Anuncio.findById(id);
  res.json(anuncio);
});

router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  const anuncio = await Anuncio.findOne({ _id: id });
  anuncio.photo[0] &&
    fs.rm(anuncio.photo[0].path, (err) => {
      if (err) {
        // File deletion failed
        console.error(err.message);
        return;
      }
      console.log('File deleted successfully');
    });

  await Anuncio.deleteOne({ _id: id });
  res.sendStatus(200);
});

// Create
router.post(
  '/',
  multer({ storage: storage }).fields([
    { name: 'name' },
    { name: 'sale' },
    { name: 'price' },
    { name: 'tags' },
    { name: 'photo' },
  ]),
  [
    // validaciones:
    body('name').isString().withMessage('nombre must be string'),
    body('sale').isBoolean().withMessage('must be boolean'),
    body('price').isNumeric().withMessage('must be numeric'),
  ],
  asyncHandler(async (req, res) => {
    validationResult(req).throw();
    const anuncioData = { ...req.body, ...req.files };
    const anuncio = new Anuncio(anuncioData);
    const anuncioGuardado = await anuncio.save();
    console.log(anuncioGuardado);
    res.json(anuncioGuardado);
  })
);

module.exports = router;
