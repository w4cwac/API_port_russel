const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const mongoose = require('mongoose');
const bookingController = require('../services/booking');
const Booking = require('../models/booking');
const Catway = require('../models/catway');

describe('Booking Controller - getAll', function() {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: {
        id: new mongoose.Types.ObjectId().toString()
      }
    };
    res = {
      render: sinon.spy(),
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };
    next = sinon.spy();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should render booking page with booking and catway data', async function() {
    const mockBookings = [
      { _id: new mongoose.Types.ObjectId(), name: 'Booking 1' },
      { _id: new mongoose.Types.ObjectId(), name: 'Booking 2' }
    ];
    const mockCatway = { _id: req.params.id, name: 'Test Catway' };

    sinon.stub(Booking, 'find').resolves(mockBookings);
    sinon.stub(Catway, 'findById').resolves(mockCatway);

    await bookingController.getAll(req, res, next);

    expect(Booking.find.calledOnce).to.be.true;
    expect(Catway.findById.calledOnceWith(req.params.id)).to.be.true;
    expect(res.render.calledOnce).to.be.true;
    expect(res.render.firstCall.args[0]).to.equal('booking');
    expect(res.render.firstCall.args[1]).to.deep.equal({
      title: 'Réservations',
      booking: mockBookings,
      catway: mockCatway
    });
  });

  it('should return 501 status when Booking.find fails', async function() {
    const error = new Error('Database error');
    sinon.stub(Booking, 'find').rejects(error);

    await bookingController.getAll(req, res, next);

    expect(Booking.find.calledOnce).to.be.true;
    expect(res.status.calledOnceWith(501)).to.be.true;
    expect(res.json.calledOnceWith(error)).to.be.true;
  });

  it('should return 501 status when Catway.findById fails', async function() {
    const error = new Error('Catway not found');
    sinon.stub(Booking, 'find').resolves([]);
    sinon.stub(Catway, 'findById').rejects(error);

    await bookingController.getAll(req, res, next);

    expect(Booking.find.calledOnce).to.be.true;
    expect(Catway.findById.calledOnceWith(req.params.id)).to.be.true;
    expect(res.status.calledOnceWith(501)).to.be.true;
    expect(res.json.calledOnceWith(error)).to.be.true;
  });

  it('should not render page when no booking are found', async function() {
    sinon.stub(Booking, 'find').resolves(null);
    const mockCatway = { _id: req.params.id, name: 'Test Catway' };
    sinon.stub(Catway, 'findById').resolves(mockCatway);

    await bookingController.getAll(req, res, next);

    expect(Booking.find.calledOnce).to.be.true;
    expect(Catway.findById.calledOnceWith(req.params.id)).to.be.true;
    expect(res.render.called).to.be.false;
  });
});

