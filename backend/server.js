// Import required packages
const express = require('express');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const path = require('path');


const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection error', err.stack);
    } else {
        console.log('Connected to database:', res.rows[0]);
    }
});

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/public')));
app.use('/frontend/src', express.static(path.join(__dirname, '../frontend/src')));




// Middleware to verify JWT token
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'Access token is missing' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
}

app.get('/profile', authenticateToken, (req, res) => {
    res.json({ message: 'Welcome to your profile!', user: req.user });
});

// ExerciseDB API
app.get("/exercises", (req, res) => {

    let url = 'https://exercisedb-api.vercel.app/api/v1/exercises';
  
    axios(url).then(response => {
      console.log("API response received"); 
      console.log("Response status:", response.status);
      console.log("Response data:", response.data);
  
      res.json(response.data);
  
    }).catch(error => {
      console.log("Error Response status:", error.response.status);
      console.log("Error Response data:", error.response.data);
      console.log(error.response.data.message);
      res.status(error.response.status)
      res.json({error: error.response.data.message});
  
    });
    console.log("Request sent to API"); 
  
  });

//CalorieNinjas API
app.get('/api/nutrition', authenticateToken, async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ message: 'Query parameter is required' });
    }

    try {
        // Fetch data from CalorieNinja API
        const response = await axios.get('https://api.calorieninjas.com/v1/nutrition', {
            headers: {
                'X-Api-Key': process.env.CALORIENINJA_API_KEY,
                'Content-Type': 'application/json',
            },
            params: { query },
        });

        if (response.data && response.data.items) {
            const nutritionalData = response.data.items;

            // Insert search history into the database
            const userId = req.user.id;
            const searchHistoryResult = await pool.query(
                'INSERT INTO SearchHistory (user_id, query, timestamp) VALUES ($1, $2, $3) RETURNING id',
                [userId, query, new Date()]
            );
            const searchHistoryId = searchHistoryResult.rows[0].id;

            // Insert each nutrition item into NutritionData table
            for (const item of nutritionalData) {
                await pool.query(
                    'INSERT INTO NutritionData (search_history_id, name, calories, fat_total_g, carbohydrates_total_g, fiber_g, protein_g, sodium_mg, sugar_g, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
                    [
                        searchHistoryId,
                        item.name,
                        item.calories,
                        item.fat_total_g,
                        item.carbohydrates_total_g,
                        item.fiber_g,
                        item.protein_g,
                        item.sodium_mg,
                        item.sugar_g,
                        new Date(),
                    ]
                );
            }

            res.json(nutritionalData);
        } else {
            res.status(404).json({ message: 'No nutritional information found' });
        }
    } catch (error) {
        console.error('Error fetching nutritional data:', error.message);
        res.status(500).json({ message: 'Error fetching nutritional data' });
    }
});


// Registration Route
app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body; // Include email

        // Basic validation
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Username, email, and password are required.' });
        }

        // Check if user already exists in the database
        const userCheck = await pool.query('SELECT * FROM Users WHERE username = $1', [username]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Optionally, check if email is already registered
        const emailCheck = await pool.query('SELECT * FROM Users WHERE email = $1', [email]);
        if (emailCheck.rows.length > 0) {
            return res.status(400).json({ message: 'Email is already registered' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save the user to the database with username, email, and password_hash
        await pool.query(
            'INSERT INTO Users (username, email, password_hash) VALUES ($1, $2, $3)',
            [username, email, hashedPassword]
        );

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error in /register route:', error);
        res.status(500).json({ message: 'Error registering user' });
    }
});




// Login Route
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Basic validation
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required.' });
        }

        // Find user in the database
        const userResult = await pool.query('SELECT * FROM Users WHERE username = $1', [username]);
        const user = userResult.rows[0];

        if (!user) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        // Check if password matches with password_hash
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        // Generate JWT
        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
});




app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
