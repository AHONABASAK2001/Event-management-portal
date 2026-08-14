const express = require('express');
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const router = express.Router();
const prisma = new PrismaClient();

// Register for Event
router.post('/:eventId/register', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { studentName, studentEmail, studentPhone } = req.body;

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event || event.status !== 'APPROVED') {
      return res.status(400).json({ error: 'Event not available for registration' });
    }

    const registrationCount = await prisma.registration.count({
      where: { eventId, status: 'CONFIRMED' },
    });

    if (registrationCount >= event.capacity) {
      return res.status(409).json({ error: 'Event is full' });
    }

    const existingReg = await prisma.registration.findFirst({
      where: { eventId, studentEmail },
    });

    if (existingReg) {
      return res.status(409).json({ error: 'You are already registered for this event' });
    }

    const ticketId = `${eventId}-${crypto.randomBytes(4).toString('hex')}`.toUpperCase();

    const registration = await prisma.registration.create({
      data: {
        eventId,
        studentName,
        studentEmail,
        studentPhone,
        ticketId,
        paymentStatus: event.isPaid ? 'PENDING' : 'PAID',
        status: 'CONFIRMED',
      },
    });

    res.status(201).json({
      message: 'Registered successfully',
      registration,
      ticket: {
        ticketId,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Event Registrations
router.get('/:eventId/registrations', async (req, res) => {
  try {
    const { eventId } = req.params;

    const registrations = await prisma.registration.findMany({
      where: { eventId },
      select: {
        id: true,
        studentName: true,
        studentEmail: true,
        registrationDate: true,
        paymentStatus: true,
        status: true,
        checkInTime: true,
      },
      orderBy: { registrationDate: 'desc' },
    });

    const event = await prisma.event.findUnique({ where: { id: eventId } });

    res.json({
      message: 'Registrations retrieved',
      eventTitle: event?.title,
      totalRegistrations: registrations.length,
      registrations,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check In
router.post('/checkin/:ticketId', async (req, res) => {
  try {
    const { ticketId } = req.params;

    const registration = await prisma.registration.findUnique({
      where: { ticketId },
      include: { event: true },
    });

    if (!registration) {
      return res.status(404).json({ error: 'Invalid ticket' });
    }

    if (registration.status === 'CHECKED_IN') {
      return res.status(400).json({ error: 'Already checked in' });
    }

    const updated = await prisma.registration.update({
      where: { ticketId },
      data: {
        status: 'CHECKED_IN',
        checkInTime: new Date(),
      },
    });

    res.json({
      message: 'Check-in successful',
      student: updated.studentName,
      event: registration.event.title,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
