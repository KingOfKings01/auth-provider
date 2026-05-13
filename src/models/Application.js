const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ApplicationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    app_id: { type: String, required: true, unique: true },
    api_key: { type: String, required: true },
    status: { type: String, default: 'active' }
}, { 
    collection: 'auth_provider_applications',
    timestamps: { createdAt: 'created_at', updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

ApplicationSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

const MongooseApplication = mongoose.model('AuthProviderApplication', ApplicationSchema);

const Application = {
    create: async (name, description) => {
        const appId = uuidv4();
        const apiKey = require('crypto').randomBytes(24).toString('hex');
        
        const doc = await MongooseApplication.create({
            name,
            description,
            app_id: appId,
            api_key: apiKey
        });
        
        // Exactly match previous SQL response interface: { id, appId, apiKey }
        return { id: doc._id.toString(), appId, apiKey };
    },

    findAll: async () => {
        const docs = await MongooseApplication.find().sort({ created_at: -1 });
        return docs.map(doc => doc.toObject({ virtuals: true }));
    },

    findById: async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;
        const doc = await MongooseApplication.findById(id);
        return doc ? doc.toObject({ virtuals: true }) : null;
    },

    findByAppId: async (appId) => {
        const doc = await MongooseApplication.findOne({ app_id: appId });
        return doc ? doc.toObject({ virtuals: true }) : null;
    },

    updateStatus: async (id, status) => {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;
        return await MongooseApplication.findByIdAndUpdate(id, { status });
    },

    delete: async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;
        return await MongooseApplication.findByIdAndDelete(id);
    },
    
    MongooseModel: MongooseApplication
};

module.exports = Application;
