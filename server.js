const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;

// Conectar a la base de datos SQLite
const db = new sqlite3.Database('./base.db');

db.serialize(() => {
    // Crear la tabla de inventario si no existe
    db.run(`
        CREATE TABLE IF NOT EXISTS inventory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            quantity INTEGER
        )
    `);
});

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Obtener todos los productos
app.get('/inventory', (req, res) => {
    db.all('SELECT * FROM inventory', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Agregar un nuevo producto
app.post('/inventory', (req, res) => {
    const { name, quantity } = req.body;
    db.run('INSERT INTO inventory (name, quantity) VALUES (?, ?)', [name, quantity], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, name, quantity });
    });
});

// Actualizar un producto
app.put('/inventory/:id', (req, res) => {
    const id = req.params.id;
    const { quantity } = req.body;
    db.run('UPDATE inventory SET quantity = ? WHERE id = ?', [quantity, id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Producto actualizado', id, quantity });
    });
});

// Eliminar un producto
app.delete('/inventory/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM inventory WHERE id = ?', id, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Producto eliminado', id });
    });
});

// Servir el archivo index.html en la raíz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint para verificar los datos
app.get('/verify', (req, res) => {
    db.all('SELECT * FROM inventory', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}/`);
});



