const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(express.json());
app.use(cors());

const customers = require("./data/customers.json");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vqdm4bk.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
const carsCollection = client.db("carToys").collection("cars");
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect();

    const indexKeys = { toy_name: 1 };
    const indexOptions = { name: "toyName" };
    const result = await carsCollection.createIndex(indexKeys, indexOptions);
    app.get("/carSearchByToyName/:text", async (req, res) => {
      const searchText = req.params.text;
      const result = await carsCollection
        .find({
          $or: [{ toy_name: { $regex: searchText, $options: "i" } }],
        })
        .toArray();
      res.send(result);
    });

    app.get("/all-toys", async (req, res) => {
      const cursor = carsCollection.find().limit(20);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/all-toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const cursor = carsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/sub-categories", async (req, res) => {
      console.log(req.query);
      let query = {};
      if (req.query?.category) {
        query = { sub_category: req.query.category };
      }
      const result = await carsCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/new-addition", async (req, res) => {
      const query = { sub_category: "Sports Car" };
      const cursor = carsCollection.find(query).limit(5);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/my-toys/:email", async (req, res) => {
      const email = req.params.email;
      const query = { seller_email: email };
      const cursor = carsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/my-toys/ascending/:email", async (req, res) => {
      const email = req.params.email;
      const query = { seller_email: email };
      const cursor = carsCollection.find(query).sort({ price: 1 });
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/my-toys/descending/:email", async (req, res) => {
      const email = req.params.email;
      const query = { seller_email: email };
      const cursor = carsCollection.find(query).sort({ price: -1 });
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/add-toy", async (req, res) => {
      const car = req.body;
      car.price = parseFloat(req.body.price);
      car.rating = parseFloat(req.body.rating);
      car.available_quantity = parseFloat(req.body.available_quantity);
      const result = await carsCollection.insertOne(car);
      res.send(result);
    });

    app.put("/update-toy/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      body.price = parseFloat(req.body.price);
      body.rating = parseFloat(req.body.rating);
      body.available_quantity = parseFloat(req.body.available_quantity);
      const option = {
        upsert: true,
      };
      const filter = { _id: new ObjectId(id) };
      const toyData = {
        $set: {
          image: body.image,
          toy_name: body.toy_name,
          seller_name: body.seller_name,
          seller_email: body.seller_email,
          sub_category: body.sub_category,
          price: body.price,
          rating: body.rating,
          available_quantity: body.available_quantity,
          description: body.description,
        },
      };
      const result = await carsCollection.updateOne(filter, toyData, option);
      res.send(result);
    });

    app.delete("/my-toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await carsCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/customers", (req, res) => {
  res.send(customers);
});

app.get("/", (req, res) => {
  res.send("Assignment 11 server is running");
});
app.listen(port, () => {
  console.log(`Assignment 11 server is running on port: ${port}`);
});
