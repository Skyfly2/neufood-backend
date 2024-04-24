const express = require('express');
const router = express.Router();
const Pantries = require('../models/Pantries');
const Counter = require('../models/Counter');

//Note: Gave an example for the respective route, what we would have to send via the frontend in order to properly hit the route. 

// POST route to create a new pantry
router.post('/', async (req, res) => {
    try {
/*keep in mind when sending info collaborators/ingredients structure is an array of JSON in proper structure. can be null
curl -X POST -H "Content-Type: application/json" -d '{
                "name": "ThorPantry",
                "ownerId": "12345",
                "collaborators": [{"uid": "123123"},{"uid": "514124"},{"uid": "3452354"}],
                "ingredients": [{"name": "123123", "category": "Chinese", "quantity": 10, "unitPrice": 2.5, "totalPrice": 25, "purchaseDate": "2023-11-22", "expDate": "2025-11-22"},
                  {"name": "6343", "category": "French", "quantity": 10, "unitPrice": 2.5, "totalPrice": 25, "purchaseDate": "2023-11-22", "expDate": "2025-11-22"},
                  {"name": "9999", "category": null, "quantity": 10, "unitPrice": 2.5, "totalPrice": 25, "purchaseDate": "2023-11-22", "expDate": "2025-11-22"}]
}' http://localhost:8080/pantries/
*/
        const { name, ownerId, collaborators, ingredients } = req.body; //extract name and description from request body. Format above

        //check if provided
        if (!name || !ownerId) {
            return res.status(400).json({error: 'Name of pantry and ownerId are required.'});
        }

        //generate unique pantryId
        const pantryId = await generateUniquePantryId();

        // creates new pantry using mongoose Pantries schema, null values allowed but incorrect types are not 
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
        // oh no!
        console.error(error);
        res.status(500).json({ error: 'Internal server error creating a new pantry' });
    }
});

// GET route to retrieve a pantry by pantryId => 
//      this would be used for all interaction for getting information from pantries.
//      Ex: want to display all ingredients in a pantry? GET by pantryId and sort through JSON response for the ingredients array.
//      "but thor how do we get the pantryIds???" they should be in a nice array in the user route :)
router.get('/:pantryId', async (req, res) => {
    try {
/*
curl -X GET -H "Content-Type: application/json" -d '' http://localhost:8080/pantries/1
*/
        // did you know... req.params comes from /:pantryId, and req.body comes from '' above?
        const { pantryId } = req.params;
        
        //find pantry by pantryId
        const pantry = await Pantries.findOne(
            { pantryId }
        );

        //check if exists
        if (!pantry) {
            return res.status(404).json({ error: 'Pantry not found.'});
        }

        //send pantry as JSON object as response
        res.json(pantry);
    } catch (error) {
        // oh no x9
        console.error(error);
        res.status(500).json({ error: 'Internal server error fetching from pantry' });
    }
});

// DELETE route to delete pantry by pantryId
router.delete('/:pantryId', async (req, res) => {
    try {
/*
curl -X DELETE -H "Content-Type: application/json" -d '' http://localhost:8080/pantries/1
*/
        const { pantryId } = req.params;
        
        //find pantry by pantryId and then delete it. Note that this returns an instance of the previously deleted pantry in deletedPantry, so we can do the existance checking below
        const deletedPantry = await Pantries.findOneAndDelete(
            { pantryId }
        );

        //check if exists (as previously mentioned)
        if (!deletedPantry) {
            return res.status(404).json({ error: 'Pantry not found.'});
        }

        //send deleted pantry as object as response
        res.json({ message: 'Pantry deleted successfully.', deletedPantry});
    } catch (error) {
        // default error oh no wow what a surprise
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
/*
curl -X PUT -H "Content-Type: application/json" -d '{
    "ingredients": [{"name": "9999", "category": "Nut", "quantity": 10, "unitPrice": 2.5, "totalPrice": 25, "purchaseDate": "2023-11-22", "expDate": "2025-11-22"},
                  {"name": "Cashew", "category": "Nut", "quantity": 10, "unitPrice": 2.5, "totalPrice": 25, "purchaseDate": "2023-11-22", "expDate": "2025-11-22"}]
}' http://localhost:8080/pantries/4/addIngredients
*/
        const { pantryId } = req.params;
        const { ingredients } = req.body;

        //find pantry by pantryId
        const pantry = await Pantries.findOne(
            { pantryId }
        );

        //check if exists
        if (!pantry) {
            return res.status(404).json({ error: 'Pantry not found.'});
        }

        //append (push) the new array to ingredients array in pantries.
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
//      takes in array of ingredient names (ex. ingredientNames = ["9999", "Cashew"]; )
router.delete('/:pantryId/deleteIngredients', async (req, res) => {
    try {
/*
curl -X DELETE -H "Content-Type: application/json" -d '{
    "ingredientNames": ["9999", "Cashew"]
}' http://localhost:8080/pantries/4/deleteIngredients
*/
        const { pantryId } = req.params;
        const { ingredientNames } = req.body;

        //find pantry by pantryId
        const pantry = await Pantries.updateOne(
            { pantryId },
            // use $pull to remove elements matching any name in ingredientNames array
            { $pull: { ingredients: {name: { $in: ingredientNames }}}},
            { new: true}
        );

        //check if exists
        if (!pantry) {
            return res.status(404).json({ error: 'Pantry not found.'});
        }

        // send updated pantry update params as response
        res.status(201).json(pantry);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//default route structure and error catching
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