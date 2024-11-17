// Import required packages
const express = require('express');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const quoteRoutes = require('./routes/quotes');

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
app.use('/api', quoteRoutes);

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

// ExerciseDB API
let exerciseDBBaseUrl = process.env.exercise_api_url; // use this to make requests

app.get("/exercises", (req, res) => {
    let exercise = req.query.search;
    let amount = req.query.limit;
    let offset = req.query.offset;

    if (!typeof exercise === 'undefined') {
        exercise = '';
    }

    function isNumber(str) { return !isNaN(str) && !isNaN(parseFloat(str)); }

    if( !isNumber(amount) || typeof amount === 'undefined') {
        amount = 10;
    }

    offset = parseInt(offset);

    let url = `${exerciseDBBaseUrl}?search=${exercise}&offset=${offset}&limit=${amount}`;
    
    console.log(`Url : ${url}`);

    axios(url)
        .then(response => {
            console.log("API response received");
            console.log("Response status:", response.status);
            res.json(response.data);
        })
        .catch(error => {
            console.error("Error fetching exercises:", error.message);
            res.status(error.response.status).json({ error: error.response.data.message });
        });
    console.log("Request sent to API");
});

let databaseOffset = 0;

async function axiosExercise(url) {
    try {
        const response = await axios.get(url);
        console.log("API response received");
        console.log("Response status:", response.status);
        return response.data;
    } catch (error) {
        console.error("Error fetching exercises:", error.message);
        throw error;
    }
}

async function getDataAndRespond(url, req, res) {
    try {
        let data = await axiosExercise(url);
        res.json(data);
    } catch (error) {
        res.status(error.response.status).json({ error: error.response.data.message });
    }
}

app.get("/addExercises", (req, res) => {
    let exercise = '';
    let amount = 100;

    let url = `${exerciseDBBaseUrl}?search=${exercise}&offset=${databaseOffset}&limit=${amount}`;
    console.log(`Url: ${url}`);
    console.log(`Current Offset: ${databaseOffset}`);
    databaseOffset += 100;

    getDataAndRespond(url, req, res);

    return;
   

});

// Endpoint to add exercises to the database
app.post("/add", (req, res) => {
    let {
        exerciseId,
        exerciseName,
        exercise_gif_url,
        exerciseInstructions,
        exercise_muscle,
        exercise_body_part,
        exercise_equipments,
        exercise_secondary_muscles
    } = req.body;

    try {
        let text = 'INSERT INTO exercises (exercise_id, exercise_name, gif_url, instructions, target_muscles, body_parts, equipments, secondary_muscle) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *';
        let values = [exerciseId, exerciseName, exercise_gif_url, exerciseInstructions, exercise_muscle, exercise_body_part, exercise_equipments, exercise_secondary_muscles];

        pool.query(text, values)
            .then(result => {
                console.log("Exercise added:", result.rows[0]);
                res.json(result.rows[0]);
            })
            .catch(err => {
               // console.error("Error inserting exercise:", err.stack);
                res.status(500).json({ error: "Error inserting exercise" });
            });
    } catch (err) {
        console.error(err.stack);
        res.status(500).json({ error: "Error inserting exercise" });
    }
});


// CalorieNinjas API Route
app.get('/api/nutrition', async (req, res) => {
    try {
        const query = req.query.search || ''; // Default to empty string if undefined

        if (query.trim() === '') {
            return res.status(400).json({ message: 'Search query cannot be empty.' });
        }

        // Construct the CalorieNinja API URL without limit and offset
        const url = `https://api.calorieninjas.com/v1/nutrition?query=${encodeURIComponent(query)}`;

        console.log(`Fetching from CalorieNinja API: ${url}`);

        const response = await axios.get(url, {
            headers: {
                'X-Api-Key': process.env.CALORIENINJA_API_KEY,

            },
        });

        if (response.data && response.data.items) {
            res.json(response.data.items);
        } else {
            res.status(404).json({ message: 'No nutritional information found.' });
        }
    } catch (error) {
        console.error('Error fetching from CalorieNinja API:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            res.status(error.response.status).json({ message: error.response.data.message || 'Error fetching nutritional data.' });
        } else {
            res.status(500).json({ message: 'Internal server error.' });
        }
    }
});

// Registration Route
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required.' });
        }

        const userCheck = await pool.query('SELECT * FROM Users WHERE username = $1', [username]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO Users (username, password) VALUES ($1, $2) RETURNING id',
            [username, hashedPassword]
        );

        const userId = result.rows[0].id;  // Get the user's id

        // Generate token with user id
        const token = jwt.sign({ id: userId, username: username }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ message: 'User registered successfully', token });
    } catch (error) {
        console.error('Error in /register route:', error);
        res.status(500).json({ message: 'Error registering user' });
    }
});

//Login Route
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required.' });
        }

        const userResult = await pool.query('SELECT * FROM Users WHERE username = $1', [username]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({ message: 'User does not exist' });
        }

        const user = userResult.rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Generate token with user id
        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Error in /login route:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
});



app.get('/api/user', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query('SELECT username FROM users WHERE id = $1', [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ username: result.rows[0].username });
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ message: 'Error fetching user data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
