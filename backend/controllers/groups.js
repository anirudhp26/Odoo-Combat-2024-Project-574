import prisma from "../config/db";

class GroupsController {
    constructor() {
        this.prisma = prisma;
    }

    async getGroupById(input) {
        const { id } = input;
        return await this.prisma.group.findUnique({
            where: {
                id
            }
        });
    }

    async createGroup(input) {
        try {
            const { name, leaderId, members } = input;
            const tag = await this.generateUniqueRandomId(5);
            const group = await this.prisma.group.create({
                data: {
                    name,
                    leaderId,
                    tag,
                    members: {
                        connect: members.map((member) => ({ id: member.id }))
                    }
                }
            });

            await this.prisma.user.update({
                where: {
                    id: leaderId
                },
                data: {
                    ownGroup: {
                        connect: {
                            id: group.id
                        }
                    }
                }
            });

            // Create roles for leader and members
            await this.prisma.roles.create({
                data: {
                    userId: leaderId,
                    groupId: group.id,
                    createAccess: true,
                    readAccess: true,
                    updateAccess: true,
                    deleteAccess: true
                }
            });
            await Promise.all(
                members.map(async (member) => {
                    await this.prisma.roles.create({
                        data: {
                            userId: member.id,
                            groupId: group.id,
                            createAccess: member.createAccess,
                            readAccess: member.readAccess,
                            updateAccess: member.updateAccess,
                            deleteAccess: member.deleteAccess
                        }
                    })
                })
            )
            return {
                message: "Group created successfully!",
                success: true
            }
        } catch (error) {
            return {
                message: error.message,
                success: false
            }
        }
    }

    async removeMember(input) {
        try {
            const { groupId, memberId } = input;
            await this.prisma.$transaction(async (tx) => {
                await tx.roles.delete({
                    where: {
                        unique_user_group: {
                            groupId,
                            userId: memberId
                        }
                    }
                });
                await tx.group.update({
                    where: {
                        id: groupId
                    },
                    data: {
                        members: {
                            disconnect: {
                                id: memberId
                            }
                        }
                    }
                })
            })
            return {
                message: "Member removed successfully!",
                success: true
            }
        } catch (error) {
            return {
                message: error.message,
                success: false
            }
        }
    }

    async addMember(input) {
        try {
            const { groupId, memberId, roles } = input;
            const group = await this.prisma.group.findUnique({
                where: {
                    id: groupId
                }
            });
            if (!group) {
                return {
                    message: "Group not found",
                    success: false
                }
            }
            const member = await this.prisma.user.findUnique({
                where: {
                    id: memberId
                }
            });
            if (!member) {
                return {
                    message: "Member not found",
                    success: false
                }
            }
            await this.prisma.$transaction(async (tx) => {
                await tx.group.update({
                    where: {
                        id: groupId
                    },
                    data: {
                        members: {
                            connect: {
                                id: memberId
                            }
                        }
                    }
                });
                await tx.roles.create({
                    data: {
                        userId: memberId,
                        groupId,
                        createAccess: roles.createAccess,
                        readAccess: roles.readAccess,
                        updateAccess: roles.updateAccess,
                        deleteAccess: roles.deleteAccess
                    }
                })
            });
            return {
                message: "Member added successfully!",
                success: true
            }
        } catch (error) {
            return {
                message: error.message,
                success: false
            }
        }
    }

    async generateRandomId(length) {
        const characters =
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let randomId = "";

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            randomId += characters.charAt(randomIndex);
        }

        return randomId.toUpperCase();
    }
    async generateUniqueRandomId(maxRetries) {
        for (let retry = 0; retry < maxRetries; retry++) {
            const uuid = await this.generateRandomId(6);
            const isUuidUnique = await this.prisma.group.findUnique({
                where: { tag: uuid },
            });
            if (!isUuidUnique) {
                return uuid;
            } else {
                throw new Error("Failed to generate a unique ID after max retries");
            }
        }
    }
}

module.exports = { GroupsController };