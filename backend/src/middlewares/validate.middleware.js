import { WrongQueryError } from "../errors/wrong-query.error.js"; // Import your custom error class

function validateQueryParameters(req, res, next) {
  const params = req.query;

  const type = params.type;
  const tbegin = params.tbegin;
  const tend = params.tend;
  const granularity = params.granularity;
  const limit = params.limit;
  const region = params.region;
  const days = params.days;
  const polygons = params.polygons;
  const roadIds = params.roadIds;
  const count = params.count;

  const validTypes = [
    "most-crowded",
    "least-crowded",
    "most-speed",
    "least-speed",
  ];

  const validRegions = ["Anderlecht", "Bruxelles", "Belgium"];

  if (type && !validTypes.includes(type)) {
    throw new WrongQueryError(
      "Invalid query parameter: type. Expected: most-crowded | least-crowded | most-speed | least-speed"
    );
  }

  if (!region) {
    throw new WrongQueryError(
      "Region is required: Expected: Anderlecht | Bruxelles | Belgium"
    );
  }

  if (!validRegions.includes(region)) {
    throw new WrongQueryError(
      "Region is wrong. Expected: Anderlecht | Bruxelles | Belgium"
    );
  }

  if (!granularity) {
    throw new WrongQueryError("Granularity is required: Expected: 5 | 15 | 30");
  }
  if (granularity != 5 && granularity != 15 && granularity != 30) {
    throw new WrongQueryError("Region is wrong. Expected: 5 | 15 | 30");
  }

  const roadIdsPattern = /^\[\s*(?:[0-9]\s*(?:,\s*[0-9])*)?\]$/;

  if (roadIds && !roadIdsPattern.test(roadIds)) {
    throw new WrongQueryError(
      "RoadIds has to be an array of integers representing ids of the roads: [<roadId_1>, <roadId_2>,...]"
    );
  }
  if (count && count != "true" && count != "false") {
    throw new WrongQueryError("Polygons is wrong. Expected: true | false");
  }

  if (polygons && polygons != "true" && polygons != "false") {
    throw new WrongQueryError("Count is wrong. Expected: true | false");
  }

  if (tbegin && tend && tbegin > tend) {
    throw new WrongQueryError(
      "Begin timestamp has to be less or equal then end timestamp you moron"
    );
  }

  if (limit && limit < 0) {
    throw new WrongQueryError(
      "No way you just specified a negative limit lmao"
    );
  }

  const daysPattern = /^\[\s*(?:[0-6](?:,\s*[0-6]){0,6})?\]$/;

  if (days && !daysPattern.test(days)) {
    throw new WrongQueryError(
      "Days has to be an array of integers representing weekdays: Monday=1, Tuesday=2 ,..., Saturday=6, Sunday=0"
    );
  }

  if (
    granularity &&
    granularity != 5 &&
    granularity != 15 &&
    granularity != 30
  ) {
    throw new WrongQueryError(
      "Only 5, 15 and 30 minutes granularity supported"
    );
  }

  next();
}

export { validateQueryParameters };
