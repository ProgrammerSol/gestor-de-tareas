const express = require("express");
const db = require("./db"); //Usamos require con la ruta del archivo db.js
const { Tarea, Categoria } = require("./models");
const PORT = 3000;
const app = express();
app.use(express.json());
app.get("/", (req, res) => {
 res.send("Servidor funcionando correctamente");
});

//… codigo previo
app.post("/tareas", async (req, res) => {
 try {
 const { titulo, descripcion, categoria, fecha_fin } = req.body;
 if (!titulo) {
 return res.status(400).json({ message: "El título es obligatorio" });
 }
 if (!descripcion) {
 return res.status(400).json({ message: "La descripción es obligatoria" });
 }
 if (!categoria) {
 return res.status(400).json({ message: "La categoría es obligatoria" });
 }
 if (fecha_fin) {
 if (isNaN(Date.parse(fecha_fin))) {
 return res
 .status(400)
 .json({ message: "La fecha de fin no es válida" });
 }

 const hoy = new Date();
 hoy.setHours(0, 0, 0, 0);
 const fechaFinDate = new Date(fecha_fin);
 fechaFinDate.setHours(0, 0, 0, 0);
 if (fechaFinDate < hoy) {
 return res
 .status(400)
 .json({ message: "La fecha de fin no puede ser en el pasado" });
 }
 }
 //Existen dos formas de crear un nuevo documento en MongoDB con Mongoose
 //1. Crear una instancia del modelo y luego guardar
 /*
 const nuevaTarea = new Tarea({
 titulo,
 descripcion,
 categoria,
 completado: false
 });

 await nuevaTarea.save();
 //Esto permite hacer un paso o validación intermedia antes de guardar.
 */
 //2. Usar el método create del modelo
 const nuevaTarea = await Tarea.create({
 titulo,
 descripcion,
 categoria,
 fecha_fin,
 completado: false,
 });
 res.status(201).json(nuevaTarea);
 } catch (error) {
 res
 .status(500)
 .json({ error: "Error al crear la tarea. Verifique su conexión." });
 }
});

// ... codigo previo
app.put("/tareas/:id", async (req, res) => {
 try {
 const { id } = req.params;
 const { titulo, descripcion, categoria, fecha_fin } = req.body;
 const tarea = await Tarea.findById(id);
 if (!tarea) {
 return res.status(404).json({ message: "Tarea no encontrada" });
 }
 if (fecha_fin && isNaN(Date.parse(fecha_fin))) {
 return res.status(400).json({ message: "La fecha de fin no es válida" });
 }
 if (fecha_fin && new Date(fecha_fin) < new Date()) {
 return res
 .status(400)
 .json({ message: "La fecha de fin no puede ser en el pasado" });
 }

 tarea.titulo = titulo || tarea.titulo;
 tarea.descripcion = descripcion || tarea.descripcion;
 tarea.categoria = categoria || tarea.categoria;
 tarea.fecha_fin = fecha_fin || tarea.fecha_fin;
 const tareaActualizada = await tarea.save();
 if (!tareaActualizada) {
 return res
 .status(404)
 .json({ message: "Error al actualizar la tarea..." });
 }
 res.status(200).json({
 message: "Tarea actualizada correctamente",
 tarea: tareaActualizada,
 });
 } catch (error) {
 res
 .status(500)
 .json({ error: "Error al actualizar la tarea. Verifique su conexión." });
 }
});

 //… codigo previo
app.put("/tareas/:id/completar", async (req, res) => {
 try {
 const { id } = req.params;
 const tarea = await Tarea.findById(id);
 if (!tarea) {
 return res.status(404).json({ message: "Tarea no encontrada" });
 }
 if (tarea.completado) {
 return res
 .status(400)
 .json({ message: "La tarea ya está marcada como completada" });
 }
 tarea.completado = true;
 const tareaCompletada = await tarea.save();

 if (!tareaCompletada) {
 return res
 .status(404)
 .json({ message: "Error al completar la tarea..." });
 }
 res.status(200).json({
 message: "Tarea marcada como completada",
 tarea: tareaCompletada,
 });
 } catch (error) {
 res.status(500).json({
 error: "Error al completar la tarea. Verifique su conexión.",
 });
 }
});

//… codigo previo
app.delete("/tareas/:id", async (req, res) => {
 try {
 const { id } = req.params;
 const tarea = await Tarea.findById(id);
 if (!tarea) {
 return res.status(404).json({ message: "Tarea no encontrada" });
 }
 if (tarea.fecha_eliminacion) {
 return res.status(400).json({ message: "La tarea ya fue eliminada" });
 }
 tarea.fecha_eliminacion = new Date();
 const tareaEliminada = await tarea.save();

 if (!tareaEliminada) {
 return res.status(404).json({ message: "Error al eliminar la tarea..." });
 }
 res.status(200).json({
 message: "Tarea eliminada correctamente",
 tarea: tareaEliminada,
 });
 } catch (error) {
 res
 .status(500)
 .json({ error: "Error al eliminar la tarea. Verifique su conexión." });
 }
});

//... código previo
app.get("/tareas/incompletas", async (req, res) => {
 try {
 const tareasIncompletas = await Tarea.find({ completado: false });
 res.status(200).json({
 message: "Tareas incompletas obtenidas correctamente",
 tareas: tareasIncompletas
 });

 } catch (error) {
 res.status(500).json({ error: "Error al obtener las tareas incompletas." });
 }
});

app.get("/tareas/completas", async (req, res) => {
 try {

 const tareasCompletas = await Tarea.find({ completado: true });
 res.status(200).json({
 message: "Tareas completadas obtenidas correctamente.",
 tareas: tareasCompletas,
 });
 } catch (error) {
 res.status(500).json({ error: "Error al obtener las tareas completadas." });
 }
});

app.post("/categorias", async (req, res) => {
 try {
 const { nombre, descripcion } = req.body;
 if (!nombre) {
 return res.status(400).json({ message: "El nombre es obligatorio" });
 }
 if (!descripcion) {
 return res.status(400).json({ message: "La descripción es obligatoria" });
 }
 const nuevaCategoria = await Categoria.create({
 nombre,
 descripcion,
 });

 res.status(201).json({
 message: "Categoría creada correctamente",
 categoria: nuevaCategoria,
 });
 } catch (error) {
 res
 .status(500)
 .json({ error: "Error al crear la categoría. Verifique su conexión." });
 }
});

app.get("/tareas/categorias/:categoria", async (req, res) => {
 try {
 const { categoria } = req.params;
 const tareasPorCategoria = await Tarea.find({ categoria });
 if (tareasPorCategoria.length === 0) {
 return res.status(404).json({
 message: "No se encontraron tareas para la categoría especificada.",
 });
 }

 res.status(200).json({
 message: "Tareas obtenidas correctamente por categoría.",
 tareas: tareasPorCategoria
 });
 } catch (error) {
 res
 .status(500)
 .json({ error: "Error al obtener las tareas por categoría." });
 }
});

if (require.main === module) {
 db()
  .then(() => {
   app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
   });
  })
  .catch((error) => {
   console.error("No se pudo iniciar el servidor:", error);
   process.exitCode = 1;
  });
}

module.exports = app;
