const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const knex = require('../../data/dbConfig');

router.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send('username and password required');
  }

  knex('users')
    .where({ username })
    .first()
    .then((user) => {
      if (user) {
        return res.status(400).send('username taken');
      }

      const hashedPassword = bcrypt.hashSync(password, 8);

      return knex('users')
        .insert({ username, password: hashedPassword })
        .returning(['id', 'username', 'password'])
        .then(([newUser]) => {
          res.status(201).json(newUser);
        });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send('Internal server error');
    });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send('username and password required');
  }

  knex('users')
    .where({ username })
    .first()
    .then((user) => {
      if (!user) {
        return res.status(401).send('invalid credentials');
      }

      const isPasswordValid = bcrypt.compareSync(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).send('invalid credentials');
      }

      const token = jwt.sign({ id: user.id }, 'secret_key');

      res.json({
        message: `welcome, ${user.username}`,
        token: token,
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send('Internal server error');
    });
});

module.exports = router;
