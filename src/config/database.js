const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

let cachedConnection = null;

const connectDB = async () => {
    if (!MONGO_URI) {
        console.error('❌ Error: MONGO_URI is not defined');
        throw new Error('MONGO_URI is not defined in environment variables');
    }
    if (cachedConnection) {
        return cachedConnection;
    }
    try {
        // Mongoose buffers commands, so models can be required anywhere
        cachedConnection = await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('🚀 Connected to MongoDB Atlas successfully');
        
        // Run the default seeder
        await seedAdmin();
        return cachedConnection;
    } catch (error) {
        console.error('❌ MongoDB Connection Failed:', error.message);
        throw error;
    }
};

const seedAdmin = async () => {
    try {
        // Require inside the function to prevent circular dependency issues
        const mongooseAdmin = mongoose.models.AuthProviderAdmin || require('../models/Admin').MongooseModel;
        
        const count = await mongooseAdmin.countDocuments();
        if (count === 0) {
            const email = process.env.ADMIN_EMAIL || 'admin@example.com';
            const rawPass = process.env.ADMIN_PASSWORD || 'admin123';
            const salt = bcrypt.genSaltSync(10);
            const hashedPass = bcrypt.hashSync(rawPass, salt);
            
            await mongooseAdmin.create({
                email: email,
                password: hashedPass
            });
            console.log(`✨ Initialized default admin account: ${email}`);
        }
    } catch (e) {
        console.error('❌ Admin Seeding Error:', e.message);
    }
};

// Export the connection initializer
module.exports = { connectDB };
