// const planet = require('./planets.mongo')

// Importing npm modules
const parse = require("csv-parse");

// Importing built-in modules
const fs = require("fs");
const path = require("path");

const planets = require("./planets.mongo");

const habitablePlanets = [];

function isHabitablePlanet(planet) {
  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    planet["koi_insol"] > 0.36 &&
    planet["koi_insol"] < 1.11 &&
    planet["koi_prad"] < 1.6
  );
}

const parser = parse.parse({ columns: true, comment: "#" });

function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(
      path.join(__dirname, "..", "..", "data", "kepler_data.csv")
    )
      .pipe(parser)
      .on("data", async (data) => {
        if (isHabitablePlanet(data)) {
          savePlanet(data) // data is from csv file
        }
      })
      .on("error", (error) => {
        console.log(error);
        reject(err);
      })
      .on("end", async () => {
        const planetsFound = (await getAllPlanets()).length
        console.log(`${planetsFound} planets found!`);
        resolve();
      });
  });
}

async function getAllPlanets() {
  return await planets.find({},{
    '_id':0, '__v':0 
  });
}

async function savePlanet(planet) {
  try {
    // finds the first object and insert/update the second object
    await planets.updateOne(
      { keplerName: planet.kepler_name },
      { keplerName: planet.kepler_name },
      { upsert: true }
    );
  } catch (error) {
    console.error(`Could not save planet ${error}`)
  }
}

module.exports = {
  getAllPlanets,
  loadPlanetsData,
};
