import { Sequelize } from "sequelize";

const passwords = [
    "EG1GXXKzD5x9D8o1",
    "EG1GXXKzD5x9D8ol",
    "EG1GXXKzD5x9D8oI",
    "EG1GXXKzD5x9D8O1",
    "EG1GXXKzD5x9D8Ol",
    "EG1GXXKzD5x9D8OI",
    "EG1GXXKzD5x9D801",
    "EG1GXXKzD5x9D80l",
    "EG1GXXKzD5x9D80I"
];

async function hunt() {
    for (const pwd of passwords) {
        console.log("Trying: " + pwd);
        const db = new Sequelize("test", "3aP1hhR3tH3PUDm.root", pwd, {
            host: "gateway01.ap-southeast-1.prod.aws.tidbcloud.com",
            port: 4000,
            dialect: "mysql",
            logging: false,
            dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
        });

        try {
            await db.authenticate();
            console.log("SUCCESS!!! The password is: " + pwd);
            process.exit(0);
        } catch (e) {
            // failed, try next
        }
    }
    console.log("None of the combinations worked.");
    process.exit(1);
}

hunt();
