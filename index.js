const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

const port = process.env.PORT
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const dbname = process.env.DB_NAME;
const productCollection = process.env.DB_PRODUCT_COLLECTION;
const orderCollection = process.env.DB_ORDER_COLLECTION;

const uri = `mongodb+srv://${user}:${password}@cluster0.ou4zy.mongodb.net/${dbname}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    const productsCollection = client.db(dbname).collection(productCollection);
    const ordersCollection = client.db(dbname).collection(orderCollection);

    app.post('/addProduct', (req, res) => {
        const products = req.body;

        productsCollection.insertMany(products)
            .then(result => {
                console.log(result.insertedCount);
                res.send(result.insertedCount);
            });

    });

    app.get('/products', (req, res) => {
        productsCollection.find({}).limit(20)
            .toArray((err, documents) => {
                res.send(documents);
            });
    });

    app.get('/product/:key', (req, res) => {
        productsCollection.find({ key: req.params.key })
            .toArray((err, document) => {
                res.send(document[0]);
            });
    });

    app.post('/productByKeys', (req, res) => {
        const productKeys = req.body;
        productsCollection.find({ key: { $in: productKeys } })
            .toArray((err, documents) => {
                res.send(documents);
            });
    });

    app.post('/addOrder', (req, res) => {
        const order = req.body;

        ordersCollection.insertOne(order)
            .then(result => {
                console.log(result.insertedCount);
                res.send(result.insertedCount > 0);
            });
    });

});

app.listen(port);