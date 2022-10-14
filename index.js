const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const res = require('express/lib/response');
require('dotenv').config();

const port = process.env.PORT || 5000;

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Default API
app.get('/', (req, res) => {
    res.send('FurniCorner Server is running!');
});

// Connect to MongoDB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hcjatm5.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const productCollection = client.db('furniCorner').collection('products');
        
        // APIs
        app.get('/products', async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });

        // Single product api
        app.get('/product/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await productCollection.findOne(query);
            res.send(result);
        })

        // Multiple Product API
        app.get('/products/:email', async(req, res) => {
            const email = req.params.email;
            const query = {email: email};
            const cursor = productCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        // Post API
        app.post('/products', async (req, res) => {
            const newProduct = req.body;
            const result = await productCollection.insertOne(newProduct);
            res.send(result);
        })

        // Update
        app.put('/product/:id', async(req, res) => {
            const id = req.params.id;
            const updatedProduct = req.body;
            const filter = {_id: ObjectId(id)};
            const options = { upsert : true };
            const updateDoc = {
                $set: {
                    name : updatedProduct.name,
                    imageUrl : updatedProduct.imageUrl,
                    description : updatedProduct.description,
                    price : updatedProduct.price,
                    quantity : updatedProduct.quantity,
                    supplier : updatedProduct.supplier
                },
            };
            const result = await productCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })

        // Delete API
        app.delete('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await productCollection.deleteOne(query);
            res.send(result);
        })

        
    
    }
    finally {

    }
}

run();



app.listen(port, () => {
    console.log('Listening to port', port);
});
