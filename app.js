const express = require("express");
const mysql = require("mysql");

const app = express();
app.use(express.json());

const db = mysql.createConnection({ // tem que lembrar de dar ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password'; no workbench.
    host: 'localhost',
    user: 'root',
    password: 'root',
    //database : "biblioteca"
});

function createOrUseDatabase() {
    db.connect(() => {
        db.query("CREATE DATABASE IF NOT EXISTS biblioteca", () => {
        
            db.query("USE biblioteca", () => {
                console.log("using biblioteca")
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

app.get("/getall", (req, res) => {
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
app.post("/addLivro", (req, res) => {
    const name = req.body.name;
    const autorname = req.body.autor;
    db.query("SELECT * FROM livros WHERE nome = ?", [name], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            res.status(400).send("Livro já existe");
        } else {
            db.query("SELECT id FROM autores WHERE nome = ?", [autorname], (err, result) => {
                if (err) throw err;
                if (result.length === 0) {
                    res.status(400).send("Autor não encontrado");
                } else {
                    db.query("INSERT INTO livros (nome, id_autor) VALUES (?, ?)", [name, result[0].id], (err, result) => {
                        if (err) throw err;
                        res.send(name + " inserido em livros");
                    });
                }
            });
        }
    });
});

app.delete("/delete", (req, res) => {
    db.query("DELETE FROM ?? WHERE nome = ?", [req.body.table, req.body.name], (err, result) => {
        if (err) {
            res.status(400).send(err.sqlMessage);
        } else {
            res.send(req.body.name + " deletado de " + req.body.table);
        }
    });
});

app.put("/update", (req, res) => {
    db.query("UPDATE ?? SET nome = ? WHERE nome = ?", [req.body.table, req.body.newName, req.body.oldName], (err, result) => {
        if (err) throw err;
        res.send("Atualizado");
    });
});

app.get("/getAutoresBySubstring/:substring", (req, res) => {
    const substring = req.params.substring;
    console.log(substring)
    db.query("SELECT autores.nome as nome_autor, livros.nome as nome_livro FROM autores JOIN livros ON autores.id = livros.id_autor WHERE autores.nome LIKE ?", ['%' + substring + '%'], (err, result) => {
        if (err) throw err;
        res.json(result);
    });
});

app.get("/getLivrosBySubstring/:substring", (req, res) => {
    const substring = req.params.substring;
    db.query("SELECT autores.nome as nome_autor, livros.nome as nome_livro FROM autores JOIN livros ON autores.id = livros.id_autor WHERE livros.nome LIKE ?", ['%' + substring + '%'], (err, result) => {
        if (err) throw err;
        res.json(result);
    });
});
