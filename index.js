require("dotenv").config();
const uri = process.env.MONGODB_URI;
const port = process.env.PORT || 3000;

const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();

//middleware
app.use(cors());
app.use(express.json());

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  tls: true,
});

async function run() {
  try {
    await client.connect();

    const db = client.db("traveleaseDB");
    const vehiclesCollection = db.collection("vehicles");

    app.get("/vehicles", async (req, res) => {
      const cursor = vehiclesCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/vehicles/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await vehiclesCollection.findOne(query);
      res.send(result);
    });

    app.post("/vehicles", async (req, res) => {
      const newVehicles = req.body;
      const result = await vehiclesCollection.insertOne(newVehicles);
      res.send(result);
    });

    app.patch("/vehicles/:id", async (req, res) => {
      const id = req.params.id;
      const updatedVehicle = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          name: updatedVehicle.name,
          price: updatedVehicle.price,
        },
      };

      const result = await vehiclesCollection.updateOne(query, update);
      res.send(result);
    });

    app.delete("/vehicles/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await vehiclesCollection.deleteOne(query);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("TravelEase server is running");
});

app.listen(port, () => {
  console.log(`TravelEase server is running on port: ${port}`);
});
