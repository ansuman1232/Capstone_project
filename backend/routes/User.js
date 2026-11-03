import {Router} from 'express';
import { login,refresh,register,logout } from '../controllers/User.js';
const UserRoute=Router();

UserRoute.post('/login',login);
UserRoute.post('/register',register);
UserRoute.delete('/logout',logout);
UserRoute.get('/refresh',refresh)


export default UserRoute;