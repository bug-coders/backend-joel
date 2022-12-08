'use strict';

const mongoose = require('mongoose');
const fsPromises = require('fs').promises;

const usuarioSchema = mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
});

usuarioSchema.statics.cargaJson = async function (fichero) {
  const data = await fsPromises.readFile(fichero, { encoding: 'utf8' });

  // Ejemplo de usar una función que necesita callback con async/await
  // const data = await new Promise((resolve, reject) => {
  //   // Encodings: https://nodejs.org/api/buffer.html
  //   fs.readFile(fichero, { encoding: 'utf8' }, (err, data) => {
  //     return err ? reject(err) : resolve(data);
  //   });
  // });

  if (!data) {
    throw new Error(fichero + ' está vacío!');
  }

  const usuarios = JSON.parse(data).usuarios;
  const numUsuarios = usuarios.length;

  for (var i = 0; i < usuarios.length; i++) {
    await new Usuario(usuarios[i]).save();
  }

  return numUsuarios;
};

const Usuario = mongoose.model('Usuario', usuarioSchema);

module.exports = Usuario;
