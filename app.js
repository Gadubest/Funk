const express = require("express");
const mysql = require("mysql");

const app = express();
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
});

function createOrUseDatabase() {
    db.connect(() => {
        db.query("CREATE DATABASE IF NOT EXISTS biblioteca", () => {
            db.query("USE biblioteca", () => {
                db.query("CREATE TABLE IF NOT EXISTS autores (id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY, nome VARCHAR(255))", () => {
                    db.query("CREATE TABLE IF NOT EXISTS livros (id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY, nome VARCHAR(255), id_autor INT, FOREIGN KEY (id_autor) REFERENCES autores(id))");
                });
            });
        });
    });
}

createOrUseDatabase();

app.listen(3000, () => {
    console.log("Server is listening on port 3000");
});

app.get("/GETALL", (req, res) => {
    db.query("SELECT autores.nome as nome_autor, livros.nome as nome_livro FROM autores JOIN livros ON autores.id = livros.id_autor", (err, result) => {
        if (err) throw err;
        res.json(result);
    });
});

app.get("/getAutorByName/:name", (req, res) => {
    db.query("SELECT autores.nome as nome_autor, livros.nome as nome_livro FROM autores JOIN livros ON autores.id = livros.id_autor WHERE autores.nome = ?", [req.params.name], (err, result) => {
        if (err) throw err;
        res.json(result);
    });
});

app.get("/getBookByName/:name", (req, res) => {
    db.query("SELECT autores.nome as nome_autor, livros.nome as nome_livro FROM autores JOIN livros ON autores.id = livros.id_autor WHERE livros.nome = ?", [req.params.name], (err, result) => {
        if (err) throw err;
        res.json(result);
    });
});

app.post("/addAutor", (req, res) => {
    const name = req.body.name;
    db.query("SELECT * FROM autores WHERE nome = ?", [name], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            res.status(400).send("Autor já existe");
        } else {
            db.query("INSERT INTO autores (nome) VALUES (?)", [name], (err, result) => {
                if (err) throw err;
                res.send(name + " inserido em autores");
            });
        }
    });
});

