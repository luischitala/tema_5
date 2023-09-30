const express = require('express');
const sqlite3 = require('sqlite3').verbose(); // Importa sqlite3
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Configura el middleware para analizar JSON en las solicitudes
app.use(bodyParser.json());

// Configura la conexión a la base de datos SQLite
const db = new sqlite3.Database('mi_base_de_datos.db', (err) => {
  if (err) {
    console.error('Error al abrir la base de datos:', err.message);
  } else {
    console.log('Conexión exitosa a la base de datos');
  }
});

// Define la tabla "puntuaciones"
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS puntuaciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      jugador TEXT,
      puntuacion INTEGER,
      tiempo_juego TEXT,
      intentos INTEGER
    )
  `);
});

// Endpoint para agregar una puntuación
app.post('/puntuaciones', (req, res) => {
  const { jugador, puntuacion, tiempo_juego, intentos } = req.body;

  if (!jugador || !puntuacion || !tiempo_juego || !intentos) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  db.run(
    'INSERT INTO puntuaciones (jugador, puntuacion, tiempo_juego, intentos) VALUES (?, ?, ?, ?)',
    [jugador, puntuacion, tiempo_juego, intentos],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Error al agregar la puntuación' });
      }
      res.status(201).json({ message: 'Puntuación agregada con éxito', id: this.lastID });
    }
  );
});

// Endpoint para obtener todas las puntuaciones
app.get('/puntuaciones', (req, res) => {
  db.all('SELECT * FROM puntuaciones', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener las puntuaciones' });
    }
    res.status(200).json(rows);
  });
});

// Endpoint de bienvenida
app.get('/', (req, res) => {
  res.send('¡Bienvenido a mi API!');
});

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`La API está funcionando en el puerto ${PORT}`);
});
