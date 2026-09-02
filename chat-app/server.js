import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';

const PORT = process.env.PORT || 3001;

// Di ES Modules, __dirname tidak tersedia secara langsung, kita harus membuatnya seperti ini:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Membuat HTTP server untuk membaca dan melayani ./public/index.html
const server = http.createServer((req, res) => {
    const filePath = path.join(__dirname, 'public', 'index.html');
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
            return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content);
    });
});

// 2. Membuat WebSocketServer dengan opsi { server }
const wss = new WebSocketServer({ server });

// Fungsi pembantu untuk membroadcast pesan JSON ke semua klien yang terhubung
const broadcast = (messageObj) => {
    const messageString = JSON.stringify(messageObj);
    wss.clients.forEach((client) => {
        if (client.readyState === 1) { // 1 berarti client.OPEN
            client.send(messageString);
        }
    });
};

// 3. Mendaftarkan 'connection' listener pada wss
wss.on('connection', (socket, req) => {
    const username = new URL(req.url, "http://localhost").searchParams.get("username") || "Anonymous";

    broadcast({ type: "system", text: `${username} joined` });

    // 4. Mendaftarkan 'message' listener pada socket untuk pesan chat
    socket.on('message', (data) => {
        try {
            const { username: msgUsername, text } = JSON.parse(data.toString());
            broadcast({ type: 'chat', username: msgUsername, text: text });
        } catch (err) {
            console.error("Gagal memproses pesan:", err);
        }
    });

    // 5. Mendaftarkan 'close' listener pada socket saat user keluar
    socket.on('close', () => {
        broadcast({ type: 'system', text: `${username} left` });
    });
});

// 6. Menjalankan server pada PORT yang ditentukan
server.listen(PORT, () => {
    console.log(`Chat server running at http://localhost:${PORT}`);
});
