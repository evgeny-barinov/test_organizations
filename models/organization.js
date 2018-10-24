const db = require('../libs/database');
const config = require('config').get('app');

class Organization {

  constructor() {
    this.table = 'organizations';
    this.tableRelations = 'relations';
  }

  async create(data) {
    const conn = await db.getConnection();
    let self = this;

    async function saveTree(org, parentId) {
      const item = await conn.query(`SELECT id FROM ${self.table} WHERE name=? LIMIT 1`, [org.org_name]);

      let insertId;
      if (item[0].length) {
        insertId = item[0][0].id;
      } else {
        const r = await conn.query(`INSERT INTO ${self.table} SET ?`, {name: org.org_name});
        insertId = r[0].insertId;
      }

      if (parentId) {
        await conn.query(
          `INSERT IGNORE INTO ${self.tableRelations} SET ?`,
          {org_id: insertId, parent_id: parentId}
        );
      }

      if (org.daughters) {
        for (let item of org.daughters) {
          await saveTree(item, insertId);
        }
      }
    }

    await conn.beginTransaction();
    try {
      await saveTree(data, null);
    } catch (e) {
      await conn.rollback();
      throw e;
    }
    await conn.commit();

    conn.release();
  }

  async getByName(name, page = 1) {
    //1 get id
    const item = await db.query(`SELECT id FROM ${this.table} WHERE name=? LIMIT 1`, [name]);
    if (!item[0].length) {
      return false;
    }

    const id = item[0][0].id;

    function reducer(result, value) {
      result.push(value.id);
      return result;
    }

    let children = [], parents = [], siblings = [];

    //2 select children, parents and siblings ids
    children = await db.query(`SELECT org_id as id FROM ${this.tableRelations} WHERE parent_id=?`, [id]);
    children = children[0].reduce(reducer, []);

    parents = await db.query(`SELECT parent_id as id FROM ${this.tableRelations} WHERE org_id=?`, [id]);
    parents = parents[0].reduce(reducer, []);

    if (parents.length) {
      siblings = await db.query(
        `SELECT DISTINCT org_id as id FROM ${this.tableRelations} WHERE org_id<>? AND parent_id IN (${parents.join(',')})`,
        [id]
      );
      siblings = siblings[0].reduce(reducer, []);
    }

    const ids = children.concat(siblings, parents);
    //3 select organizations
    const limit = config.perPage;
    const offset = (page - 1) * limit;
    let list = await db.query(
      `SELECT id,name FROM ${this.table} WHERE id IN (${ids.join(',')}) LIMIT ?,?`,
      [offset, limit]
    );

    list = list[0].map((value) => {
      value.org_name = value.name;
      if (parents.indexOf(value.id) !== -1) {
        value.relationship_type = 'parent';
      }
      if (children.indexOf(value.id) !== -1) {
        value.relationship_type = 'daughter';
      }
      if (siblings.indexOf(value.id) !== -1) {
        value.relationship_type = 'sister';
      }
      delete value.id;
      delete value.name;
      return value;
    });

    return list;
  }

}

module.exports = Organization;