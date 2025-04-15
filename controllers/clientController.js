
const Client = require('../models/Client');
const { validationResult } = require('express-validator');

exports.createClient = async (req, res) => {
  try {
    const client = new Client(req.body);
    await client.save();
    res.json(client);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.getAllClients = async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    res.json(client);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.updateClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(client);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.deleteClient = async (req, res) => {
  try {
    await Client.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Client removed' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};
