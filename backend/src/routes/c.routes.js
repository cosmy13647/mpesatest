const { pool } = require("../config/db");

const result = await pool.query(
  "SELECT * FROM transactions"
);

console.log(result.rows);