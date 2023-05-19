const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(express.json());
app.use(cors());

// assignment-11
// Ff11pONh9MC1h5jX

const uri =
  "mongodb+srv://assignment-11:Ff11pONh9MC1h5jX@cluster0.vqdm4bk.mongodb.net/?retryWrites=true&w=majority";

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
    await client.connect();

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
    app.get("/regular-cars", async (req, res) => {
      const query = { sub_category: "Regular Cars" };
      const cursor = carsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/sports-car", async (req, res) => {
      const query = { sub_category: "Sports Car" };
      const cursor = carsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/fire-trucks", async (req, res) => {
      const query = { sub_category: "Mini Fire Trucks" };
      const cursor = carsCollection.find(query);
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

    app.post("/add-toy", async (req, res) => {
      const car = req.body;
      const result = await carsCollection.insertOne(car);
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

app.get("/", (req, res) => {
  res.send("Assignment 11 server is running");
});
app.listen(port, () => {
  console.log(`Assignment 11 server is running on port: ${port}`);
});
