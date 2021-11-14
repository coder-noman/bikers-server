const express = require('express')
const { MongoClient } = require('mongodb');
const app = express()
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ckhjj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try{
        await client.connect();
        const database = client.db('Bike_Store')
        const bikesCollection = database.collection('bikesOrder');
        const productsCollection = database.collection('Products');
        const usersCollection = database.collection('users');
        const reviewCollection = database.collection('review');

        //GET API
        app.get('/Products', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.json(products);
        })

        app.get('/bikesOrder', async (req, res) => {
            const email = req.query.email;
            const query = {email: email}
            const cursor = bikesCollection.find(query);
            const orderedBike = await cursor.toArray();
            res.json(orderedBike);
        })

        app.get('/review', async (req, res) => {
            const cursor = reviewCollection.find({});
            const review = await cursor.toArray();
            res.json(review);
        })

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        //POST API
        app.post('/bikesOrder', async (req, res) => {
            const bikeOrderd = req.body;
            const result = await bikesCollection.insertOne(bikeOrderd);
            res.json(result)
        })
        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.json(result)
        })
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result)
        })

        app.post('/Products', async (req, res) => {
            const products = req.body;
            const result = await productsCollection.insertOne(products);
            res.json(result)
        })
        

        // PUT API
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        })

        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: {role: 'admin'}};
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })
    }
    finally{
        // await client.close();
    }
}

run().catch(console.dir);
app.get('/', (req, res) => {
  res.send('Hello Bikers!')
})

app.listen(port, () => {
  console.log(`Listening at ${port}`)
})