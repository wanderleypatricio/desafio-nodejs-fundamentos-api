const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');

// Configurar a aplicação

const app = express();
const port = 3000;
app.use(cors());
// Configurar o body-parser para processar dados JSON
app.use(bodyParser.json());

// Configurar a conexão com o MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Substitua pelo seu usuário MySQL
    password: '', // Substitua pela sua senha MySQL
    database: 'tasks_db'
});

// Conectar ao banco de dados
db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
    } else {
        console.log('Conectado ao banco de dados MySQL');
    }
});

// Rotas CRUD

// 1. Criar produto (POST)
app.post('/tasks', (req, res) => {
    const { title, description} = req.body;
    const sql = 'INSERT INTO tasks (title, description, completed_at, created_at) VALUES (?, ?, ?, ?)';
    db.query(sql, [title, description, false, new Date().toISOString()], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        res.status(201).json({ id: result.insertId, title, description, completed_at, created_at });
    });
});

// 2. Listar todos os tasks (GET)
app.get('/tasks', (req, res) => {
    const sql = 'SELECT * FROM tasks';
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        res.status(200).json(results);
    });
});

// 3. Buscar produto por ID (GET)
app.get('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM tasks WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        if (result.length === 0) {
            return res.status(404).json({ error: 'Tarefa não encontrado' });
        }
        res.status(200).json(result[0]);
    });
});

// 4. Atualizar produto por ID (PUT)
app.put('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;
    const sql = 'UPDATE tasks SET title = ?, description = ?, updated_at = ? WHERE id = ?';
    db.query(sql, [title, description, new Date().toISOString(), id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Tarefa não encontrado' });
        }
        res.status(200).json({ id, title, description });
    });
});

// 6. Atualizar o status da tarefa peloo ID (PATH)
app.patch('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'UPDATE tasks set completed_at = ?, updated_at = ? WHERE id = ?';
    db.query(sql, [true, new Date().toISOString(), id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Tarefa não encontrado' });
        }
        res.status(200).json({ id });
    });
});

// 5. Deletar produto por ID (DELETE)
app.delete('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM tasks WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Tarefa não encontrado' });
        }
        res.status(204).send();
    });
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
