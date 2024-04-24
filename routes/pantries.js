const express = require('express');
const router = express.Router();
const Pantries = require('../models/Pantries');
const Counter = require('../models/Counter');

// POST route to create a new pantry
router.post('/', async (req, res) => {
    try {
        const { name, ownerId } = req.body //extract name and description from request body

        //check if provided
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



//default
router.post('/', async (req, res) => {
    try {

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Function to generate a unique badgeId (thanks Mike)
async function generateUniquePantryId() {
    try {
        // Find and increment the counter for badges
        const counter = await Counter.findOneAndUpdate(
            { name: 'pantryIdCounter' },
            { $inc: { countVal: 1 } }, // Increment the counter value by 1
            { new: true, upsert: true } // Return the updated counter, create if not exists
        );
        return counter.countVal.toString(); // Use the value as the unique ID for the badge object
    } catch (error) {
        console.error('Error generating a unique pantry ID:', error);
        throw error;
    }
}