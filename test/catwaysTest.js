const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const catwayController = require('../services/catways'); 
const Catway = require('../models/catway');

describe('Catway Controller - getAll', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      render: sinon.spy(),
      status: sinon.stub().returns({ json: sinon.spy() })
    };
    next = sinon.spy();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should render catways page with catways data', async () => {
    const mockCatways = [
      { _id: new mongoose.Types.ObjectId(), name: 'Catway 1' },
      { _id: new mongoose.Types.ObjectId(), name: 'Catway 2' }
    ];

    sinon.stub(Catway, 'find').resolves(mockCatways);

    await catwayController.getAll(req, res, next);

    expect(Catway.find.calledOnce).to.be.true;
    expect(res.render.calledOnce).to.be.true;
    expect(res.render.firstCall.args[0]).to.equal('catways');
    expect(res.render.firstCall.args[1]).to.deep.equal({
      title: 'Embarquadaires',
      catways: mockCatways
    });
  });

  it('should return 501 status with error when Catway.find fails', async () => {
    const error = new Error('Database error');
    sinon.stub(Catway, 'find').rejects(error);

    await catwayController.getAll(req, res, next);

    expect(Catway.find.calledOnce).to.be.true;
    expect(res.status.calledOnce).to.be.true;
    expect(res.status.calledWith(501)).to.be.true;
    expect(res.status().json.calledOnce).to.be.true;
    expect(res.status().json.calledWith(error)).to.be.true;
  });
});

describe('Catway Controller - getById', () => {
    let req, res, next;
  
    beforeEach(() => {
      req = {
        params: {}
      };
      res = {
        render: sinon.spy(),
        status: sinon.stub().returns({ json: sinon.spy() })
      };
      next = sinon.spy();
    });
  
    afterEach(() => {
      sinon.restore();
    });
  
    it('should render catwayInfo page with catway data when found', async () => {
      const mockCatway = {
        _id: new mongoose.Types.ObjectId(),
        name: 'Test Catway'
      };
      req.params.id = mockCatway._id.toString();
  
      sinon.stub(Catway, 'findById').resolves(mockCatway);
  
      await catwayController.getById(req, res, next);
  
      expect(Catway.findById.calledOnceWith(req.params.id)).to.be.true;
      expect(res.render.calledOnce).to.be.true;
      expect(res.render.firstCall.args[0]).to.equal('catwayInfo');
      expect(res.render.firstCall.args[1]).to.deep.equal({
        title: "Info sur l'embarquadaire",
        catway: mockCatway
      });
    });
  
    it('should return 404 status when catway is not found', async () => {
      req.params.id = new mongoose.Types.ObjectId().toString();
  
      sinon.stub(Catway, 'findById').resolves(null);
  
      await catwayController.getById(req, res, next);
  
      expect(Catway.findById.calledOnceWith(req.params.id)).to.be.true;
      expect(res.status.calledOnceWith(404)).to.be.true;
      expect(res.status().json.calledOnceWith('catway-not-found')).to.be.true;
    });
  
    it('should return 501 status with error when Catway.findById fails', async () => {
      req.params.id = new mongoose.Types.ObjectId().toString();
      const error = new Error('Database error');
  
      sinon.stub(Catway, 'findById').rejects(error);
  
      await catwayController.getById(req, res, next);
  
      expect(Catway.findById.calledOnceWith(req.params.id)).to.be.true;
      expect(res.status.calledOnceWith(501)).to.be.true;
      expect(res.status().json.calledOnceWith(error)).to.be.true;
    });
});

