const express = require('express');
const { adminLogin, getUsers, getUserDetails } = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

router.post('/login', adminLogin);
router.get('/users', adminAuth, getUsers);
router.get('/users/:id', adminAuth, getUserDetails);

module.exports = router;
