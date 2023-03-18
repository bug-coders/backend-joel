const express = require("express");
const Joi = require("joi");
const Usuario = require("../../models/Usuario");
const _ = require('lodash');
const bcrypt = require('bcrypt');

const router = express.Router();

router.post("/", async (req, res) => {

  
    const schema = Joi.object({
        name: Joi.string().min(3).required(),
        email: Joi.string().min(3).required().email(),
        password: Joi.string().min(3).required()
    });
    
  
  const result = schema.validate(req.body)
  if (result.error) { return res.status(400).send(result.error.details[0].message) }

  let usuario = await Usuario.findOne({ email: req.body.email })
  if (!usuario) return res.status(400).send('Email no disponible, instroducir Email valido!!!')

  const isValid = await bcrypt.compare(req.body.password, usuario.password)
  if (!isValid) return res.status(400).send('la contraseña debe coincidir!!')

  const token = usuario.generateAuthToken()

  res.header('usuario-Auth',token).send(JSON.stringify(_.pick(usuario, ['_id', 'name', 'email'])))
})



module.exports = router;
