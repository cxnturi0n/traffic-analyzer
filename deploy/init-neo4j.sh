#!/bin/bash

# Neo4j credentials
NEO4J_USERNAME="neo4j"
NEO4J_PASSWORD="password"

# Base64 encode the credentials
AUTH_HEADER="Authorization: Basic $(echo -n "$NEO4J_USERNAME:$NEO4J_PASSWORD" | base64)"

# BOLT API endpoint
URL="http://localhost:7474/db/neo4j/tx/commit"

# Request headers
ACCEPT_HEADER="Accept: application/json;charset=UTF-8"
CONTENT_TYPE_HEADER="Content-Type: application/json"


echo "Loading Anderlecht csvs and indexes..."

# Save the request body to a file
echo '{
   "statements":[
      {
         "statement":"CALL apoc.periodic.iterate('\''LOAD CSV FROM \"file:///And_05min_0101_0103_2019.csv\" AS line RETURN line'\'', '\''CREATE (o:ObservationAnderlecht_5min { road_id: toInteger(line[1]), timestamp: apoc.date.parse(line[0], \"s\", \"yyyy-MM-dd HH:mm:ss\"), num_vehicles: toInteger(line[2]), avg_speed: toFloat(line[3]) })'\'', { batchSize: 10000, parallel: true });"
      },
      {
         "statement":"CALL apoc.periodic.iterate('\''LOAD CSV FROM \"file:///And_05min_0506_1610_2021.csv\" AS line RETURN line'\'', '\''CREATE (o:ObservationAnderlecht_5min { road_id: toInteger(line[1]), timestamp: apoc.date.parse(line[0], \"s\", \"yyyy-MM-dd HH:mm:ss\"), num_vehicles: toInteger(line[2]), avg_speed: toFloat(line[3]) })'\'', { batchSize: 10000, parallel: true });"
      },
      {
         "statement":"CALL apoc.periodic.iterate('\''LOAD CSV FROM \"file:///And_05min_1303_0606_2021.csv\" AS line RETURN line'\'', '\''CREATE (o:ObservationAnderlecht_5min { road_id: toInteger(line[1]), timestamp: apoc.date.parse(line[0], \"s\", \"yyyy-MM-dd HH:mm:ss\"), num_vehicles: toInteger(line[2]), avg_speed: toFloat(line[3]) })'\'', { batchSize: 10000, parallel: true });"
      },
      {
         "statement":"CALL apoc.periodic.iterate('\''LOAD CSV FROM \"file:///And_15min_0101_0103_2019.csv\" AS line RETURN line'\'', '\''CREATE (o:ObservationAnderlecht_15min { road_id: toInteger(line[1]), timestamp: apoc.date.parse(line[0], \"s\", \"yyyy-MM-dd HH:mm:ss\"), num_vehicles: toInteger(line[2]), avg_speed: toFloat(line[3]) })'\'', { batchSize: 10000, parallel: true });"
      },
      {
         "statement":"CALL apoc.periodic.iterate('\''LOAD CSV FROM \"file:///And_15min_0506_1610_2021.csv\" AS line RETURN line'\'', '\''CREATE (o:ObservationAnderlecht_15min { road_id: toInteger(line[1]), timestamp: apoc.date.parse(line[0], \"s\", \"yyyy-MM-dd HH:mm:ss\"), num_vehicles: toInteger(line[2]), avg_speed: toFloat(line[3]) })'\'', { batchSize: 10000, parallel: true });"
      },
      {
         "statement":"CALL apoc.periodic.iterate('\''LOAD CSV FROM \"file:///And_15min_1303_0606_2021.csv\" AS line RETURN line'\'', '\''CREATE (o:ObservationAnderlecht_15min { road_id: toInteger(line[1]), timestamp: apoc.date.parse(line[0], \"s\", \"yyyy-MM-dd HH:mm:ss\"), num_vehicles: toInteger(line[2]), avg_speed: toFloat(line[3]) })'\'', { batchSize: 10000, parallel: true });"
      },
      {
         "statement":"CALL apoc.periodic.iterate('\''LOAD CSV FROM \"file:///And_30min_0101_0103_2019.csv\" AS line RETURN line'\'', '\''CREATE (o:ObservationAnderlecht_30min { road_id: toInteger(line[1]), timestamp: apoc.date.parse(line[0], \"s\", \"yyyy-MM-dd HH:mm:ss\"), num_vehicles: toInteger(line[2]), avg_speed: toFloat(line[3]) })'\'', { batchSize: 10000, parallel: true });"
      },
      {
         "statement":"CALL apoc.periodic.iterate('\''LOAD CSV FROM \"file:///And_30min_0506_1610_2021.csv\" AS line RETURN line'\'', '\''CREATE (o:ObservationAnderlecht_30min { road_id: toInteger(line[1]), timestamp: apoc.date.parse(line[0], \"s\", \"yyyy-MM-dd HH:mm:ss\"), num_vehicles: toInteger(line[2]), avg_speed: toFloat(line[3]) })'\'', { batchSize: 10000, parallel: true });"
      },
      {
         "statement":"CALL apoc.periodic.iterate('\''LOAD CSV FROM \"file:///And_30min_1303_0606_2021.csv\" AS line RETURN line'\'', '\''CREATE (o:ObservationAnderlecht_30min { road_id: toInteger(line[1]), timestamp: apoc.date.parse(line[0], \"s\", \"yyyy-MM-dd HH:mm:ss\"), num_vehicles: toInteger(line[2]), avg_speed: toFloat(line[3]) })'\'', { batchSize: 10000, parallel: true });"
      }
   ]
}' > request_body.json


