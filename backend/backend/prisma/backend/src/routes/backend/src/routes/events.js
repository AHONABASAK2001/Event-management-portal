const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Create Event Proposal
router.post('/create', async (req, res) => {
  try {
    const { title, description, eventDate, venue, capacity, duration, organizationId } = req.body;

    if (!title || !eventDate || !venue || !capacity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check for venue clash
    const existingBooking = await prisma.venueBooking.findUnique({
      where: {
        venue_eventDate: {
          venue,
          eventDate: new Date(eventDate),
        },
      },
    });

    if (existingBooking) {
      return res.status(409).json({
        error: 'Venue already booked for this date. Please choose a different date or venue.',
        conflict: {
          venue,
          date: eventDate,
        },
      });
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        eventDate: new Date(eventDate),
        venue,
        capacity,
        duration,
        organizationId,
        status: 'DRAFT',
      },
    });

    res.status(201).json({
      message: 'Event created successfully',
      event,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit Event for Approval
router.post('/:eventId/submit', async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Create venue booking
    await prisma.venueBooking.create({
      data: {
        venue: event.venue,
        eventDate: event.eventDate,
        eventId,
      },
    });

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
    });

    const permissionRequest = await prisma.permissionRequest.create({
      data: {
        eventId,
        requesterId: req.body.requesterId,
        status: 'PENDING',
        workflowLevel: 'FACULTY_COORDINATOR',
      },
    });

    res.json({
      message: 'Event submitted for approval',
      event: updatedEvent,
      permissionRequest,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get All Events
router.get('/', async (req, res) => {
  try {
    const { status, organizationId, venue, fromDate, toDate } = req.query;
    const where = {};

    if (status) where.status = status;
    if (organizationId) where.organizationId = organizationId;
    if (venue) where.venue = venue;

    if (fromDate || toDate) {
      where.eventDate = {};
      if (fromDate) where.eventDate.gte = new Date(fromDate);
      if (toDate) where.eventDate.lte = new Date(toDate);
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        organization: { select: { name: true } },
        registrations: { select: { id: true } },
      },
      orderBy: { eventDate: 'asc' },
    });

    res.json({
      message: 'Events retrieved',
      total: events.length,
      events,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check Calendar Clash
router.post('/check-clash', async (req, res) => {
  try {
    const { venue, eventDate, duration } = req.body;
    const eventStart = new Date(eventDate);
    const eventEnd = new Date(eventStart.getTime() + duration * 60000);

    const clashes = await prisma.venueBooking.findMany({
      where: {
        venue,
        eventDate: {
          gte: new Date(eventStart.getTime() - 60 * 60000),
          lte: new Date(eventEnd.getTime() + 60 * 60000),
        },
      },
      include: {
        event: { select: { title: true, organizationId: true } },
      },
    });

    res.json({
      hasClash: clashes.length > 0,
      clashes,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
