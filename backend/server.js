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

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Access token is missing" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid token" });
        }
        req.user = user;
        next();
    });
}


app.get('/profile', authenticateToken, (req, res) => {
    res.json({ message: 'Welcome to your profile!', user: req.user });
});

// CalorieNinjas API
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
        const { username, password } = req.body;

        // Basic validation
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required.' });
        }

        // Check if user already exists in the database
        const userCheck = await pool.query('SELECT * FROM Users WHERE username = $1', [username]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save the user to the database with username and password
        await pool.query(
            'INSERT INTO Users (username, password) VALUES ($1, $2)',
            [username, hashedPassword]
        );

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error in /register route:', error);
        res.status(500).json({ message: 'Error registering user' });
    }
});

app.get('/api/user', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id; // Assuming user ID is in the JWT token
        const result = await pool.query('SELECT username FROM users WHERE id = $1', [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = result.rows[0];
        res.json({ username: user.username });
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ message: 'Error fetching user data' });
    }
});



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
