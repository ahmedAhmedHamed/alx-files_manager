import app from '../server';
import db from '../utils/db';
import redisDB from '../utils/redis';
import chai, {expect} from 'chai';
import chaiHttp from 'chai-http';
import sinon from "sinon";
chai.use(chaiHttp);

describe('Testing AppController', function() {

  let stub;
  let stub2;

  afterEach(function () {
    stub.restore();
    stub2.restore()
  });

  describe('GET /status', () => {
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
});
