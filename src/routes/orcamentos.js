const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: 'Lista de orçamentos', data: [] });
});

router.get('/:id', (req, res) => {
    res.json({ message: `Orçamento ${req.params.id}`, data: {} });
});

router.post('/', (req, res) => {
    res.status(201).json({ message: 'Orçamento criado com sucesso', data: req.body });
});

router.put('/:id', (req, res) => {
    res.json({ message: `Orçamento ${req.params.id} atualizado`, data: req.body });
});

router.delete('/:id', (req, res) => {
    res.json({ message: `Orçamento ${req.params.id} deletado` });
});

module.exports = router;
