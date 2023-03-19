const express = require('express');
const Joi = require('joi');
const mongoose = require('mongoose');
const Usuario = mongoose.model('Usuario');
const _ = require('lodash');

const router = express.Router();

router.post('/', async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().min(3).required().email(),
    password: Joi.string().min(3).required(),
  });
  const result = schema.validate(req.body);
  if (result.error) {
    return res.status(400).send(result.error.details[0].message);
  }

  const { name, email } = req.body;
  const password = await Usuario.hashPassword(req.body.password);
  const userData = { name, email, password };

  const alreadyRegistered = !!(await Usuario.findOne({ email: userData.email }));

  if (alreadyRegistered) {
    return res.status(400).send('Ya hay una cuenta con este email. Por favor introduce otro email');
  }

  const user = new Usuario(userData);
  const newUser = await user.save();
  const token = newUser.generateAuthToken();
  res
    .header('Auth', token)
    .send(JSON.stringify(_.pick(newUser, ['_id', 'name', 'email', 'password'])));
});

module.exports = router;
