const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "./covid19India.db");
let db = null;

const installDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server Running At Port 3001");
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};

installDBAndServer();

// API 1. GET

app.get("/states/", async (request, response) => {
  const getStateQuery = `
    SELECT 
        state_id AS stateId,
        state_name AS stateName,
        population AS population
    FROM  
        state;
    `;

  const dbResponse = await db.all(getStateQuery);
  response.send(dbResponse);
});

// API 2. GET a state

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStateQuery = `
    SELECT 
        state_id AS stateId,
        state_name AS stateName,
        population
    FROM  
        state
    WHERE 
        state_id = ${stateId};
    `;

  const dbResponse = await db.get(getStateQuery);
  response.send(dbResponse);
});

// API 3. POST

app.post("/districts/", async (request, response) => {
  const givenDistrictDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = givenDistrictDetails;
  const postQuery = `
    INSERT INTO 
        district(district_name,state_id,cases,cured,active,deaths)
    VALUES(
        '${districtName}',
        ${stateId},
        ${cases},
        ${cured},
        ${active},
        ${deaths}

    );
    `;

  await db.run(postQuery);
  response.send("District Successfully Added");
});

// API 4. GET a district

app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictQuery = `
    SELECT 
        district_id AS districtId,
        district_name AS districtName,
        state_id AS stateId,
        cases,
        cured,
        active,
        deaths
    FROM  
        district
    WHERE 
        district_id = ${districtId};
    `;
  const dbResponse = await db.get(getDistrictQuery);
  response.send(dbResponse);
});

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

// app.get("/districts/:districtId/state", async (request, response) => {
//   const { districtId } = request.params;

//   const getDistrictQuery = `
//     SELECT
//         district_id AS districtId,
//         district_name AS districtName,
//         state_id AS stateId,
//         cases,
//         cured,
//         active,
//         deaths
//     FROM
//         district
//     WHERE
//         state_id = ${districtId}
//     `;
//   const dbResponse = await db.all(getDistrictQuery);
//   response.send(dbResponse);
// });

//API 5. DELETE a district

app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteDistrictQuery = `
    DELETE FROM 
        district 
    WHERE 
        district_id = ${districtId}
    `;

  await db.run(deleteDistrictQuery);
  response.send("District Removed");
});

// API 6. PUT

app.put("/districts/:districtId", async (request, response) => {
  const givenDistrictDetails = request.body;
  const { districtId } = request.params;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = givenDistrictDetails;
  const putQuery = `
    UPDATE 
        district
    SET
        district_name = '${districtName}',
        state_id = ${stateId},
        cases = ${cases},
        cured = ${cured},
        active = ${active},
        deaths = ${deaths}
    WHERE 
        district_id = ${districtId}
    ;
    `;

  await db.run(putQuery);
  response.send("District Details Updated");
});

// API 7. GET

app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getCasesQuery = `
    SELECT
     SUM(cases) AS totalCases,
     SUM(cured) AS totalCured,
     SUM(active) AS totalActive,
     SUM(deaths) AS totalDeaths
    FROM 
        district
    WHERE 
        state_id = ${stateId}
    `;
  const dbResponse = await db.get(getCasesQuery);
  response.send(dbResponse);
});

// API 8. GET

app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictQuery = `
    SELECT 
        state_name AS stateName
    FROM 
        district NATURAL JOIN state
    WHERE 
        district_id = ${districtId}
    `;

  const dbResponse = await db.get(getDistrictQuery);
  response.send(dbResponse);
});
module.exports = app;
