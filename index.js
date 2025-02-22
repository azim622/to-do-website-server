const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

app.use(cors());
app.use(express.json());

// Database credentials
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tu2ve.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const taskFlowCollection = client.db("task-management").collection("task");

    app.post("/task", async (req, res) => {
      const task = req.body;
      if (!task.email) {
        return res.status(400).json({ success: false, message: "User email is required" });
      }
      const result = await taskFlowCollection.insertOne(task);
      res.send(result);
    });

    app.get("/tasks", async (req, res) => {
      const { email } = req.query;
      if (!email) {
        return res.status(400).json({ success: false, message: "User email is required" });
      }
      const tasks = await taskFlowCollection.find({ email }).toArray();
      res.send(tasks);
    });

    // Update task
    app.put("/task/:id", async (req, res) => {
      const { id } = req.params;
      const updatedTask = req.body;
      const result = await taskFlowCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedTask }
      );
      res.send(result);
    });

    // Delete task
    app.delete("/task/:id", async (req, res) => {
      const id = req.params.id;
      try {
        const query = { _id: new ObjectId(id) };
        const result = await taskFlowCollection.deleteOne(query);
        if (result.deletedCount === 1) {
          res.send({ success: true, message: "Task deleted successfully" });
        } else {
          res.status(404).send({ success: false, message: "Task not found" });
        }
      } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).send({ success: false, message: "Internal server error" });
      }
    });

    await client.connect();
    console.log("✅ Successfully connected to MongoDB!");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
  }
}

run();

app.get("/", (req, res) => {
  res.send("Make a to-do website");
});

app.listen(port, () => {
  console.log(`To-do website running at: ${port}`);
});
