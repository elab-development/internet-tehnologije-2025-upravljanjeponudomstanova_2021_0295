const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const asyncHandler = require('../middleware/asyncHandler');
const { Inquiry, Apartment, Building, Reservation } = require('../../models');

router.get(
  '/inquiries',
  auth,
  requireRole(['owner', 'admin']),
  asyncHandler(async (req, res) => {
    const inquiries = await Inquiry.findAll({
      include: {
        model: Apartment,
        as: 'apartment',
        attributes: ['id', 'number'],
        include: {
          model: Building,
          as: 'building',
          attributes: ['id', 'name']
        }
      },
      order: [['createdAt', 'DESC']]
    });

    res.json(inquiries);
  })
);

router.get(
  '/reservations',
  auth,
  requireRole(['owner', 'admin']),
  asyncHandler(async (req, res) => {
    const reservations = await Reservation.findAll({
      include: [
        {
          model: Apartment,
          as: 'apartment',
          attributes: ['id', 'number'],
          include: {
            model: Building,
            as: 'building',
            attributes: ['id', 'name']
          }
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(reservations);
  })
);

module.exports = router;
