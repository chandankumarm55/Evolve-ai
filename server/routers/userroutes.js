import express from 'express';
import { Login } from '../controllers/usercontroller.js';

const router = express.Router();

router.post('/login', Login);

export default router;