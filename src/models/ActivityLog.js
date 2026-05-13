const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
    app_id: { type: String, required: true },
    email: { type: String, required: true },
    action: { type: String, required: true }
}, { 
    collection: 'auth_provider_activity_logs',
    timestamps: { createdAt: 'timestamp', updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

ActivityLogSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

const MongooseActivityLog = mongoose.model('AuthProviderActivityLog', ActivityLogSchema);

const ActivityLog = {
    log: async (appId, email, action) => {
        return await MongooseActivityLog.create({
            app_id: appId,
            email: email,
            action: action
        });
    },

    findByApp: async (appId, limit = 50) => {
        const logs = await MongooseActivityLog.find({ app_id: appId })
            .sort({ timestamp: -1 })
            .limit(limit);
            
        // Hydrate usernames to mimic SQL LEFT JOIN
        const emails = [...new Set(logs.map(l => l.email))];
        const AuthorizedUser = require('./AuthorizedUser');
        const users = await AuthorizedUser.MongooseModel.find({ 
            app_id: appId, 
            email: { $in: emails } 
        });
        
        const emailMap = {};
        users.forEach(u => {
            emailMap[u.email] = u.username;
        });
        
        return logs.map(log => {
            const obj = log.toObject({ virtuals: true });
            obj.username = emailMap[log.email] || null;
            return obj;
        });
    },

    findByUser: async (appId, email, limit = 100) => {
        const logs = await MongooseActivityLog.find({ app_id: appId, email: email })
            .sort({ timestamp: -1 })
            .limit(limit);
            
        // Hydrate username
        const AuthorizedUser = require('./AuthorizedUser');
        const user = await AuthorizedUser.MongooseModel.findOne({ app_id: appId, email: email });
        const username = user ? user.username : null;
        
        return logs.map(log => {
            const obj = log.toObject({ virtuals: true });
            obj.username = username;
            return obj;
        });
    }
};

module.exports = ActivityLog;
