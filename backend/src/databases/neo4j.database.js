import neo4j from "neo4j-driver";

let driver;

function initDriver(uri, username, password) {
  driver = neo4j.driver(uri, neo4j.auth.basic(username, password), {
    disableLosslessIntegers: true,
  });
  driver.getServerInfo(); // Allows server to fail if connection could not be established

  return driver;
}

function getDriver() {
  return driver;
}

async function closeDriver() {
  if (driver) {
    await driver.close();
  }
}

export { initDriver, getDriver, closeDriver };
