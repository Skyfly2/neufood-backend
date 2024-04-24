const express = require('express');
const router = express.Router();
const Pantries = require('../models/Pantries');
const Counter = require('../models/Counter');

// POST route to create a new pantry
router.post('/', async (req, res) => {
    try {
        // keep in mind when sending info collaborators/ingredients structure is an array of JSON. can be null, in which collaborators = [];
        /**
        let collaborators = [
            {"uid": "123123"},
            {"uid": "514124"},
            {"uid": "3452354"}
        ];
        let ingredients = [
            {"name": "123123", "category": "Chinese", "quantity": 10, "unitPrice": 2.5, "totalPrice": 25, "purchaseDate": new Date("11/22/23"), "expDate": new Date("11/22/25")},
            {"name": "6343", "category": "French", "quantity": 10, "unitPrice": 2.5, "totalPrice": 25, "purchaseDate": new Date("11/22/23"), "expDate": new Date("11/22/25")},
            {"name": "9999", "category": null, "quantity": 10, "unitPrice": 2.5, "totalPrice": 25, "purchaseDate": new Date("11/22/23"), "expDate": new Date("11/22/25")}
        ];
        */
        const { name, ownerId, collaborators, ingredients } = req.body; //extract name and description from request body

        //check if provided
        if (!name || !ownerId) {
            return res.status(400).json({error: 'Name of pantry and ownerId are required.'});
        }

        //generate unique pantryId
        const pantryId = await generateUniquePantryId();

        const pantry = new Pantries({
            pantryId: pantryId,
            name: name,
            ownerId: ownerId,
            collaborators: collaborators,
            ingredients: ingredients,
        });

        //save pantry to db
        const savedPantry = await pantry.save();

        // send saved pantry as response
        res.status(201).json(savedPantry);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error creating a new pantry' });
    }
});

// GET route to retrieve a pantry by pantryId => 
//      this would be used for all interaction for getting information from pantries.
//      Ex: want to display all ingredients in a pantry? GET by pantryId and sort through ingredients array.
//      "but thor how do we get the pantryIds???" they should be in a nice array in the user route :)
router.get('/:pantryId', async (req, res) => {
    try {
        const { pantryId } = req.params;
        
        //find pantry by pantryId
        const pantry = await Pantries.findOne(
            { pantryId }
        );

        //check if exists
        if (!pantry) {
            return res.status(404).json({ error: 'Pantry not found.'});
        }

        //send pantry as object as response
        res.json(pantry);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error fetching from pantry' });
    }
});

// DELETE route to delete pantry by pantryId
router.delete('/:pantryId', async (req, res) => {
    try {
        const { pantryId } = req.params;
        
        //find pantry by pantryId
        const deletedPantry = await Pantries.findOneAndDelete(
            { pantryId }
        );

        //check if exists
        if (!deletedPantry) {
            return res.status(404).json({ error: 'Pantry not found.'});
        }

        //send pantry as object as response
        res.json({ message: 'Pantry deleted successfully.', deletedPantry});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error deleting pantry' });
    }
});

// PUT route to add collaborator(s) to a pantry
// DELETE route to delete collaborator(s) from a pantry

// PUT route to add ingredient(s) to a pantry
//      takes in same structure of schema, array of ingredient objects
router.put('/:pantryId/addIngredients', async (req, res) => {
    try {
        const { pantryId } = req.params;
        const { ingredients } = req.body;

        //find pantry by pantryId
        const pantry = await Pantries.findOne(
            { pantryId }
        );

        // ensure pantry exists
        //check if exists
        if (!pantry) {
            return res.status(404).json({ error: 'Pantry not found.'});
        }

        //push to ingredients
        pantry.ingredients.push(...ingredients);

        //save updated
        const updatedPantry = await pantry.save();

        // send updated pantry as response
        res.status(201).json(updatedPantry);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE route to delete ingredient(s) from a pantry
//      takes in array of ingredient names (ex. ingredientNames = ["apple", "soy sauce"]; )
router.delete('/:pantryId/deleteIngredients', async (req, res) => {
    try {
        const { pantryId } = req.params;
        const { ingredientNames } = req.body;

        //find pantry by pantryId
        const pantry = await Pantries.updateOne(
            { pantryId },
            // use $pull to remove elements matching provided
            { $pull: { ingredients: {name: { $in: ingredientNames }}}},
            { new: true}
        );

        // ensure pantry exists
        //check if exists
        if (!pantry) {
            return res.status(404).json({ error: 'Pantry not found.'});
        }

        //save updated
        const updatedPantry = await pantry.save();

        // send updated pantry as response
        res.status(201).json(updatedPantry);
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

/**
 * Question: do we ever need to change the pantry, name, or ownerId of the pantry? no I don't think we let them change name of pantry
 */

module.exports = router;