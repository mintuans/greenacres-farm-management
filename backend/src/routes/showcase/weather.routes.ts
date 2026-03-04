import { Router } from 'express';
import { getWeatherData } from '../../controllers/showcase/weather.controller';

const router = Router();

router.get('/', getWeatherData);

export default router;
