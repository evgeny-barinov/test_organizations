const db = require('../libs/database');

class Organization {

  constructor(props) {
    this.table = 'organizations';
  }

  async create(name, parentId) {
    await db.execute(`INSERT INTO ${this.table} (name, parent_id) VALUES ?, ?`, [name, parent_id])
  }

  async getByName(name) {

  }


}

module.exports = Organization;