const Redis = require("ioredis");

const pub = new Redis({
	host: "redis-10911.c305.ap-south-1-1.ec2.redns.redis-cloud.com",
	port: 10911,
	username: "default",
	password: "bsgrx0FSayTgpCnuZ9j1P1AYchr3Ekc7",
});

const sub = new Redis({
	host: "redis-10911.c305.ap-south-1-1.ec2.redns.redis-cloud.com",
	port: 10911,
	username: "default",
	password: "bsgrx0FSayTgpCnuZ9j1P1AYchr3Ekc7",
});

module.exports = {
    pub,
    sub,
};