if ! nc -zw1 google.com 443 > /dev/null 2>&1; then
    echo "Network error, check your internet connectivity"
    exit 1
fi

http_status_code=$(curl -s -w "%{http_code}" -o "response.txt" -X POST -H "$AUTH_HEADER" -H "$ACCEPT_HEADER" -H "$CONTENT_TYPE_HEADER" -d @request_body.json "$URL")
if [ "$http_status_code" -ne "200" ]; then
    echo "Could not satisfy your request: $errors"
    exit 1
fi

echo "Loading Nodes..."

response_content=$(cat response.txt)
errors=$(echo "$response_content" | jq '.errors')
errors_length=$(echo "$response_content" | jq '.errors | length')
if [ "$errors_length" -ne "0" ]; then
    echo "Anderlecht csvs failed to be loaded: $errors"
    exit 1
fi

# Save the request body to a file
echo '{
   "statements":[
      {
         "statement": "CREATE INDEX Index_ObservationAnderlecht_5min_road_id IF NOT EXISTS FOR (o:ObservationAnderlecht_5min) ON (o.road_id);"
      },
      {
         "statement": "CREATE INDEX Index_ObservationAnderlecht_5min_timestamp IF NOT EXISTS FOR (o:ObservationAnderlecht_5min) ON (o.timestamp);"
      },
      {
         "statement": "CREATE INDEX Index_ObservationAnderlecht_15min_road_id IF NOT EXISTS FOR (o:ObservationAnderlecht_15min) ON (o.road_id);"
      },
      {
         "statement": "CREATE INDEX Index_ObservationAnderlecht_15min_timestamp IF NOT EXISTS FOR (o:ObservationAnderlecht_15min) ON (o.timestamp);"
      },
      {
         "statement": "CREATE INDEX Index_ObservationAnderlecht_30min_road_id IF NOT EXISTS FOR (o:ObservationAnderlecht_30min) ON (o.road_id);"
      },
      {
         "statement": "CREATE INDEX Index_ObservationAnderlecht_30min_timestamp IF NOT EXISTS FOR (o:ObservationAnderlecht_30min) ON (o.timestamp);"
      }
   ]
}' > request_body.json

if ! nc -zw1 google.com 443 > /dev/null 2>&1; then
    echo "Network error, check your internet connectivity"
    exit 1
fi

http_status_code=$(curl -s -w "%{http_code}" -o "response.txt" -X POST -H "$AUTH_HEADER" -H "$ACCEPT_HEADER" -H "$CONTENT_TYPE_HEADER" -d @request_body.json "$URL")
if [ "$http_status_code" -ne "200" ]; then
    echo "Could not satisfy your request: $errors"
    exit 1
fi

echo "Loading Indexes..."

response_content=$(cat response.txt)
errors=$(echo "$response_content" | jq '.errors')
errors_length=$(echo "$response_content" | jq '.errors | length')
if [ "$errors_length" -ne "0" ]; then
    echo "Anderlecht csvs failed to be loaded: $errors"
    exit 1
fi

rm response.txt

rm -f And*

rm request_body.json

echo "Anderlecht csvs and indexes successfully loaded: $response_content"