describe('Booking Controller - getById', function() {
    let req, res, next;
  
    beforeEach(() => {
      req = {
        params: {
          id: new mongoose.Types.ObjectId().toString(),
          idReservation: new mongoose.Types.ObjectId().toString()
        }
      };
      res = {
        render: sinon.spy(),
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };
      next = sinon.spy();
    });
  
    afterEach(() => {
      sinon.restore();
    });
  
    it('should render bookingInfo page with booking and catway data', async function() {
      const mockCatway = { _id: req.params.id, name: 'Test Catway' };
      const mockBooking = { _id: req.params.idReservation, name: 'Test Booking' };
  
      sinon.stub(Catway, 'findById').resolves(mockCatway);
      sinon.stub(Booking, 'findById').resolves(mockBooking);
  
      await bookingController.getById(req, res, next);
  
      expect(Catway.findById.calledOnceWith(req.params.id)).to.be.true;
      expect(Booking.findById.calledOnceWith(req.params.idReservation)).to.be.true;
      expect(res.render.calledOnce).to.be.true;
      expect(res.render.firstCall.args[0]).to.equal('bookingInfo');
      expect(res.render.firstCall.args[1]).to.deep.equal({
        title: 'Information réservation',
        booking: mockBooking,
        catway: mockCatway
      });
    });
  
    it('should return 404 status when catway is not found', async function() {
      sinon.stub(Catway, 'findById').resolves(null);
  
      await bookingController.getById(req, res, next);
  
      expect(Catway.findById.calledOnceWith(req.params.id)).to.be.true;
      expect(res.status.calledOnceWith(404)).to.be.true;
      expect(res.json.calledOnceWith('catway-not-found')).to.be.true;
    });
  
    it('should return 404 status when booking is not found', async function() {
      const mockCatway = { _id: req.params.id, name: 'Test Catway' };
      sinon.stub(Catway, 'findById').resolves(mockCatway);
      sinon.stub(Booking, 'findById').resolves(null);
  
      await bookingController.getById(req, res, next);
  
      expect(Catway.findById.calledOnceWith(req.params.id)).to.be.true;
      expect(Booking.findById.calledOnceWith(req.params.idReservation)).to.be.true;
      expect(res.status.calledOnceWith(404)).to.be.true;
      expect(res.json.calledOnceWith('Aucune réservation trouvé')).to.be.true;
    });
  
    it('should return 501 status on database error', async function() {
      const error = new Error('Database error');
      sinon.stub(Catway, 'findById').rejects(error);
  
      await bookingController.getById(req, res, next);
  
      expect(Catway.findById.calledOnceWith(req.params.id)).to.be.true;
      expect(res.status.calledOnceWith(501)).to.be.true;
      expect(res.json.calledOnceWith(error)).to.be.true;
    });
});

describe('Booking Controller - add', function() {
    let req, res, next;
  
    beforeEach(() => {
      req = {
        params: { id: new mongoose.Types.ObjectId().toString() },
        body: {
          bookingId: '123',
          clientName: 'John Doe',
          boatName: 'Sea Spirit',
          checkIn: '2023-06-01',
          checkOut: '2023-06-05'
        }
      };
      res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };
      next = sinon.spy();
    });
  
    afterEach(() => {
      sinon.restore();
    });
  
    it('should add a new booking and return 201 status on success', async function() {
      const mockCatway = { _id: req.params.id, catwayNumber: 5 };
      const mockBooking = { ...req.body, catwayNumber: mockCatway.catwayNumber };
  
      sinon.stub(Catway, 'findById').resolves(mockCatway);
      sinon.stub(Booking, 'create').resolves(mockBooking);
  
      // Exécute les middlewares de validation
      for (const middleware of bookingController.add.slice(0, -1)) {
        await middleware(req, res, next);
      }
  
      // Exécute la fonction principale
      await bookingController.add[bookingController.add.length - 1](req, res, next);
  
      expect(Catway.findById.calledOnceWith(req.params.id)).to.be.true;
      expect(Booking.create.calledOnce).to.be.true;
      expect(res.status.calledOnceWith(201)).to.be.true;
      expect(res.json.calledOnceWith(mockBooking)).to.be.true;
    });
  
    it('should return 400 status with validation errors for invalid input', async function() {
      req.body.bookingId = 'not a number';
      req.body.clientName = 'Jo';
      req.body.checkIn = 'invalid date';
  
      // Exécute les middlewares de validation
      for (const middleware of bookingController.add.slice(0, -1)) {
        await middleware(req, res, next);
      }
  
      // Exécute la fonction principale
      await bookingController.add[bookingController.add.length - 1](req, res, next);
  
      expect(res.status.calledOnceWith(400)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      const errors = res.json.firstCall.args[0].errors;
      expect(errors).to.be.an('array').that.has.lengthOf(3);
      expect(errors[0].msg).to.equal("L'id de réservation doit être un nombre.");
      expect(errors[1].msg).to.equal('Le nom du client doit contenir au moins 3 caractères');
      expect(errors[2].msg).to.equal('checkIn doit être une date');
    });
  
    it('should propagate error when Catway.findById fails', async function() {
        const error = new Error('Database error');
        sinon.stub(Catway, 'findById').rejects(error);
    
        // Exécute les middlewares de validation
        for (const middleware of bookingController.add.slice(0, -1)) {
          await middleware(req, res, next);
        }
    
        // Exécute la fonction principale
        try {
          await bookingController.add[bookingController.add.length - 1](req, res, next);
          // Si nous arrivons ici, le test devrait échouer car nous attendons une erreur
          expect.fail('Expected an error to be thrown');
        } catch (e) {
          expect(e).to.equal(error);
        }
    
        expect(Catway.findById.calledOnceWith(req.params.id)).to.be.true;
    });
  
    it('should do nothing when catway is not found', async function() {
        sinon.stub(Catway, 'findById').resolves(null);
    
        // Exécute les middlewares de validation
        for (const middleware of bookingController.add.slice(0, -1)) {
          await middleware(req, res, next);
        }
    
        // Exécute la fonction principale
        await bookingController.add[bookingController.add.length - 1](req, res, next);
    
        expect(Catway.findById.calledOnceWith(req.params.id)).to.be.true;
        expect(res.status.called).to.be.false;
        expect(res.json.called).to.be.false;
    });
});

