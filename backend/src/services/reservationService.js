'use strict';

const { sequelize, Reservation, Apartment } = require('../../models');

function serviceError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

async function createReservation(apartmentId, userId, data) {
  const { customerName, customerEmail, customerPhone, agreedPrice } = data;

  if (agreedPrice !== undefined && agreedPrice !== null) {
    if (typeof agreedPrice !== 'number' || agreedPrice <= 0) {
      throw serviceError(400, 'agreedPrice mora biti pozitivan broj');
    }
  }

  return sequelize.transaction(async (t) => {
    const apartment = await Apartment.findByPk(apartmentId, {
      lock: t.LOCK.UPDATE,
      transaction: t
    });

    if (!apartment) {
      throw serviceError(400, 'Stan ne postoji');
    }

    if (apartment.status === 'SOLD') {
      throw serviceError(400, 'Stan je prodat i ne može biti rezervisan');
    }

    const existingActive = await Reservation.findOne({
      where: { apartmentId, status: 'ACTIVE' },
      transaction: t
    });

    if (existingActive) {
      throw serviceError(409, 'Već postoji aktivna rezervacija za ovaj stan');
    }

    const reservation = await Reservation.create({
      apartmentId,
      createdByUserId: userId,
      customerName: customerName ?? null,
      customerEmail: customerEmail ?? null,
      customerPhone: customerPhone ?? null,
      agreedPrice: agreedPrice ?? null,
      status: 'ACTIVE'
    }, { transaction: t });

    await apartment.update({ status: 'RESERVED' }, { transaction: t });

    return reservation;
  });
}

async function cancelReservation(reservationId) {
  return sequelize.transaction(async (t) => {
    const reservation = await Reservation.findByPk(reservationId, {
      lock: t.LOCK.UPDATE,
      transaction: t
    });

    if (!reservation) {
      throw serviceError(404, 'Rezervacija nije pronađena');
    }

    if (reservation.status !== 'ACTIVE') {
      throw serviceError(400, 'Može se otkazati samo aktivna rezervacija');
    }

    const apartment = await Apartment.findByPk(reservation.apartmentId, {
      lock: t.LOCK.UPDATE,
      transaction: t
    });

    await reservation.update({ status: 'CANCELLED' }, { transaction: t });

    if (apartment) {
      await apartment.update({ status: 'AVAILABLE' }, { transaction: t });
    }

    return reservation;
  });
}

async function completeReservation(reservationId) {
  return sequelize.transaction(async (t) => {
    const reservation = await Reservation.findByPk(reservationId, {
      lock: t.LOCK.UPDATE,
      transaction: t
    });

    if (!reservation) {
      throw serviceError(404, 'Rezervacija nije pronađena');
    }

    if (reservation.status !== 'ACTIVE') {
      throw serviceError(400, 'Može se završiti samo aktivna rezervacija');
    }

    const apartment = await Apartment.findByPk(reservation.apartmentId, {
      lock: t.LOCK.UPDATE,
      transaction: t
    });

    await reservation.update({ status: 'COMPLETED' }, { transaction: t });

    if (apartment) {
      await apartment.update({ status: 'SOLD' }, { transaction: t });
    }

    return reservation;
  });
}

module.exports = { createReservation, cancelReservation, completeReservation };
