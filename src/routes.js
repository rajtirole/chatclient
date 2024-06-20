// routes.js
const express = require('express');
const router = express.Router();

module.exports = (intercomClient) => {
  router.post('/submit-request', (req, res) => {
    const { category, comments } = req.body;
    intercomClient.messages.create({
      from: { type: 'user', id: req.user.id },
      body: comments,
      message_type: 'inbox'
    }).then(() => {
      res.send({ success: true });
    }).catch(err => {
      res.status(500).send({ error: err.message });
    });
  });

  router.get('/requests/:category', (req, res) => {
    const category = req.params.category;
    intercomClient.messages.list({}).then(messages => {
      const filteredMessages = messages.body.filter(message => message.custom_attributes.category === category);
      res.send(filteredMessages);
    }).catch(err => {
      res.status(500).send({ error: err.message });
    });
  });

  return router;
};
