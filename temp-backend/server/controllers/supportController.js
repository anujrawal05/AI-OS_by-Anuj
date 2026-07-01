const prisma = require('../config/db');

/**
 * Submit support feedback or bug report ticket.
 */
async function createTicket(req, res) {
  try {
    const { title, description, type, attachmentUrl } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required.' });
    }
    const numericId = parseInt(req.user.id, 10);

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: numericId,
        title,
        description,
        type: type || 'bug',
        status: 'open',
        attachmentUrl: attachmentUrl || null
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: numericId,
        actionType: 'SUPPORT_TICKET_CREATED',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        details: `Created support ticket #${ticket.id} (${ticket.type})`
      }
    });

    return res.status(201).json({ 
      success: true, 
      message: 'Support ticket submitted successfully.', 
      ticketId: ticket.id 
    });

  } catch (err) {
    console.error('[Support createTicket Error]:', err.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

/**
 * Retrieve user's submitted support requests.
 */
async function getUserTickets(req, res) {
  try {
    const numericId = parseInt(req.user.id, 10);
    const tickets = await prisma.supportTicket.findMany({
      where: { userId: numericId },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({ success: true, tickets });
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

/**
 * Admin view of all tickets.
 */
async function adminGetTickets(req, res) {
  try {
    const { status, type } = req.query;
    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const tickets = await prisma.supportTicket.findMany({
      where,
      include: {
        user: { select: { email: true, fullName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({ success: true, tickets });
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

/**
 * Admin action to resolve support request tickets.
 */
async function adminReplyTicket(req, res) {
  try {
    const { ticketId, status, adminNotes } = req.body;
    if (!ticketId) {
      return res.status(400).json({ error: 'Ticket ID is required.' });
    }

    const ticket = await prisma.supportTicket.update({
      where: { id: parseInt(ticketId, 10) },
      data: {
        status: status || undefined,
        adminNotes: adminNotes || undefined
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: parseInt(req.user.id, 10),
        actionType: 'ADMIN_SUPPORT_REPLY',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        details: `Admin modified ticket #${ticket.id}. Status: ${ticket.status}`
      }
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Ticket updated successfully.', 
      ticket 
    });

  } catch (err) {
    console.error('[Admin replyTicket Error]:', err.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = {
  createTicket,
  getUserTickets,
  adminGetTickets,
  adminReplyTicket
};
