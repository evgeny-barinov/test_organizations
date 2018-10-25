const assert = require('assert');
const request = require('request-promise-native').defaults({
  resolveWithFullResponse: true,
  simple: false
});

const config = require('config');
const Organization = require('../models/organization');
const db = require('../libs/database');
const app = require('../app');

assert.equal(config.util.getEnv('NODE_ENV'), 'test');
const apiUrl = 'http://localhost:' + config.get('port');
const fixtureOrg = require('./fixture/org');
const fixtureOrgList = require('./fixture/org_list');
const fixtureResult = require('./fixture/org_result');
const fixtureRelations = require('./fixture/org_relations');

describe('organization API', async () => {

  let server;

  before(done => {
    server = app.listen(config.get('port'), done);
  });

  after(done => {
    server.close(done);
  });

  beforeEach(async () => {
    await db.query("DELETE FROM relations");
    await db.query("DELETE FROM organizations");
  });

  describe('POST /organizations/add', async () => {
    it('should add an organizations and data in DB should be correct after that', async () => {
      let res = await request({
        method: 'post',
        uri: apiUrl + '/organizations/add',
        json: true,
        body: fixtureOrg
      });

      assert.equal(res.statusCode, 200);
      assert.ok(res.headers['content-type'].match(/application\/json/));

      //check if there is data in DB
      let rows = await db.query('SELECT name FROM organizations');
      assert.equal(rows[0].length, fixtureOrgList.length);
      for (let item of rows[0]) {
        assert.ok(fixtureOrgList.indexOf(item.name) !== -1);
      }
    });

    it('should not create duplicates of organization', async () => {
      await request({
        method: 'post',
        uri: apiUrl + '/organizations/add',
        json: true,
        body: fixtureOrg
      });
      await request({
        method: 'post',
        uri: apiUrl + '/organizations/add',
        json: true,
        body: fixtureOrg
      });

      let rows = await db.query('SELECT name FROM organizations');
      assert.equal(rows[0].length, fixtureOrgList.length);
      for (let item of rows[0]) {
        assert.ok(fixtureOrgList.indexOf(item.name) !== -1);
      }

    });

    it('should be correct relations in DB', async() => {
      await request({
        method: 'post',
        uri: apiUrl + '/organizations/add',
        json: true,
        body: fixtureOrg
      });

      let rows = await db.query('SELECT o1.name, o2.name as parent_name FROM relations r INNER JOIN organizations o1 ON r.org_id=o1.id INNER JOIN organizations o2 ON r.parent_id=o2.id');
      rows = rows[0].map(item => {return [item.name, item.parent_name]});

      function sort(a, b) {
        if (a[0] > b[0]) return 1;
        if (a[0] < b[0]) return -1;

        if (a[1] > b[1]) return 1;
        if (a[1] < b[1]) return -1;

        return 0;
      }

      fixtureRelations.sort(sort);
      rows.sort(sort);

      assert.deepStrictEqual(rows, fixtureRelations);
    });
  });

  describe('GET /organizations/get/:name/:page', async () => {
      beforeEach(async () => {
        const org = new Organization();
        await org.create(fixtureOrg);
      });
      it('should get correct organization relations', async () => {
        //1st page
        let res = await request({
          method: 'get',
          uri: apiUrl + '/organizations/get/Black Banana',
          json: true
        });

        assert.deepStrictEqual(res.body, fixtureResult[0]);

        //2nd page
        res = await request({
          method: 'get',
          uri: apiUrl + '/organizations/get/Black Banana/2',
          json: true
        });
        assert.deepStrictEqual(res.body, fixtureResult[1]);

        //3rd page
        res = await request({
          method: 'get',
          uri: apiUrl + '/organizations/get/Black Banana/3',
          json: true
        });
        assert.deepStrictEqual(res.body, fixtureResult[2]);

      });
    it('should get 404 if not found', async () => {
      let res = await request({
        method: 'get',
        uri: apiUrl + '/organizations/get/UnknownOrganization',
        json: true
      });

      assert.equal(res.statusCode, 404);
      assert.deepStrictEqual(res.body, {});
    });
  });

});

