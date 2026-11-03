import {Router} from 'express';
import {authenticateToken} from '../middleware/authentication.js'
import { upload,uploadVideo ,getAnalysis} from '../controllers/analysis.js';
const InfoRoute=Router();

InfoRoute.post('/analysis',authenticateToken,upload.single('video'),uploadVideo)
InfoRoute.get('/analysis/:userId',authenticateToken,getAnalysis);
export default InfoRoute;