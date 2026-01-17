const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: 'Lista de relatórios', data: [] });
});

router.get('/:tipo', (req, res) => {
    res.json({ message: `Relatório ${req.params.tipo}`, data: {} });
});

module.exports = router;
