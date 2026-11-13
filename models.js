const mongoose = require("mongoose");
const tareaSchema = new mongoose.Schema({
 titulo: {
 type: String,
 required: true,
 },
 descripcion: {
 type: String,
 required: true,
 },
 categoria: {
 type: String,
 required: true,
 },
 completado: {
 type: Boolean,
 default: false,
 },
 fecha_fin: Date,
 fecha_eliminacion: Date,
});
const categoriaSchema = new mongoose.Schema({
 nombre: {
 type: String,
 required: true,
 },
 descripcion: {
 type: String,
 required: true,
 },
});
const Tarea = mongoose.model("Tarea", tareaSchema);
const Categoria = mongoose.model("Categoria", categoriaSchema);
module.exports = { Tarea, Categoria };

