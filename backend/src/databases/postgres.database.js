import  * as pg  from "pg";

const { Pool } = pg.default

let pool;

function initPool(host, port, database, user, password) {
  pool = new Pool({
    user: user,
    host: host,
    database: database,
    password: password,
    port: port,
  });
  return pool;
}

function getPool() {
  return pool;
}

async function closePool() {
  if (pool) {
    await pool.end();
  }
}

export { initPool, getPool, closePool };