describe('Catway Controller - add', function() {  
    let req, res, next;
  
    beforeEach(() => {
      req = {
        body: {}
      };
      res = {
        status: sinon.stub().returnsThis(),
        json: sinon.spy(),
        redirect: sinon.spy()
      };
      next = sinon.spy();
    });
  
    afterEach(() => {
      sinon.restore();
    });
  
    it('should return 400 status with validation errors for invalid input', async function() {
      req.body = {
        catwayNumber: 'not a number',
        type: 'invalid',
        catwayState: 'some state'
      };
  
      // Exécute les middlewares de validation
      for (const middleware of catwayController.add.slice(0, -1)) {
        await middleware(req, res, next);
      }
  
      // Exécute la fonction principale
      await catwayController.add[catwayController.add.length - 1](req, res, next);
  
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      const jsonResponse = res.json.firstCall.args[0];
      expect(jsonResponse).to.have.property('errors');
      expect(jsonResponse.errors).to.be.an('array').that.has.lengthOf(2);
  
      const catwayNumberError = jsonResponse.errors.find(e => e.path === 'catwayNumber');
      expect(catwayNumberError).to.include({
        msg: 'Le numéro du catwyas doit être un nombre'
      });
  
      const typeError = jsonResponse.errors.find(e => e.path === 'type');
      expect(typeError).to.include({
        msg: 'Le type doit être "long" ou "short"'
      });
    });
  
    it('should create a new catway and redirect on success', async function() {
      req.body = {
        catwayNumber: 1,
        type: 'long',
        catwayState: 'good'
      };
  
      sinon.stub(Catway, 'create').resolves();
  
      // Exécute les middlewares de validation
      for (const middleware of catwayController.add.slice(0, -1)) {
        await middleware(req, res, next);
      }
  
      // Exécute la fonction principale
      await catwayController.add[catwayController.add.length - 1](req, res, next);
  
      expect(Catway.create.calledOnce).to.be.true;
      expect(Catway.create.firstCall.args[0]).to.deep.equal(req.body);
      expect(res.redirect.calledWith('/tableau-de-bord')).to.be.true;
    });
  
    it('should return 501 status on database error', async function() {
      req.body = {
        catwayNumber: 1,
        type: 'short',
        catwayState: 'good'
      };
  
      const dbError = new Error('Database error');
      sinon.stub(Catway, 'create').rejects(dbError);
  
      // Exécute les middlewares de validation
      for (const middleware of catwayController.add.slice(0, -1)) {
        await middleware(req, res, next);
      }
  
      // Exécute la fonction principale
      await catwayController.add[catwayController.add.length - 1](req, res, next);
  
      expect(Catway.create.calledOnce).to.be.true;
      expect(res.status.calledWith(501)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      expect(res.json.firstCall.args[0]).to.deep.equal(dbError);
    });
  
    it('should accept valid input with optional catwayState', async function() {
        req.body = {
          catwayNumber: 2,
          type: 'short'
        };
      
        sinon.stub(Catway, 'create').resolves();
      
        // Exécute les middlewares de validation
        for (const middleware of catwayController.add.slice(0, -1)) {
          await middleware(req, res, next);
        }
      
        // Exécute la fonction principale
        await catwayController.add[catwayController.add.length - 1](req, res, next);
      
        expect(Catway.create.calledOnce).to.be.true;
        const createdCatway = Catway.create.firstCall.args[0];
        expect(createdCatway).to.have.property('catwayNumber', 2);
        expect(createdCatway).to.have.property('type', 'short');
        expect(createdCatway).to.have.property('catwayState');
        expect(createdCatway.catwayState).to.be.undefined;
        expect(res.redirect.calledWith('/tableau-de-bord')).to.be.true;
      });
  });

describe('Catway Controller - update', function() {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: { id: new mongoose.Types.ObjectId().toString() }
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

  it('should return 400 status with validation errors', async function() {
    req.body = {
      catwayNumber: 'not a number',
      type: 'invalid'
    };
  
    // Exécute d'abord les middlewares de validation
    for (const middleware of catwayController.update.slice(0, -1)) {
      await middleware(req, res, next);
    }
  
    // Ensuite, exécute la fonction principale
    await catwayController.update[catwayController.update.length - 1](req, res, next);
  
    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledOnce).to.be.true;
    const jsonResponse = res.json.firstCall.args[0];
    expect(jsonResponse).to.have.property('errors');
    
    // Vérifie la structure des erreurs
    expect(jsonResponse.errors).to.be.an('array').that.has.lengthOf(2);
    
    // Vérifie chaque erreur individuellement
    const catwayNumberError = jsonResponse.errors.find(e => e.path === 'catwayNumber');
    expect(catwayNumberError).to.include({
      location: 'body',
      msg: 'Le numéro du catwyas doit être un nombre',
      type: 'field',
      value: 'not a number'
    });
  
    const typeError = jsonResponse.errors.find(e => e.path === 'type');
    expect(typeError).to.include({
      location: 'body',
      msg: 'Le type doit être "long" ou "short"',
      type: 'field',
      value: 'invalid'
    });
  });
  
    it('should update catway and return 201 status on success', async () => {
      req.body = {
        catwayNumber: 2,
        type: 'long',
        catwayState: 'good'
      };
  
      const existingCatway = {
        _id: req.params.id,
        catwayNumber: 1,
        type: 'short',
        catwayState: 'average',
        save: sinon.stub().resolves()
      };
  
      const mockValidationResult = {
        isEmpty: () => true,
        array: () => []
      };
  
      sinon.stub(validationResult, 'withDefaults').returns(() => mockValidationResult);
      sinon.stub(Catway, 'findOne').resolves(existingCatway);
  
      await catwayController.update[catwayController.update.length - 1](req, res, next);
  
      expect(Catway.findOne.calledOnceWith({ _id: req.params.id })).to.be.true;
      expect(existingCatway.catwayNumber).to.equal(2);
      expect(existingCatway.type).to.equal('long');
      expect(existingCatway.catwayState).to.equal('good');
      expect(existingCatway.save.calledOnce).to.be.true;
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledOnceWith(existingCatway)).to.be.true;
    });
  
    it('should return 404 status when catway is not found', async () => {
      req.body = {
        catwayNumber: 2
      };
  
      const mockValidationResult = {
        isEmpty: () => true,
        array: () => []
      };
  
      sinon.stub(validationResult, 'withDefaults').returns(() => mockValidationResult);
      sinon.stub(Catway, 'findOne').resolves(null);
  
      await catwayController.update[catwayController.update.length - 1](req, res, next);
  
      expect(Catway.findOne.calledOnceWith({ _id: req.params.id })).to.be.true;
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledOnceWith("catway_not_found")).to.be.true;
    });
  
    it('should return 501 status on database error', async () => {
      req.body = {
        catwayNumber: 2
      };
  
      const dbError = new Error('Database error');
  
      const mockValidationResult = {
        isEmpty: () => true,
        array: () => []
      };
  
      sinon.stub(validationResult, 'withDefaults').returns(() => mockValidationResult);
      sinon.stub(Catway, 'findOne').rejects(dbError);
  
      await catwayController.update[catwayController.update.length - 1](req, res, next);
  
      expect(Catway.findOne.calledOnceWith({ _id: req.params.id })).to.be.true;
      expect(res.status.calledWith(501)).to.be.true;
      expect(res.json.calledOnceWith(dbError)).to.be.true;
    });
});

