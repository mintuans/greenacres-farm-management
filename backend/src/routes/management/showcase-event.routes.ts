import { Router } from 'express';
import * as showcaseEventController from '../../controllers/management/showcase-event.controller';

const router = Router();

// Events
router.get('/', showcaseEventController.getEvents);
router.get('/:id', showcaseEventController.getEventById);
router.post('/', showcaseEventController.createEvent);
router.put('/:id', showcaseEventController.updateEvent);
router.delete('/:id', showcaseEventController.deleteEvent);

// Guests
router.get('/guests/all', showcaseEventController.getGuests);
router.post('/guests', showcaseEventController.createGuest);

// Participants
router.post('/participants', showcaseEventController.addParticipant);
router.delete('/participants/:id', showcaseEventController.removeParticipant);

export default router;
