import mongoose from 'mongoose';

let isConnected: boolean = false;

export const connectToDatabase = async () => {
    // strictQuery: true: This setting ensures that Mongoose
    // only includes properties in query filters that are defined
    // in the Mongoose schema. If you attempt to query using a
    // property that isn't defined in your schema, 
    // Mongoose will strip out that part of the query filter.
    mongoose.set('strictQuery', true);

    if (!process.env.MONGODB_URL) {
        return console.log('MISSING MONGODB_URL');
    }

    if (isConnected) {
        return console.log('ALREADY CONNECTED TO MONGODB');
    }

    try {
        await mongoose.connect(process.env.MONGODB_URL, {
            dbName: 'devflow',
        });

        isConnected = true;
        console.log('CONNECTED TO MONGODB DATABASE');
    } catch (e) {
        console.error('MongoDB connection failed', e);
    }
};
