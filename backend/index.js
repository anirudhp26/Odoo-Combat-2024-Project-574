const express = require('express');
const http = require('http');
const { SocketServer } = require('./controllers/socket');
const { UserServices } = require('./controllers/users');

const app = express();
const server = http.createServer(app);
const userServices = new UserServices();

// Middleware for parsing JSON
app.use(express.json());

// REST API endpoints
app.post('/api/login', async (req, res) => {
    const input = req.body;
    const response = await userServices.login(input);
    res.status(response.success ? 200 : 400).json(response);
});

app.post('/api/register', async (req, res) => {
    const input = req.body;
    const response = await userServices.registerUser(input);
    res.status(response.success ? 200 : 400).json(response);
});

app.post('/api/creategroup', async (req, res) => {
    const input = req.body;
    const response = await userServices.createGroup(input);
    res.status(response.success ? 200 : 400).json(response);
});

app.post('/api/gettasks', async (req, res) => {
    const input = req.body;
    const response = await userServices.getTasks(input);
    res.status(response.success ? 200 : 400).json(response);
});

const PORT = process.env.PORT || 3001;

// WebSocket connection
async function init () {
    const socketServer = new SocketServer();
    socketServer.io.attach(server);
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
    socketServer.listeners();
    console.log("Socket server running...");
}

init().catch((error) => {
    console.error(error);
});