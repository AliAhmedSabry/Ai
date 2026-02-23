import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./db.js";
import StudyProfile from "./models/Study.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/save-study", async (req, res) => {
    try {
        const { age, subjects } = req.body;

        if (!age || !subjects) {
            return res.status(400).json({ error: "Missing data" });
        }

        const newProfile = new StudyProfile({
            age,
            subjects,
        });

        await newProfile.save();

        res.json({ message: "Study profile saved successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

app.listen(4000, () => console.log("Server running on port 4000"));
