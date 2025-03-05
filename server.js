const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS (Allow all origins for now)
app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies

// MongoDB connection string
const MONGODB_URI = "mongodb+srv://sriram:sri8248950703@movies.q0bqf.mongodb.net/movies?retryWrites=true&w=majority&appName=movies";
//const MONGODB_URI = "mongodb+srv://sriram:sri8248950703@movies.q0bqf.mongodb.net/?retryWrites=true&w=majority&appName=movies"

console.log("Connecting to MongoDB...");
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB Atlas successfully"))
  .catch(err => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1); // Exit if DB connection fails
  });

// Define Movie Schema
const movieSchema = new mongoose.Schema({
  title: String,
  year: Number,
  cast: [String],
  genres: [String],
}, { strict: false });

const Movie = mongoose.model("Movie", movieSchema);

// Root Route
app.get("/", (req, res) => {
  res.json({ status: "✅ Server is running" });
});

// Movies API with Pagination & Search
app.get("/api/movies", async (req, res) => {
  try {
    console.log("📥 Request received at /api/movies");
    
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    // Build comprehensive filter query
    const query = {};

    // Language filter
    if (req.query.language) {
      query.original_language = req.query.language;
    }

    // Minimum rating filter
    if (req.query.minRating) {
      query.average_rating = { $gte: parseFloat(req.query.minRating) };
    }

    // Adult content filter
    if (req.query.adult !== undefined) {
      query.adult = req.query.adult === 'true';
    }

    // Country filter (case-insensitive, partial match)
    if (req.query.country) {
      query.production_countries = { 
        $regex: req.query.country, 
        $options: 'i' 
      };
    }

    // Release year filter (with ±3 years flexibility)
    if (req.query.year) {
      const year = parseInt(req.query.year);
      query.release_date = { 
        $gte: new Date(year - 3, 0, 1),
        $lte: new Date(year + 3, 11, 31)
      };
    }

    // Runtime filter (with ±15 minutes flexibility)
    if (req.query.runtime) {
      const runtime = parseInt(req.query.runtime);
      query.runtime = { 
        $gte: runtime - 15, 
        $lte: runtime + 15 
      };
    }

    // Genre filter (case-insensitive, partial match)
    if (req.query.genre) {
      query.genres = { 
        $regex: req.query.genre, 
        $options: 'i' 
      };
    }

    // Sorting options
    const sortOptions = {
      rating: { average_rating: -1 },
      title: { title: 1 },
      release_date: { release_date: -1 },
      runtime: { runtime: -1 }
    };

    // Default sort by rating if not specified
    const sortBy = req.query.sortBy || 'rating';
    const sort = sortOptions[sortBy] || sortOptions.rating;

    // Count total matching documents based on the query
    const total = await Movie.countDocuments(query);
    console.log(`📊 Total matching movies: ${total}`);

    // Fetch paginated and filtered results
    const movies = await Movie.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    console.log(`📤 Returning ${movies.length} movies`);
    
    res.json({
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      movies
    });
  } catch (error) {
    console.error("❌ Error in /api/movies:", error);
    res.status(500).json({ error: "Failed to load data", details: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
