import { Router, Request, Response } from 'express';
import { fetchAvailability } from '../services/calcomService';
import { availabilityValidation, validate } from '../utils/validation';

const router = Router();

/**
 * Get available time slots
 * POST /api/availability
 */
router.post('/', availabilityValidation, validate, async (req: Request, res: Response) => {
  try {
    const { date, sessionType } = req.body;
    
    const slots = await fetchAvailability(date, sessionType);
    
    res.json({
      success: true,
      date,
      slots,
    });
  } catch (error) {
    console.error('Availability error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch availability',
    });
  }
});

export default router;