describe('Booking Controller - delete', function() {
    let req, res, next;
  
    beforeEach(() => {
      req = {
        params: {
          id: new mongoose.Types.ObjectId().toString(),
          idReservation: new mongoose.Types.ObjectId().toString()
        }
      };
      res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy()
      };
      next = sinon.spy();
    });
  
    afterEach(() => {
      sinon.restore();
    });
  
    it('should delete a booking and return 204 status on success', async function() {
      const mockCatway = { _id: req.params.id };
      
      sinon.stub(Catway, 'findById').resolves(mockCatway);
      const deleteOneStub = sinon.stub(Booking, 'deleteOne').resolves({ deletedCount: 1 });
  
      await bookingController.delete(req, res, next);
  
      expect(Catway.findById.calledOnceWith(req.params.id)).to.be.true;
      expect(deleteOneStub.calledOnceWith({ _id: req.params.idReservation })).to.be.true;
      expect(res.status.calledOnceWith(204)).to.be.true;
      expect(res.json.calledOnceWith('delete_ok')).to.be.true;
    });
  
    it('should return 501 status on database error', async function() {
      const mockCatway = { _id: req.params.id };
      const dbError = new Error('Database error');
      
      sinon.stub(Catway, 'findById').resolves(mockCatway);
      sinon.stub(Booking, 'deleteOne').rejects(dbError);
  
      await bookingController.delete(req, res, next);
  
      expect(Catway.findById.calledOnceWith(req.params.id)).to.be.true;
      expect(res.status.calledOnceWith(501)).to.be.true;
      expect(res.json.calledOnceWith(dbError)).to.be.true;
    });
  
    it('should do nothing when catway is not found', async function() {
      sinon.stub(Catway, 'findById').resolves(null);
      const deleteOneStub = sinon.stub(Booking, 'deleteOne');
  
      await bookingController.delete(req, res, next);
  
      expect(Catway.findById.calledOnceWith(req.params.id)).to.be.true;
      expect(deleteOneStub.called).to.be.false;
      expect(res.status.called).to.be.false;
      expect(res.json.called).to.be.false;
    });
  
    it('should return 204 status even if no booking was found to delete', async function() {
      const mockCatway = { _id: req.params.id };
      
      sinon.stub(Catway, 'findById').resolves(mockCatway);
      const deleteOneStub = sinon.stub(Booking, 'deleteOne').resolves({ deletedCount: 0 });
  
      await bookingController.delete(req, res, next);
  
      expect(Catway.findById.calledOnceWith(req.params.id)).to.be.true;
      expect(deleteOneStub.calledOnceWith({ _id: req.params.idReservation })).to.be.true;
      expect(res.status.calledOnceWith(204)).to.be.true;
      expect(res.json.calledOnceWith('delete_ok')).to.be.true;
    });
});