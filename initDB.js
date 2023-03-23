'use strict';
require('dotenv').config();

const { askUser } = require('./lib/utils');
const { mongoose, connectMongoose, Anuncio, Usuario } = require('./models');

const ANUNCIOS_JSON = './anuncios.json';

main().catch((err) => console.error('Error!', err));

async function main() {
  // Si buscáis en la doc de mongoose (https://mongoosejs.com/docs/connections.html),
  // veréis que mongoose.connect devuelve una promesa que podemos exportar en connectMongoose
  // Espero a que se conecte la BD (para que los mensajes salgan en orden)
  await connectMongoose;

  const answer = await askUser(
    'Are you sure you want to empty DB and load initial data? (yes/no) '
  );
  if (answer.toLowerCase() !== 'yes') {
    console.log('DB init aborted! nothing has been done');
    return process.exit(0);
  }

  // Inicializar nuestros modelos
  const anunciosResult = await initModelo(Anuncio, ANUNCIOS_JSON);
  console.log(
    `\nAnuncios: Deleted ${anunciosResult.deletedCount}, loaded ${anunciosResult.loadedCount} from ${ANUNCIOS_JSON}`
  );

  await initUsuarios();

  // Cuando termino, cierro la conexión a la BD
  await mongoose.connection.close();
  console.log('\nDone.');
}

async function initModelo(modelo, fichero) {
  const { deletedCount } = await modelo.deleteMany();
  const loadedCount = await modelo.cargaJson(fichero);
  return { deletedCount, loadedCount };
}

async function initUsuarios() {
  // borrar todos los documentos de usuarios
  const deleted = await Usuario.deleteMany();
  console.log(`Eliminados ${deleted.deletedCount} usuarios.`);

  // crear usuarios iniciales
  const inserted = await Usuario.insertMany([
    {
      _id: '641bd0b7ad414dd557a8b95d',
      name: 'admin',
      email: 'user@example.com',
      password: await Usuario.hashPassword('12345'),
    },
  ]);
  console.log(`Creados ${inserted.length} Usuarios.`);
}
