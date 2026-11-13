require("dotenv").config();

const mongoose = require("mongoose");

async function db() {
 const mongoUri = process.env.MONGO_URI;
 if (!mongoUri) {
  throw new Error("Configura la variable de entorno MONGO_URI antes de iniciar el servidor.");
 }

 await mongoose.connect(mongoUri);
 console.log("Conexión a la base de datos establecida");
}

module.exports = db;
