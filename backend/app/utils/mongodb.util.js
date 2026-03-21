const mongoose = require("mongoose");

async function connect(uri) {
    try {
        await mongoose.connect(uri);
        console.log("Connected to the database via Mongoose!");
    } catch (error) {
        console.log("Cannot connect to the database!", error);
        process.exit();
    }
}

module.exports = { connect };