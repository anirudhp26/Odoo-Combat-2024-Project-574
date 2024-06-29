const { Server } = require("socket.io");
const { pub, sub } = require("../config/redis");

class SocketServer {
    constructor() {
        this.pio = new Server({
            cors: {
                origin: "*",
            },
        });
    }

    async listeners() {
        const io = this.io;
        io.on("connection", (socket) => {
            socket.on(
                "newUser",
                async ({
                    email,
                    id,
                }) => {
                    const existingUser = await pub.smembers("onlineUsers");
                    const existingUserData = existingUser.find(
                        (user) => JSON.parse(user).email === email
                    );

                    if (existingUserData) {
                        const { socketId: oldSocketId } =
                            JSON.parse(existingUserData);
                        if (oldSocketId !== socket.id) {
                            await pub.srem("onlineUsers", existingUserData);
                            await pub.sadd(
                                "onlineUsers",
                                JSON.stringify({
                                    email,
                                    socketId: socket.id,
                                    id: id,
                                    status: "online",
                                })
                            );
                        }
                    } else {
                        await pub.sadd(
                            "onlineUsers",
                            JSON.stringify({
                                email,
                                socketId: socket.id,
                                id: id,
                                status: "online",
                            })
                        );
                    }
                }
            );

            socket.on("disconnect", async () => {
                const existingUsers = await pub.smembers("onlineUsers");
                const userToRemove = existingUsers.find(
                    (user) => JSON.parse(user).socketId === socket.id
                );
                if (userToRemove) {
                    await pub.srem("onlineUsers", userToRemove);
                }
            });
        });

    }

    get io() {
        return this.pio;
    }
}

module.exports = {
    SocketServer,
};