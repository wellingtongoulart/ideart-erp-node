const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: 'Lista de profissionais', data: [] });
});

router.get('/:id', (req, res) => {
    res.json({ message: `Profissional ${req.params.id}`, data: {} });
});

router.post('/', (req, res) => {
    res.status(201).json({ message: 'Profissional criado com sucesso', data: req.body });
});

router.put('/:id', (req, res) => {
    res.json({ message: `Profissional ${req.params.id} atualizado`, data: req.body });
});

router.delete('/:id', (req, res) => {
    res.json({ message: `Profissional ${req.params.id} deletado` });
});

module.exports = router;
