require("dotenv").config();

const mongoose = require("mongoose");
const MONGO_URI = process.env.MONGO_URI;

function db() {
 if (!MONGO_URI) {
  throw new Error("Configura la variable de entorno MONGO_URI antes de iniciar el servidor.");
 }

 mongoose
 .connect(MONGO_URI)
 .then(() => console.log("Conexión a la base de datos establecida"))
 .catch((error) =>
 console.error("Error al conectar a la base de datos:", error)
 );
}
module.exports = db; //Para utilizar la función ‘db’ que conecta con mongoDB en otro archivo, debemos de utilizar la función module.exports de node.js