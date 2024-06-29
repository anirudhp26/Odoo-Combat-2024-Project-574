const prisma = require("../config/db");
const bcrypt = require("bcrypt");

class UserServices {
    constructor () {
        this.prisma = prisma;
    }

    async login (input) {
        try {
            const { email, password } = input;
            const user = await this.prisma.user.findUnique({
                where: {
                    email
                }
            });
            if (!user) {
                return {
                    message: "User not found",
                    success: false
                }
            }
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return {
                    message: "Invalid password",
                    success: false
                }
            }
            return {
                message: "Login successful",
                success: true
            }
        } catch (error) {
            return {
                message: error.message,
                success: false
            }
        }
    }

    async registerUser (input) {
        try {
            const { name, email, password } = input;
            const hashedPassword = await bcrypt.hash(password, 10);
            await this.prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword
                }
            });
            return {
                message: "User registered successfully",
                success: true
            }
        } catch (error) {
            return {
                message: error.message,
                success: false
            }
        }
    }
}

module.exports = { UserServices };