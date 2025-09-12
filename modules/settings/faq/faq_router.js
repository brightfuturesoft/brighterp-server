const express = require('express');
const router = express.Router();
const { create_faq, get_faqs, update_faq, delete_faq } = require('./faq_module');

router.post('/', create_faq);
router.get('/', get_faqs);
router.put('/:id', update_faq);
router.delete('/:id', delete_faq);

module.exports = router;
