const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Get Pending Permissions
router.get('/pending', async (req, res) => {
  try {
    const permissions = await prisma.permissionRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        event: { include: { organization: true } },
        requester: { select: { email: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json({
      message: 'Pending permissions',
      total: permissions.length,
      permissions,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve Permission
router.post('/:permissionId/approve', async (req, res) => {
  try {
    const { permissionId } = req.params;
    const { approvalNotes } = req.body;

    const permission = await prisma.permissionRequest.findUnique({
      where: { id: permissionId },
      include: { event: { include: { organization: true } }, requester: true },
    });

    if (!permission) {
      return res.status(404).json({ error: 'Permission request not found' });
    }

    let nextStatus = 'APPROVED';
    let nextWorkflowLevel = 'APPROVED';

    if (permission.workflowLevel === 'FACULTY_COORDINATOR') {
      nextStatus = 'PENDING';
      nextWorkflowLevel = 'DEAN_ADMIN';
    }

    const updatedPermission = await prisma.permissionRequest.update({
      where: { id: permissionId },
      data: {
        status: nextStatus,
        workflowLevel: nextWorkflowLevel,
        approvalNotes,
        approvedAt: nextStatus === 'APPROVED' ? new Date() : null,
      },
    });

    if (nextStatus === 'APPROVED') {
      await prisma.event.update({
        where: { id: permission.eventId },
        data: { status: 'APPROVED' },
      });
    }

    res.json({
      message: nextStatus === 'APPROVED' ? 'Event approved!' : 'Moved to next approval level',
      permission: updatedPermission,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reject Permission
router.post('/:permissionId/reject', async (req, res) => {
  try {
    const { permissionId } = req.params;
    const { rejectionReason } = req.body;

    const permission = await prisma.permissionRequest.findUnique({
      where: { id: permissionId },
      include: { event: true, requester: true },
    });

    if (!permission) {
      return res.status(404).json({ error: 'Permission request not found' });
    }

    const updatedPermission = await prisma.permissionRequest.update({
      where: { id: permissionId },
      data: {
        status: 'REJECTED',
        rejectionReason,
        rejectedAt: new Date(),
      },
    });

    await prisma.event.update({
      where: { id: permission.eventId },
      data: { status: 'REJECTED' },
    });

    await prisma.venueBooking.deleteMany({
      where: { eventId: permission.eventId },
    });

    res.json({
      message: 'Event rejected',
      permission: updatedPermission,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
