import mongoose from "mongoose";

// Connect to MongoDB
const connectDb = async () => {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect("mongodb://localhost:27017/issuesdb", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

// Define the Issue model
const Issue = mongoose.models.Issue || mongoose.model("Issue", new mongoose.Schema({
  description: String,
  type: String,
  priority: Number,
  status: { type: String, default: "Open" },
}));

/**
 * @swagger
 * /api/submit-issue:
 *   post:
 *     summary: Submit a new issue
 *     description: Creates a new issue entry in the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 example: "Application crashes on login"
 *               type:
 *                 type: string
 *                 example: "Bug"
 *               priority:
 *                 type: number
 *                 example: 1
 *     responses:
 *       201:
 *         description: Issue submitted successfully
 *       400:
 *         description: All fields are required
 *       500:
 *         description: Server error
 */
export default async function handler(req, res) {
  if (req.method === "POST") {
    const { description, type, priority } = req.body;

    // Validate the input
    if (!description || !type || !priority) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    // Connect to the database
    await connectDb();

    try {
      // Create a new issue document
      const newIssue = new Issue({
        description,
        type,
        priority,
      });
      await newIssue.save();
      return res.status(201).json({ message: "Issue submitted successfully!" });
    } catch (error) {
      console.error("Error saving issue:", error);
      return res.status(500).json({ message: "Server error" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}