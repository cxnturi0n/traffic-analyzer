#!/bin/bash

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

# Install netcat used for checking connectivity later
run_command sudo apt-get install -y netcat

# Switch to deploy dir
run_command cd /workspace/traffic-analyzer/deploy/

# Downloads road geometries
echo "Downloading road geometries..."
run_command wget --load-cookies /tmp/cookies.txt \
    "https://docs.google.com/uc?export=download&confirm=$(wget --quiet --save-cookies /tmp/cookies.txt --keep-session-cookies --no-check-certificate \
    'https://docs.google.com/uc?export=download&id=1BXGqJDuagXCaF2V50XXh8zrCQFPSu7X4' -O- | sed -rn 's/.*confirm=([0-9A-Za-z_]+).*/\1\n/p')&id=1BXGqJDuagXCaF2V50XXh8zrCQFPSu7X4" -O geospatial-data.zip

echo "Unzipping and cleaning up road geometries..."
run_command rm -r geospatial-data
run_command unzip geospatial-data.zip
run_command rm geospatial-data.zip
run_command rm ./geospatial-data/*.json

# Download Anderlecht obu data
echo "Downloading Anderlecht obu data..."
run_command wget --load-cookies /tmp/cookies.txt \
    "https://docs.google.com/uc?export=download&confirm=$(wget --quiet --save-cookies /tmp/cookies.txt --keep-session-cookies --no-check-certificate \
    'https://docs.google.com/uc?export=download&id=1okizama5MWTMP4hiTVqw-nUU3_82TULF' -O- | sed -rn 's/.*confirm=([0-9A-Za-z_]+).*/\1\n/p')&id=1okizama5MWTMP4hiTVqw-nUU3_82TULF" -O obu-data.zip && rm -rf /tmp/cookies.txt

echo "Unzipping and cleaning up Anderlecht obu data..."
run_command rm -r obu-data
run_command unzip obu-data.zip
run_command rm obu-data.zip

# Install ogr2ogr
echo "Installing ogr2ogr..."
run_command sudo apt-get update
run_command sudo apt-get -y install gdal-bin

# Build react webapp and nodejs express server
echo "Building react webapp and nodejs express server..."
run_command docker compose build

echo "Setup completed successfully."
