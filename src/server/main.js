import express from "express";
import ViteExpress from "vite-express";
import mysql from "mysql2";
import fs from "fs";
import bodyParser from "body-parser";
import cors from "cors";

const pool = mysql
  .createPool({
    host: "mysql-tg-prd-amagpt-eas-01.mysql.database.azure.com",
    user: "amagptsqladmin",
    password: "P@ssw0rd123456",
    database: "towngas-poc",
    port: 3306,
    ssl: {
      rejectUnauthorized: false,
      ca: fs.readFileSync("src/server/DigiCertGlobalRootCA.crt.pem"),
    },
  })
  .promise();

export async function getAllusers() {
  const [rows] = await pool.query("select * from users");
  return rows;
}

export async function getUser(id) {
  const [rows] = await pool.query(
    `
  SELECT * 
  FROM users
  WHERE id = ${id}
  `
  );
  return rows[0];
}

export async function getUserByToken(authtoken) {
  const [rows] = await pool.query(
    `
  SELECT * 
  FROM users
  WHERE auth_token = '${authtoken}'
  `
  );
  return rows[0];
}

export async function checkRegister(authtoken) {
  const [rows] = await pool.query(
    `
  SELECT COUNT(*) AS 'registernumber'
  FROM users
  WHERE auth_token = '${authtoken}'
  `
  );
  return rows[0];
}

export async function createUser(name, authtoken) {
  const [result] = await pool.query(
    `
  INSERT INTO users (name, auth_token, total_token_usage)
  VALUES (?, ?, ?)
  `,
    [name, authtoken, 0]
  );
  const result_id = result.insertId;
  return getUser(result_id);
}

export async function updateUsersTokenUsage(token, id) {
  await pool.query(
    `
    Update users 
    SET total_token_usage = ${token}
    WHERE id = ${id}
    `
  );
  return getUser(id);
}

export async function getUserChats(userid) {
  const [rows] = await pool.query(
    `select * from chats where user_id = ${userid} AND deleted = false LIMIT 1`
  );
  return rows;
}

export async function getUserChatID(userid) {
  const [rows] = await pool.query(
    `select * from chats where user_id = ${userid} AND deleted = false LIMIT 1`
  );
  return rows[0].id;
}

export async function getAllUserchats(userid) {
  const [rows] = await pool.query(
    `select * from chats where user_id = ${userid} AND deleted = false`
  );
  return rows;
}

export async function getChat(id) {
  const [rows] = await pool.query(
    `
  SELECT * 
  FROM chats
  WHERE id = ${id}
  `
  );
  return rows[0];
}

export async function createChat(name, prompt, userid) {
  const [result] = await pool.query(
    `
  INSERT INTO chats (name, prompt, user_id)
  VALUES (?, ?, ?)
  `,
    [name, prompt, userid]
  );
  const result_id = result.insertId;
  return getChat(result_id);
}

export async function deleteChat(chatid) {
  await pool.query(
    `
    Update chats 
    SET deleted = true
    WHERE id = ${chatid}
    `,
    [chatid]
  );
}

export async function getChatDetail(id) {
  const [rows] = await pool.query(`
  SELECT * 
  FROM chat_details
  WHERE chat_id = ${id} AND cleared = false
  `);
  return rows;
}

export async function createChatDetail(
  chatid,
  question,
  answer,
  thoughts,
  tokenusage
) {
  const [result] = await pool.query(
    `
  INSERT INTO chat_details (chat_id, question, answer, thoughts, token_usage)
  VALUES (?, ?, ?, ?, ?)
  `,
    [chatid, question, answer, thoughts, tokenusage]
  );

  const result_id = result.insertId;
  return result_id;
}

export async function createChatDetailDatasource(chatdetailsid, datasource) {
  await pool.query(
    `
  INSERT INTO chat_detail_datasources (chat_details_id, datasource)
  VALUES (?, ?)
  `,
    [chatdetailsid, datasource]
  );
}

export async function clearChatDetails(userid) {
  const chat_id = await getUserChatID(userid);

  await pool.query(
    `
    Update chat_details 
    SET cleared = true
    WHERE chat_id = ${chat_id} AND cleared = false
    `
  );
}

const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// app.use(cors({ origin: true, credentials: true }));

const corsOptions = {
  origin: "*",
  credentials: true,
  methods: ["GET", "PUT", "POST", "OPTIONS", "DELETE", "PATCH"],
};

app.use(cors(corsOptions));

app.get("/backendconnection", async (req, res) => {
  res.send("Connect to backend successfully!");
});

app.get("/allusers", async (req, res) => {
  const users = await getAllusers();
  res.send(users);
});

app.post("/user", async (req, res) => {
  const { id } = req.body;
  const user = await getUser(id);
  res.status(201).send(user);
});

app.post("/userbytoken", async (req, res) => {
  const { authtoken } = req.body;
  const user = await getUserByToken(authtoken);
  res.status(201).send(user);
});

app.post("/checkregister", async (req, res) => {
  const { authtoken } = req.body;
  const registered = await checkRegister(authtoken);
  res.status(201).send(registered);
});

app.post("/createuser", async (req, res) => {
  const { name, authtoken } = req.body;
  const user = await createUser(name, authtoken);
  res.status(201).send(user);
});

app.post("/updatetoken", async (req, res) => {
  const { token, userid } = req.body;
  const user = await updateUsersTokenUsage(token, userid);
  res.status(201).send(user);
});

app.post("/userchat", async (req, res) => {
  const { userid } = req.body;
  const chats = await getUserChats(userid);
  res.status(201).send(chats);
});

app.post("/userchatid", async (req, res) => {
  const { userid } = req.body;
  const chats = await getUserChatID(userid);
  res.status(201).send(chats);
});

app.post("/alluserchats", async (req, res) => {
  const { userid } = req.body;
  const chats = await getAllUserchats(userid);
  res.status(201).send(chats);
});

app.post("/userchat", async (req, res) => {
  const { chatid } = req.body;
  const chat = await getChat(chatid);
  res.status(201).send(chat);
});

app.post("/createchat", async (req, res) => {
  const { name, prompt, userid } = req.body;
  const chat = await createChat(name, prompt, userid);
  res.status(201).send(chat);
});

app.post("/deletechat", async (req, res) => {
  const { chatid } = req.body;
  const chat = await deleteChat(chatid);
  res.status(201).send(chat);
});

app.post("/createchatdetail", async (req, res) => {
  const { chatid, question, answer, thought, tokenusage } = req.body;
  const chatdetail = await createChatDetail(
    chatid,
    question,
    answer,
    thought,
    tokenusage
  );
  res.status(201).send(chatdetail);
});

app.post("/clearchatdetail", async (req, res) => {
  const { userid } = req.body;
  const chatdetail = await clearChatDetails(userid);
  res.status(201).send(chatdetail);
});

app.post("/createchatdetaildatasource", async (req, res) => {
  const { chatdetailsid, datasource } = req.body;
  const chatdetaildatasource = await createChatDetailDatasource(
    chatdetailsid,
    datasource
  );
  res.status(201).send(chatdetaildatasource);
});

app.post("/getchatdetail", async (req, res) => {
  const { chatid } = req.body;
  const chatdetails = await getChatDetail(chatid);
  res.send(chatdetails);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

ViteExpress.listen(app, 8080, () =>
  console.log("Server is listening on port 8080...")
);
