const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: 'Lista de clientes', data: [] });
});

router.get('/:id', (req, res) => {
    res.json({ message: `Cliente ${req.params.id}`, data: {} });
});

router.post('/', (req, res) => {
    res.status(201).json({ message: 'Cliente criado com sucesso', data: req.body });
});

router.put('/:id', (req, res) => {
    res.json({ message: `Cliente ${req.params.id} atualizado`, data: req.body });
});

router.delete('/:id', (req, res) => {
    res.json({ message: `Cliente ${req.params.id} deletado` });
});

module.exports = router;
