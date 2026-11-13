const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");
const { Categoria, Tarea } = require("../models");
const app = require("../serve");

let server;
let baseUrl;

before(async () => {
 server = app.listen(0);
 await new Promise((resolve) => server.once("listening", resolve));
 baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
 await new Promise((resolve, reject) => {
  server.close((error) => (error ? reject(error) : resolve()));
 });
});

async function request(path, options) {
 const response = await fetch(`${baseUrl}${path}`, options);
 const body = response.headers.get("content-type")?.includes("application/json")
  ? await response.json()
  : await response.text();
 return { response, body };
}

function json(body) {
 return {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
 };
}

test("GET / responde que el servidor funciona", async () => {
 const { response, body } = await request("/");
 assert.equal(response.status, 200);
 assert.equal(body, "Servidor funcionando correctamente");
});

test("POST /tareas valida los campos obligatorios y la fecha", async (t) => {
 const missingTitle = await request("/tareas", json({}));
 assert.equal(missingTitle.response.status, 400);
 assert.equal(missingTitle.body.message, "El título es obligatorio");

 const missingDescription = await request(
  "/tareas",
  json({ titulo: "Tarea" }),
 );
 assert.equal(missingDescription.response.status, 400);
 assert.equal(missingDescription.body.message, "La descripción es obligatoria");

 const missingCategory = await request(
  "/tareas",
  json({ titulo: "Tarea", descripcion: "Descripción" }),
 );
 assert.equal(missingCategory.response.status, 400);
 assert.equal(missingCategory.body.message, "La categoría es obligatoria");

 const invalidDate = await request(
  "/tareas",
  json({
   titulo: "Tarea",
   descripcion: "Descripción",
   categoria: "Trabajo",
   fecha_fin: "no-es-fecha",
  }),
 );
 assert.equal(invalidDate.response.status, 400);
 assert.equal(invalidDate.body.message, "La fecha de fin no es válida");

 const pastDate = new Date();
 pastDate.setDate(pastDate.getDate() - 1);
 const pastDateResult = await request(
  "/tareas",
  json({
   titulo: "Tarea",
   descripcion: "Descripción",
   categoria: "Trabajo",
   fecha_fin: pastDate.toISOString(),
  }),
 );
 assert.equal(pastDateResult.response.status, 400);
 assert.equal(
  pastDateResult.body.message,
  "La fecha de fin no puede ser en el pasado",
 );
});

test("POST /tareas crea una tarea válida", async (t) => {
 const task = { _id: "task-1", titulo: "Tarea", completado: false };
 t.mock.method(Tarea, "create", async () => task);

 const { response, body } = await request(
  "/tareas",
  json({
   titulo: "Tarea",
   descripcion: "Descripción",
   categoria: "Trabajo",
  }),
 );
 assert.equal(response.status, 201);
 assert.deepEqual(body, task);
});

test("PUT /tareas/:id actualiza una tarea existente", async (t) => {
 const task = {
  titulo: "Anterior",
  descripcion: "Descripción",
  categoria: "Trabajo",
  save: async function () {
   return this;
  },
 };
 t.mock.method(Tarea, "findById", async () => task);

 const { response, body } = await request(
  "/tareas/task-1",
  {
   method: "PUT",
   headers: { "content-type": "application/json" },
   body: JSON.stringify({ titulo: "Actualizada" }),
  },
 );
 assert.equal(response.status, 200);
 assert.equal(body.tarea.titulo, "Actualizada");
});

test("PUT /tareas/:id/completar marca la tarea como completada", async (t) => {
 const task = {
  completado: false,
  save: async function () {
   return this;
  },
 };
 t.mock.method(Tarea, "findById", async () => task);

 const { response, body } = await request("/tareas/task-1/completar", {
  method: "PUT",
 });
 assert.equal(response.status, 200);
 assert.equal(body.tarea.completado, true);
});

test("DELETE /tareas/:id elimina lógicamente una tarea", async (t) => {
 const task = {
  save: async function () {
   return this;
  },
 };
 t.mock.method(Tarea, "findById", async () => task);

 const { response, body } = await request("/tareas/task-1", {
  method: "DELETE",
 });
 assert.equal(response.status, 200);
 assert.equal(body.message, "Tarea eliminada correctamente");
 assert.ok(body.tarea.fecha_eliminacion);
});

test("GET /tareas/incompletas y /tareas/completas filtran tareas", async (t) => {
 t.mock.method(Tarea, "find", async (filter) => [filter]);

 const incomplete = await request("/tareas/incompletas");
 assert.equal(incomplete.response.status, 200);
 assert.deepEqual(incomplete.body.tareas, [{ completado: false }]);

 const complete = await request("/tareas/completas");
 assert.equal(complete.response.status, 200);
 assert.deepEqual(complete.body.tareas, [{ completado: true }]);
});

test("POST /categorias valida y crea una categoría", async (t) => {
 const missingName = await request("/categorias", json({}));
 assert.equal(missingName.response.status, 400);
 assert.equal(missingName.body.message, "El nombre es obligatorio");

 const missingDescription = await request(
  "/categorias",
  json({ nombre: "Trabajo" }),
 );
 assert.equal(missingDescription.response.status, 400);
 assert.equal(missingDescription.body.message, "La descripción es obligatoria");

 const category = { _id: "category-1", nombre: "Trabajo" };
 t.mock.method(Categoria, "create", async () => category);
 const created = await request(
  "/categorias",
  json({ nombre: "Trabajo", descripcion: "Tareas laborales" }),
 );
 assert.equal(created.response.status, 201);
 assert.deepEqual(created.body.categoria, category);
});

test("GET /tareas/categorias/:categoria obtiene las tareas de una categoría", async (t) => {
 t.mock.method(Tarea, "find", async () => [{ titulo: "Tarea" }]);
 const { response, body } = await request("/tareas/categorias/Trabajo");
 assert.equal(response.status, 200);
 assert.deepEqual(body.tareas, [{ titulo: "Tarea" }]);
});
