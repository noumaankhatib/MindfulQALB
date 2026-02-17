import { Router, Request, Response } from 'express';
import { createBooking as createCalComBooking } from '../services/calcomService';
import { storeBooking, getBooking } from '../services/storageService';
import { bookingValidation, validate } from '../utils/validation';
import { BookingRequest } from '../types';

const router = Router();

/**
 * Create a new booking
 * POST /api/bookings
 */
router.post('/', bookingValidation, validate, async (req: Request, res: Response) => {
  try {
    const bookingRequest: BookingRequest = req.body;
    
    // Combine sessionType and format for Cal.com event type lookup
    // e.g., "individual" + "video" = "individual-video"
    const combinedSessionType = bookingRequest.format 
      ? `${bookingRequest.sessionType}-${bookingRequest.format}`
      : bookingRequest.sessionType;
    
    // Create booking on Cal.com
    const calComResult = await createCalComBooking(
      combinedSessionType,
      bookingRequest.date,
      bookingRequest.time,
      bookingRequest.customer
    );

    if (!calComResult.success) {
      return res.status(500).json({
        success: false,
        error: calComResult.error || 'Failed to create calendar booking',
      });
    }

    // Store booking in database
    const bookingId = storeBooking(bookingRequest, calComResult.bookingId);

    res.json({
      success: true,
      bookingId,
      calComBookingId: calComResult.bookingId,
      message: 'Booking created successfully',
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create booking',
    });
  }
});

/**
 * Get booking by ID
 * GET /api/bookings/:id
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const booking = getBooking(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
      });
    }

    // Return safe booking data (without decrypted PII)
    res.json({
      success: true,
      booking: {
        id: booking.id,
        sessionType: booking.sessionType,
        format: booking.format,
        date: booking.date,
        time: booking.time,
        createdAt: booking.createdAt,
      },
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get booking',
    });
  }
});

export default router;
