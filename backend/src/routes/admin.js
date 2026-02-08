const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const asyncHandler = require('../middleware/asyncHandler');
const { Inquiry, Apartment, Building, Reservation } = require('../../models');


router.get('/inquiries',auth, requireRole('admin'), asyncHandler(async (req, res) => {
    const inquiries = await Inquiry.findAll({
      include: {
        model: Apartment,
        as: 'apartment',
        attributes: ['id', 'number']
      },
      order: [['createdAt', 'DESC']]
    });

    res.json(inquiries);
  })
);

router.get(
  '/buildings',
  auth,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const buildings = await Building.findAll({
      order: [['createdAt', 'DESC']]
    });

    res.json(buildings);
  })
);

router.post(
  '/buildings',
  auth,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const { name, address } = req.body;

    if (!name || !address) {
      return res.status(400).json({
        message: 'Naziv i adresa su obavezni'
      });
    }

    const building = await Building.create({ name, address });

    res.status(201).json(building);
  })
);
router.put(
  '/buildings/:id',
  auth,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, address } = req.body;

    const building = await Building.findByPk(id);

    if (!building) {
      return res.status(404).json({ message: 'Zgrada ne postoji' });
    }

    building.name = name ?? building.name;
    building.address = address ?? building.address;

    await building.save();

    res.json(building);
  })
);
router.delete(
  '/buildings/:id',
  auth,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const building = await Building.findByPk(id);

    if (!building) {
      return res.status(404).json({ message: 'Zgrada ne postoji' });
    }

    await building.destroy();

    res.json({ message: 'Zgrada uspešno obrisana' });
  })
);

router.get(
  '/apartments',
  auth,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const apartments = await Apartment.findAll({
      include: [
        {
          model: Building,
          as: 'building',
          attributes: ['id', 'name', 'address']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(apartments);
  })
);

router.post(
  '/apartments',
  auth,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const { buildingId, number, price, status } = req.body;

    if (!buildingId || !number || price == null || !status) {
      return res.status(400).json({
        message: 'buildingId, number, price i status su obavezni'
      });
    }

    const allowedApartmentStatuses = ['available', 'reserved', 'sold'];
    if (!allowedApartmentStatuses.includes(status)) {
      return res.status(400).json({ message: 'Neispravan status stana' });
    }

    // Provera da li zgrada postoji (FK logika na nivou aplikacije)
    const building = await Building.findByPk(buildingId);
    if (!building) {
      return res.status(400).json({ message: 'Ne postoji zgrada sa datim buildingId' });
    }

    const apartment = await Apartment.create({
      buildingId,
      number,
      price,
      status
    });

    res.status(201).json(apartment);
  })
);

router.put(
  '/apartments/:id',
  auth,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { buildingId, number, price, status } = req.body;

    const apartment = await Apartment.findByPk(id);
    if (!apartment) {
      return res.status(404).json({ message: 'Stan ne postoji' });
    }

    // Ako se menja buildingId, proveri da li zgrada postoji
    if (buildingId != null) {
      const building = await Building.findByPk(buildingId);
      if (!building) {
        return res.status(400).json({ message: 'Ne postoji zgrada sa datim buildingId' });
      }
      apartment.buildingId = buildingId;
    }

    apartment.number = number ?? apartment.number;
    apartment.price = price ?? apartment.price;

    if (status != null) {
      const allowedApartmentStatuses = ['available', 'reserved', 'sold'];
      if (!allowedApartmentStatuses.includes(status)) {
        return res.status(400).json({ message: 'Neispravan status stana' });
      }
    }
    apartment.status = status ?? apartment.status;

    await apartment.save();

    res.json(apartment);
  })
);

router.delete(
  '/apartments/:id',
  auth,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const apartment = await Apartment.findByPk(id);
    if (!apartment) {
      return res.status(404).json({ message: 'Stan ne postoji' });
    }

    await apartment.destroy();

    res.json({ message: 'Stan uspešno obrisan' });
  })
);

router.get(
  '/reservations',
  auth,
  requireRole('admin'),
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

router.post(
  '/reservations',
  auth,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const { apartmentId, startDate, endDate, status } = req.body;

    if (!apartmentId || !startDate || !endDate || !status) {
      return res.status(400).json({
        message: 'apartmentId, startDate, endDate i status su obavezni'
      });
    }
    const allowedReservationStatuses = ['active', 'canceled', 'expired'];
    if (!allowedReservationStatuses.includes(status)) {
      return res.status(400).json({ message: 'Neispravan status rezervacije' });
    }

    const apartment = await Apartment.findByPk(apartmentId);
    if (!apartment) {
      return res.status(400).json({ message: 'Stan ne postoji' });
    }

    // zabrana vise aktivnih rezervacija za isti stan
    if (status === 'active') {
      const existingActive = await Reservation.findOne({
        where: { apartmentId, status: 'active' }
      });

      if (existingActive) {
        return res.status(409).json({
          message: 'Vec postoji aktivna rezervacija za ovaj stan'
        });
      }
    }

    const reservation = await Reservation.create({
      apartmentId,
      startDate,
      endDate,
      status
    });

    res.status(201).json(reservation);
  })
);

router.put(
  '/reservations/:id',
  auth,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { startDate, endDate, status } = req.body;

    const reservation = await Reservation.findByPk(id);
    if (!reservation) {
      return res.status(404).json({ message: 'Rezervacija ne postoji' });
    }

    reservation.startDate = startDate ?? reservation.startDate;
    reservation.endDate = endDate ?? reservation.endDate;

    // validacija statusa ako je poslat
    if (status != null) {
      const allowedReservationStatuses = ['active', 'canceled', 'expired'];
      if (!allowedReservationStatuses.includes(status)) {
        return res.status(400).json({ message: 'Neispravan status rezervacije' });
      }
    }

    // zabrana da vise rezervacija za isti stan bude aktivno
    if (status != null && status === 'active' && reservation.status !== 'active') {
      const existingActive = await Reservation.findOne({
        where: { apartmentId: reservation.apartmentId, status: 'active' }
      });

      if (existingActive) {
        return res.status(409).json({
          message: 'Vec postoji aktivna rezervacija za ovaj stan'
        });
      }
    }

    reservation.status = status ?? reservation.status;


    await reservation.save();

    res.json(reservation);
  })
);

router.delete(
  '/reservations/:id',
  auth,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const reservation = await Reservation.findByPk(id);
    if (!reservation) {
      return res.status(404).json({ message: 'Rezervacija ne postoji' });
    }

    await reservation.destroy();

    res.json({ message: 'Rezervacija uspešno obrisana' });
  })
);

module.exports = router;