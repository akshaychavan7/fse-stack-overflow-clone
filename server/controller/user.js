const express = require("express");
const User = require("../models/users");

const { preprocessing } = require("../utils/textpreprocess")

const authorization = require("../middleware/authorization");

const router = express.Router();

const ownUserDetails = async (req, res) => {
    try {
        let user = await User.findOne({ _id: preprocessing(req.userId) });
        // add authorization instead of this and authentication based on that.
        if (!user) {
            res.status(401).json({ error: `User not authorized.` });
        }
        let udetails = {
            username: user['username'],
            firstname: user['firstname'],
            lastname: user['lastname'],
            joiningDate: user['joiningDate'],
            profilePic: user['profilePic'],
            userRole: user['userRole']
        }
        res.status(200).json({ userDetails: udetails });
    }
    catch (err) {
        res.status(500).json({ error: `Error in fetching user details : ${err}` });
    }
}

const otherUserDetails = async (req, res) => {
    try {
        let user = await User.findOne({ username: preprocessing(req.params.username) });
        let udetails = {
            username: user['username'],
            firstname: user['firstname'],
            lastname: user['lastname'],
            joiningDate: user['joiningDate'],
            profilePic: user['profilePic'],
            userRole: user['userRole']
        }
        res.status(200).json({ userDetails: udetails });
    }
    catch (err) {
        res.status(500).json({ error: `Error in fetching user details : ${err}` });
    }
}

// have to make route to update user details.

router.get('/ownUserDetails', authorization, ownUserDetails);
router.get('/otherUserDetails/:username', otherUserDetails);

module.exports = router;