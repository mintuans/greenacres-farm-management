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
router.put('/guests/:id', showcaseEventController.updateGuest);
router.delete('/guests/:id', showcaseEventController.deleteGuest);

// Participants
router.post('/participants', showcaseEventController.addParticipant);
router.delete('/participants/:id', showcaseEventController.removeParticipant);

export default router;