describe('Catway Controller - delete', function() {
    let req, res, next;
  
    beforeEach(() => {
      req = {
        params: {
          id: new mongoose.Types.ObjectId().toString()
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
  
    it('should delete a catway and return 204 status on success', async function() {
      const deleteOneStub = sinon.stub(Catway, 'deleteOne').resolves({ deletedCount: 1 });
  
      await catwayController.delete(req, res, next);
  
      expect(deleteOneStub.calledOnceWith({ _id: req.params.id })).to.be.true;
      expect(res.status.calledOnceWith(204)).to.be.true;
      expect(res.json.calledOnceWith('delete_ok')).to.be.true;
    });
  
    it('should return 501 status on database error', async function() {
      const dbError = new Error('Database error');
      sinon.stub(Catway, 'deleteOne').rejects(dbError);
  
      await catwayController.delete(req, res, next);
  
      expect(res.status.calledOnceWith(501)).to.be.true;
      expect(res.json.calledOnceWith(dbError)).to.be.true;
    });
  
    it('should return 204 status even if no catway was found to delete', async function() {
      const deleteOneStub = sinon.stub(Catway, 'deleteOne').resolves({ deletedCount: 0 });
  
      await catwayController.delete(req, res, next);
  
      expect(deleteOneStub.calledOnceWith({ _id: req.params.id })).to.be.true;
      expect(res.status.calledOnceWith(204)).to.be.true;
      expect(res.json.calledOnceWith('delete_ok')).to.be.true;
    });
  
    it('should handle invalid ObjectId gracefully', async function() {
      req.params.id = 'invalid-id';
      const dbError = new Error('Invalid ObjectId');
      sinon.stub(Catway, 'deleteOne').rejects(dbError);
  
      await catwayController.delete(req, res, next);
  
      expect(res.status.calledOnceWith(501)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      const jsonResponse = res.json.firstCall.args[0];
      expect(jsonResponse).to.be.an('error');
      expect(jsonResponse.message).to.equal('Invalid ObjectId');
    });
});