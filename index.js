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
    // await client.connect();

    const db = client.db("traveleaseDB");
    const vehiclesCollection = db.collection("vehicles");
    const BooksCollection = db.collection("bookingsCollection");

    app.get("/vehicles", async (req, res) => {
      console.log(req.query);
      const email = req.query.userEmail;
      const query = {};
      if (email) {
        query.userEmail = email;
      }
      const cursor = vehiclesCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/vehicles/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await vehiclesCollection.findOne(query);
        if (!result)
          return res.status(404).json({ message: "Vehicle not found" });
        res.json(result);
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch vehicle" });
      }
    });

    app.get("/latest-vehicles", async (req, res) => {
      const cursor = vehiclesCollection.find().sort({ createdAt: -1 }).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/vehicles", async (req, res) => {
      const newVehicles = req.body;
      const result = await vehiclesCollection.insertOne(newVehicles);
      res.send(result);
    });
    app.patch("/vehicles/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updatedVehicle = req.body;

        if (updatedVehicle.owner) {
          updatedVehicle.ownerName = updatedVehicle.owner;
          delete updatedVehicle.owner;
        }

        const query = { _id: new ObjectId(id) };
        const update = { $set: updatedVehicle };

        const result = await vehiclesCollection.updateOne(query, update);
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update vehicle" });
      }
    });

    app.delete("/vehicles/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await vehiclesCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/bookings", async (req, res) => {
      try {
        const email = req.query.userEmail;
        const query = email ? { userEmail: email } : {};
        const bookings = await BooksCollection.find(query).toArray();
        res.json(bookings);
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch bookings" });
      }
    });
    app.post("/bookings", async (req, res) => {
      try {
        const bookingData = req.body;

        if (!bookingData.createdAt) {
          bookingData.createdAt = new Date().toISOString();
        }

        const result = await BooksCollection.insertOne(bookingData);
        if (result.insertedId) {
          res.status(201).json({ insertedId: result.insertedId });
        } else {
          res.status(500).json({ message: "Failed to create booking" });
        }
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error creating booking" });
      }
    });
    // await client.db("admin").command({ ping: 1 });
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
