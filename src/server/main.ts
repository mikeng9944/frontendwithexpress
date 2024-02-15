import express from "express";
import ViteExpress from "vite-express";
import mysql from "mysql2";
import fs from "fs";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();

app.get("/hello", (_, res) => {
  res.send("Hello Vite + React + TypeScript!");
});

app.get("/backend", (_, res) => {
  res.send("Hello Vite + React + TypeScript!");
});

ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000...")
);
