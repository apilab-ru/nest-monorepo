import express from 'express';
const WebSocket = require('ws');
const cors = require('cors')
import { ProxyData } from "./app/proxy";
import * as http from "http";
import { LAST_RESULT } from "./app/last-result";
import { CityRaw } from "./app/models";
import {Commands} from "./app/commands";

const port = process.env.PORT ? Number(process.env.PORT) : 3567;

const app = express();
app.use(cors());

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

const proxyData = new ProxyData();
const commands = new Commands();

app.use(express.json({ limit: '5mb' }));

app.get('/', (req, res) => {
  res.send({ message: 'Hello API' });
});

app.post('/data', (req, res) => {
  proxyData.sendData(req.body);
  res.send({ message: 'ok' });
})

app.get('/command/refresh-rats', (req, res) => {
  const message = commands.getCommandRefreshRats();
  res.send({ message })
})

app.post('/command/refresh-rats', (req, res) => {
  commands.refreshRats();
  res.send({ message: 'ok' });
})

app.get('/test', (req, res) => {
  proxyData.sendData({
    Event: 'trades',
    Payload: LAST_RESULT as CityRaw[]
  })
  res.send({ message: 'ok' });
})

app.listen(port, () => {
  console.log(`[ ready ] http://localhost:${port}`);
});

wss.on('connection', (ws) => {
  proxyData.connect(message => ws.send(message))

  /*ws.on('message', (data) => {
    console.log('xxx message', data);
  })*/

  ws.on('close', () => {
    proxyData.disconnect();
  });
});

server.listen(3000, () => {
  console.log('WSS Сервер запущен на порту 3000');
});
