function addFilter(cypherQuery, filterClause) {
  cypherQuery += cypherQuery.includes("WHERE")
    ? ` AND ${filterClause}`
    : ` WHERE ${filterClause}`;
  return cypherQuery;
}

function addTimestampIntervalFilter(cypherQuery, tbegin, tend, timestampField) {
  if (tbegin) {
    cypherQuery = addFilter(cypherQuery, `${timestampField} >= $tbegin`);
  }

  if (tend) {
    cypherQuery = addFilter(cypherQuery, `${timestampField} < $tend`);
  }

  return cypherQuery;
}

function addDaysOfWeekFilter(cypherQuery, days, timestampField) {
  if (days && days.length > 0) {
    cypherQuery = addFilter(
      cypherQuery,
      `${timestampField} IS NOT NULL AND date(datetime({epochSeconds: ${timestampField}})).dayOfWeek IN $days`
    );
  }

  return cypherQuery;
}

function addRoadIdsRangeFilter(cypherQuery, roadIds, field) {
  if (roadIds && roadIds.length > 0) {
    cypherQuery = addFilter(cypherQuery, `${field} IN $roadIds`);
  }

  return cypherQuery;
}

function addOrdering(cypherQuery, field, order) {
  cypherQuery += `ORDER BY ${field} ${order}`;
  return cypherQuery;
}

function addLimit(cypherQuery, limit) {
  if (limit) {
    cypherQuery += ` LIMIT $limit`;
  }

  return cypherQuery;
}

function addReturnFields(cypherQuery, fields) {
  cypherQuery += ` RETURN ${fields}`;
  return cypherQuery;
}

export {
  addFilter,
  addTimestampIntervalFilter,
  addDaysOfWeekFilter,
  addRoadIdsRangeFilter,
  addOrdering,
  addLimit,
  addReturnFields,
};
