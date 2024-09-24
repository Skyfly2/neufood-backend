const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema({
    
    uid: { type: String, unique: true }, // Ensure unique user ID, can be generated by us or Google OAuth
    name: String, // Name, can be retrieved from google oauth sign in, or created by user on account create page
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true, // Automatically converts email to lowercase
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'], // Basic regex to ensure valid email format
    },
    password: {
        type: String,
        minlength: 8, // Password must be at least 8 characters
    },

    badges: [{ // array of badges the user will have displayed on their profile - ID will correspond to badge object
        badgeId: String,
        dateAchieved: Date,
    },],

    allergies: [{ // array of allergies the user will have displayed on their profile - ID will correspond to allergy object
        allergyId: String,
    },],

    pantries: [{ // array of allergies the user will have attached to their profile - ID will correspond to pantry object
        pantryId: String,
    },],

    friends: [{ // array of friends the user will have attached to their profile - ID will correspond to user object
        uid: String,
    },],

});

// Index the uid and email fields for faster lookups
usersSchema.index({ uid: 1 });  // Index uid in ascending order
usersSchema.index({ email: 1 });  // Index email in ascending order

const Users = mongoose.model('Users', usersSchema);

module.exports = Users;