import app from '../server';
import chai, {expect} from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);

describe('Testing AppController', function() {

  describe('GET /status', () => {
    it('returns whether databases are alive or not', (done) => {
      chai.request(app).get('/status').end((err, res) => {
        if (err) return done(err);
        expect(res).to.have.status(200);
        expect(res).to.be.an('object');
        expect(res.body.redis).to.be.equal(true);
        expect(res.body.db).to.be.equal(true);
        done()
      });
    });
  });
});
