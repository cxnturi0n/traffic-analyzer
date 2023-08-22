#!/bin/bash

# Positioning to gitpod deploy directory
cd /workspace/traffic-analyzer/deploy

# Function to handle errors
handle_error() {
    echo "Error: $1"
    exit 1
}

# Function to run a command with error checking
run_command() {
    echo "Running: $@"
    "$@" || handle_error "Command failed: $@"
}

echo "SET UP GitPod Environment"

run_command sudo apt-get install -y netcat

echo "Downloading road geometries..."
run_command wget --load-cookies /tmp/cookies.txt \
    "https://docs.google.com/uc?export=download&confirm=$(wget --quiet --save-cookies /tmp/cookies.txt --keep-session-cookies --no-check-certificate \
    'https://docs.google.com/uc?export=download&id=1BXGqJDuagXCaF2V50XXh8zrCQFPSu7X4' -O- | sed -rn 's/.*confirm=([0-9A-Za-z_]+).*/\1\n/p')&id=1BXGqJDuagXCaF2V50XXh8zrCQFPSu7X4" -O geospatial-data.zip

echo "Unzipping and cleaning up road geometries..."
run_command rm -r geospatial-data
run_command unzip geospatial-data.zip
run_command rm geospatial-data.zip

echo "Downloading Anderlecht obu data..."
run_command wget --load-cookies /tmp/cookies.txt \
    "https://docs.google.com/uc?export=download&confirm=$(wget --quiet --save-cookies /tmp/cookies.txt --keep-session-cookies --no-check-certificate \
    'https://docs.google.com/uc?export=download&id=1okizama5MWTMP4hiTVqw-nUU3_82TULF' -O- | sed -rn 's/.*confirm=([0-9A-Za-z_]+).*/\1\n/p')&id=1okizama5MWTMP4hiTVqw-nUU3_82TULF" -O obu-data.zip && rm -rf /tmp/cookies.txt

echo "Unzipping and cleaning up Anderlecht obu data..."
run_command rm -r obu-data
run_command unzip obu-data.zip
run_command rm obu-data.zip

echo "Installing ogr2ogr..."
run_command sudo apt-get update
run_command sudo apt-get -y install gdal-bin

echo "Deleting databases volumes"
run_command docker rm -f postgis
run_command docker volume rm -f deploy_postgis_data
run_command docker rm -f neo4j
run_command docker volume rm -f deploy_neo4j_data

echo "Building react webapp and nodejs express server..."
run_command docker compose build

echo "Pulling neo4j and postgis images..."
run_command docker compose pull

echo "Starting containers in detached mode..."
run_command docker compose up -d

echo "Waiting 10 seconds for databases to boot..."
sleep 10

# Run init-postgis.sh
echo "Initializing PostGIS..."
run_command chmod +x init-postgis.sh
run_command ./init-postgis.sh

# Run init-neo4j.sh
echo "Initializing Neo4j..."
run_command chmod +x init-neo4j.sh
run_command ./init-neo4j.sh

echo "Setup completed successfully."
