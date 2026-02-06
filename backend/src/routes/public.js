const express = require('express');
const { Building, Apartment, Inquiry } = require('../../models');

const router = express.Router();

// GET /api/buildings
router.get('/buildings', async (req, res) => {
  const buildings = await Building.findAll();
  res.json(buildings);
});

// GET /api/buildings/:id/apartments
router.get('/buildings/:id/apartments', async (req, res) => {
  const buildingId = Number(req.params.id);

  const apartments = await Apartment.findAll({
    where: { buildingId }
  });

  res.json(apartments);
});

// GET /api/apartments/:id
router.get('/apartments/:id', async (req, res) => {
  const id = Number(req.params.id);

  const apartment = await Apartment.findByPk(id);
  if (!apartment) {
    return res.status(404).json({ message: 'Stan nije pronađen' });
  }

  res.json(apartment);
});

// POST /api/inquiries
router.post('/inquiries', async (req, res) => {
  const { apartmentId, name, email, message } = req.body;

  if (!apartmentId || !name || !email || !message) {
    return res.status(400).json({ message: 'Sva polja su obavezna' });
  }

  const apartment = await Apartment.findByPk(apartmentId);
  if (!apartment) {
    return res.status(404).json({ message: 'Stan nije pronađen' });
  }

  const inquiry = await Inquiry.create({ apartmentId, name, email, message });
  res.status(201).json(inquiry);
});

module.exports = router;
