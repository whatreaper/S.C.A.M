const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

router.get('/daily-quote', async (req, res) => {
    try {
        const response = await fetch('https://api.api-ninjas.com/v1/quotes?category=fitness', {
            headers: {
                'X-Api-Key': process.env.QUOTES_API_KEY
            }
        });

        if (!response.ok) {
            throw new Error(`Error fetching quote: ${response.statusText}`);
        }

        const quotes = await response.json();
        res.json(quotes[0]); // Send the first quote in the response
    } catch (error) {
        console.error(error);
        res.status(500).json({
            quote: "Push yourself because no one else is going to do it for you."
        });
    }
});

module.exports = router;
