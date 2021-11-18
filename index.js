const express = require('express')
const app = express();
require('dotenv').config()
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.clft1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });




async function run(){ 

    try{
        await client.connect(); 
        const database = client.db('SunglassHut');
        const productsCollection = database.collection('products'); 
        const usersCollection = database.collection('users');
        const orderCollection = database.collection('orders');
        const reviewCollection = database.collection('reviews');



        app.get('/products',  async(req, res) => {
            const cursor  = productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        })
 
        app.post('/users', async(req, res) => {
          const user = req.body; 
          const result = await usersCollection.insertOne(user)
          res.json(result);
        });

        app.put('/users', async(req, res) => {
          const user = req.body;
          const filter = {email: user.email};
          const options = { upsert: true };
          const updateDoc = {$set:user};
          const result = await usersCollection.updateOne(filter, updateDoc, options);
          res.json(result)
        })  
        app.get('/users/:email', async(req, res) => {
          const email = req.params.email;
          const query = { email: email };
          const user = await usersCollection.findOne(query);
          let isAdmin = false;
          if(user?.role === 'admin'){
              isAdmin= true;
          }
          res.json({admin: isAdmin})
        })


        app.post('/myorder', async(req, res) => {
          const order = req.body;
          const result = await orderCollection.insertOne(order);
          console.log(result);
          res.json(result);
        });
 
        app.get('/order/:email', async(req, res) => {
          console.log(req.params.email)
          const query = {email: req.params.email};
          const result = await orderCollection.find({email:  req?.params?.email}).toArray();
           res.json(result);
        });

        app.delete('/order/:id', async (req, res) => {
          const id = req.params.id;
          console.log(id)
          const query = { _id: ObjectId(id) };
          const result = await orderCollection.deleteOne(query);
          console.log('deleting user with id', id);
          res.json(result);
        });

        app.get('/orders', async(req, res) => {
          const cursor = orderCollection.find({})
          const result = await cursor.toArray();
          res.send(result);  
        }) ;
        app.delete('/orders/:id', async (req, res) => {
          const id = req.params.id;
          const query = { _id: ObjectId(id) };
          const result = await orderCollection.deleteOne(query);
          res.json(result);
        });
        app.put('/users/admin', async(req, res) => {
          const user = req.body;
          const filter = {email: user.email};
          const updateDoc = {$set: { role: 'admin' }};
          const result = await usersCollection.updateOne(filter, updateDoc);
          res.json(result);
        });

        app.post('/products', async(req, res) => {
          const product = req.body;
          const result = await productsCollection.insertOne(product)
          res.json(result)
        });

        app.post('/review', async(req, res) => {
          const review = req.body;
          const result = await reviewCollection.insertOne(review)
          res.json(result)
        });
         app.get('/review', async(req, res) => {
          const cursor = reviewCollection.find({})
          const result = await cursor.toArray();
          res.send(result);  
        }) ;

         app.delete('/products/:id', async (req, res) => {
          const id = req.params.id;
          const query = { _id: ObjectId(id) };
          const result = await productsCollection.deleteOne(query);
          res.json(result);
        });

    }
    finally{
        await client.close();
    }

}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Hello SunglassHub')
})

app.listen(port, () => {
  console.log(`listening at:${port}`)
})