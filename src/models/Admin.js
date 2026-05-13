const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
}, { 
    collection: 'auth_provider_admins',
    timestamps: { createdAt: 'created_at', updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Expose id as virtual
AdminSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

const MongooseAdmin = mongoose.model('AuthProviderAdmin', AdminSchema);

const Admin = {
    findByEmail: async (email) => {
        const doc = await MongooseAdmin.findOne({ email });
        return doc ? doc.toObject({ virtuals: true }) : null;
    },
    // Export core mongoose model internally for seed utility
    MongooseModel: MongooseAdmin
};

module.exports = Admin;
