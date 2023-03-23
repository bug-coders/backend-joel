'use strict';

const mongoose = require('mongoose');
const fsPromises = require('fs').promises;
const configAnuncios = require('../local_config').anuncios;
const path = require('path');

const anuncioSchema = mongoose.Schema({
  name: { type: String, index: true },
  sale: { type: Boolean, index: true },
  price: { type: Number, index: true },
  photo: Array,
  tags: { type: [String], index: true },
  creator: {},
});

/**
 * lista de tags permitidos
 */
anuncioSchema.statics.allowedTags = function () {
  return [
    'Instrumentos de teclado',
    'Instrumentos de viento',
    'Instrumentos de percusión',
    'Instrumentos de cuerda',
    'Instrumentos electrónicos',
    'Sonido y microfonía',
  ];
};

/**
 * carga un json de anuncios
 */
anuncioSchema.statics.cargaJson = async function (fichero) {
  const data = await fsPromises.readFile(fichero, { encoding: 'utf8' });

  // Ejemplo de usar una función que necesita callback con async/await
  // const data = await new Promise((resolve, reject) => {
  //   // Encodings: https://nodejs.org/api/buffer.html
  //   fs.readFile(fichero, { encoding: 'utf8' }, (err, data) => {
  //     return err ? reject(err) : resolve(data);
  //   });
  // });

  if (!data) {
    throw new Error(fichero + ' está vacio!');
  }

  const anuncios = JSON.parse(data).anuncios;
  const numAnuncios = anuncios.length;

  for (var i = 0; i < anuncios.length; i++) {
    await new Anuncio(anuncios[i]).save();
  }

  return numAnuncios;
};

anuncioSchema.statics.list = async function (
  filters,
  startRow,
  numRows,
  sortField,
  includeTotal,
  cb
) {
  const query = Anuncio.find(filters);
  query.sort(sortField);
  query.skip(startRow);
  query.limit(numRows);
  //query.select('nombre venta');

  const result = {};

  if (includeTotal) {
    result.total = await Anuncio.countDocuments();
  }
  result.rows = await query.exec();

  // poner ruta base a imagenes
  const ruta = configAnuncios.imagesURLBasePath;
  result.rows.forEach((r) => (r.foto = r.foto ? path.join(ruta, r.foto) : null));

  if (cb) return cb(null, result); // si me dan callback devuelvo los resultados por ahí
  return result; // si no, los devuelvo por la promesa del async (async está en la primera linea de esta función)
};

var Anuncio = mongoose.model('Anuncio', anuncioSchema);

module.exports = Anuncio;
