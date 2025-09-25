const express = require('express');
const router = express.Router();
const {
  createSupportTicket,
  getSupportTickets,
  getSupportTicketById,
  updateSupportTicketStatus,
  updateSupportTicketDepartment,
  addSupportTicketComment,
  getSupportTicketStats,
  deleteSupportTicket,
  updateSupportTicket
} = require('./support_module');

// Routes for support tickets
router.post('/tickets', createSupportTicket);
router.get('/tickets', getSupportTickets);
router.get('/tickets/stats', getSupportTicketStats);
router.get('/tickets/:id', getSupportTicketById);
router.patch('/tickets/:id/status', updateSupportTicketStatus);
router.patch('/tickets/:id/department', updateSupportTicketDepartment);
router.post('/tickets/:id/comments', addSupportTicketComment);
router.delete('/tickets/:id', deleteSupportTicket);
router.put('/tickets/:id', updateSupportTicket);

module.exports = router;
