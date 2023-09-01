import { InvalidParameters } from "../errors/invalid-parameters.error.js";

function validateQueryParameters(req, res, next) {
  const params = req.query;

  const region = params.region;
  const roadIds = params.roadIds;
  const count = params.count;

  const validRegions = ["Anderlecht", "Bruxelles", "Belgium"];

  if (!region) {
    throw new InvalidParameters(
      "'region' is required: Expected: Anderlecht | Bruxelles | Belgium"
    );
  }

  if (!validRegions.includes(region)) {
    throw new InvalidParameters(
      "'region' is wrong. Expected: Anderlecht | Bruxelles | Belgium"
    );
  }

  const roadIdsPattern = /^\[\s*(?:\d+\s*(?:,\s*\d+\s*)*)?\]$/;

  if (roadIds && !roadIdsPattern.test(roadIds)) {
    throw new InvalidParameters(
      "'roadIds' has to be an array of integers representing ids of the roads: [<roadId_1>, <roadId_2>, ...]"
    );
  }
  if (count && count != "true" && count != "false") {
    throw new InvalidParameters("'count' is wrong. Expected: true | false");
  }
  next();
}

export { validateQueryParameters };
