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
    ssl: process.env.NODE_ENV === 'production' ? false : undefined,
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

// Comments API routes
app.get('/api/comments', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT Comments.id, Comments.content, Comments.created_at, Users.username
            FROM Comments
            JOIN Users ON Comments.user_id = Users.id
            ORDER BY Comments.created_at DESC;
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ message: 'Error fetching comments' });
    }
});

app.post('/api/comments', authenticateToken, async (req, res) => {
    const { content } = req.body;

    if (!content || content.trim() === '') {
        return res.status(400).json({ message: 'Comment content cannot be empty.' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO Comments (user_id, content) VALUES ($1, $2) RETURNING *;`,
            [req.user.id, content]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Error adding comment' });
    }
});

// Serve comments.html
app.get('/comments', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public/comments.html'));
});

// Example user authentication routes
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

        const userId = result.rows[0].id;
        const token = jwt.sign({ id: userId, username }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ message: 'User registered successfully', token });
    } catch (error) {
        console.error('Error in /register route:', error);
        res.status(500).json({ message: 'Error registering user' });
    }
});

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

        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Login successful', token, userId: user.id });
    } catch (error) {
        console.error('Error in /login route:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
});

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
        
        // Return token and userId
        res.json({ message: 'Login successful', token, userId: user.id });
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

//Workout Routes
app.get('/api/workout-groups', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM WorkoutGroups ORDER BY name');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching workout groups:', error);
        res.status(500).json({ message: 'Error fetching workout groups' });
    }
});

app.get('/api/workouts/:groupId', async (req, res) => {
    const { groupId } = req.params;

    try {
        const result = await pool.query(
            'SELECT * FROM Workouts WHERE group_id = $1 ORDER BY name',
            [groupId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching workouts:', error);
        res.status(500).json({ message: 'Error fetching workouts' });
    }
});

app.get('/api/workoutplans', authenticateToken, async (req, res) => {
    const userId = req.user.id;

    try {
        const result = await pool.query(
            'SELECT * FROM workoutplans WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching workout plans:', error);
        res.status(500).json({ message: 'Error fetching workout plans' });
    }
});

app.get('/api/random-workouts', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT name 
            FROM workouts 
            ORDER BY RANDOM() 
            LIMIT 5;
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching random workouts:', error);
        res.status(500).json({ message: 'Error fetching random workouts' });
    }
});


app.post('/api/workoutplans', authenticateToken, async (req, res) => {
    const userId = req.user.id; // Extracted from the token payload
    const { name, workoutIds } = req.body;

    try {
        // Insert the workout plan
        const planResult = await pool.query(
            'INSERT INTO workoutplans (user_id, name) VALUES ($1, $2) RETURNING id',
            [userId, name]
        );
        const planId = planResult.rows[0].id;

        // Insert associated workouts into the join table
        const values = workoutIds.map(workoutId => `('${planId}', '${workoutId}')`).join(',');
        await pool.query(
            `INSERT INTO workoutplanworkouts (plan_id, workout_id) VALUES ${values}`
        );

        res.status(201).json({ message: 'Workout plan created successfully!' });
    } catch (error) {
        console.error('Error creating workout plan:', error);
        res.status(500).json({ message: 'Error creating workout plan' });
    }
});

app.get('/api/workoutplans/:planId/workouts', authenticateToken, async (req, res) => {
    const { planId } = req.params;

    try {
        const result = await pool.query(
            `SELECT w.id, w.name, uwp.status
             FROM workoutplanworkouts wpw
             JOIN workouts w ON wpw.workout_id = w.id
             LEFT JOIN userworkoutprogress uwp 
             ON uwp.workout_id = w.id AND uwp.user_id = $1
             WHERE wpw.plan_id = $2`,
            [req.user.id, planId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching workouts for plan:', error);
        res.status(500).json({ message: 'Error fetching workouts for plan' });
    }
});


app.post('/api/workouts/progress', async (req, res) => {
    const { userId, workoutId, status } = req.body;

    const points = status === 'Done' ? 5 : status === 'In Progress' ? 3 : 0;

    try {
        const result = await pool.query(
            `
            INSERT INTO UserWorkoutProgress (user_id, workout_id, status, points)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (user_id, workout_id)
            DO UPDATE SET status = $3, points = $4, updated_at = CURRENT_TIMESTAMP
            RETURNING *;
            `,
            [userId, workoutId, status, points]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating workout progress:', error);
        res.status(500).json({ message: 'Error updating workout progress' });
    }
});

// Leaderboard Route
app.get('/api/leaderboard', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT username, total_points
            FROM users
            ORDER BY total_points DESC
            LIMIT 10;
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ message: 'Error fetching leaderboard' });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
 