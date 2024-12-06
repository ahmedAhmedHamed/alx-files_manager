import app from '../server';
import db from '../utils/db';
import redisDB from '../utils/redis';
import chai, {expect} from 'chai';
import chaiHttp from 'chai-http';
import sinon from "sinon";
chai.use(chaiHttp);

describe('Testing AppController', function() {
  describe('GET /status', () => {
    let stub;
    let stub2;

    afterEach(function () {
      stub.restore();
      stub2.restore()
    });

    it('returns true when database is alive', (done) => {
      stub = sinon.stub(db, 'isAlive').returns(true);
      stub2 = sinon.stub(redisDB, 'isAlive').returns(true);
      chai.request(app).get('/status').end((err, res) => {
        if (err) return done(err);
        expect(res).to.have.status(200);
        expect(res).to.be.an('object');
        expect(res.body.redis).to.be.equal(true);
        expect(res.body.db).to.be.equal(true);
        done();
      });
    });
    it('returns false when database is not alive', (done) => {
      stub = sinon.stub(db, 'isAlive').returns(false);
      stub2 = sinon.stub(redisDB, 'isAlive').returns(false);
      chai.request(app).get('/status').end((err, res) => {
        if (err) return done(err);
        expect(res).to.have.status(200);
        expect(res).to.be.an('object');
        expect(res.body.redis).to.be.equal(false);
        expect(res.body.db).to.be.equal(false);
        done();
      });
    });
  });
  describe('GET /stats', () => {
    it ('returns amount of users and files',(done) => {
      let stub = sinon.stub(db, 'nbUsers').returns(5);
      let stub2 = sinon.stub(db, 'nbFiles').returns(10);
      chai.request(app).get('/stats').end((err, res) => {
        if (err) return done(err);
        expect(res).to.have.status(200);
        expect(res).to.be.an('object');
        expect(res.body.users).to.be.equal(5);
        expect(res.body.files).to.be.equal(10);
        stub.restore();
        stub2.restore();
        done();
      });
    });
  });
});


