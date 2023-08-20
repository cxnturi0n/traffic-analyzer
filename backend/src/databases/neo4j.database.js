import neo4j from "neo4j-driver";

let driver;

async function initDriver(uri, username, password) {
  driver = neo4j.driver(uri, neo4j.auth.basic(username, password), {
    disableLosslessIntegers: true, // https://github.com/neo4j/neo4j-javascript-driver#a-note-on-numbers-and-the-integer-type
  });

  await driver.getServerInfo(); //Allows server to fail if could not connect to neo4j

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
