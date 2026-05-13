const mongoose = require('mongoose');

const AuthorizedUserSchema = new mongoose.Schema({
    app_id: { type: String, required: true },
    username: { type: String },
    email: { type: String, required: true },
    status: { type: String, default: 'active' }
}, { 
    collection: 'auth_provider_authorized_users',
    timestamps: { createdAt: 'created_at', updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Composite constraint matching UNIQUE(app_id, email)
AuthorizedUserSchema.index({ app_id: 1, email: 1 }, { unique: true });

AuthorizedUserSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

const MongooseAuthorizedUser = mongoose.model('AuthProviderAuthorizedUser', AuthorizedUserSchema);

const AuthorizedUser = {
    create: async (appId, email, username) => {
        return await MongooseAuthorizedUser.create({
            app_id: appId,
            email: email,
            username: username || undefined
        });
    },

    findAll: async () => {
        const users = await MongooseAuthorizedUser.find().sort({ created_at: -1 });
        
        // Hydrate app names to mimic the original SQL JOIN
        const appIds = [...new Set(users.map(u => u.app_id))];
        const Application = require('./Application');
        const apps = await Application.MongooseModel.find({ app_id: { $in: appIds } });
        
        const appNameMap = {};
        apps.forEach(app => {
            appNameMap[app.app_id] = app.name;
        });
        
        return users.map(user => {
            const obj = user.toObject({ virtuals: true });
            obj.app_name = appNameMap[user.app_id] || 'Unknown App';
            return obj;
        });
    },

    findByAppId: async (appId) => {
        const docs = await MongooseAuthorizedUser.find({ app_id: appId }).sort({ created_at: -1 });
        return docs.map(doc => doc.toObject({ virtuals: true }));
    },

    findByAppAndEmail: async (appId, email) => {
        const doc = await MongooseAuthorizedUser.findOne({ app_id: appId, email: email });
        return doc ? doc.toObject({ virtuals: true }) : null;
    },

    updateStatus: async (id, status) => {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;
        return await MongooseAuthorizedUser.findByIdAndUpdate(id, { status });
    },

    delete: async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;
        return await MongooseAuthorizedUser.findByIdAndDelete(id);
    },
    
    MongooseModel: MongooseAuthorizedUser
};

module.exports = AuthorizedUser;
