#!/bin/bash

# Define the input directory
input_dir="./geospatial-data"

# Define the PostgreSQL connection parameters
db_name="belgium_road_network"
db_user="postgres"
db_password="password"
db_host="localhost"

# Create database "belgium_road_network" with apposite postgis extensions defined in "template_postgis" default template (see "/docker-entrypoint-initdb.d/10_postgis.sh" for the extensions supported)
docker exec postgis psql -U postgres -c "CREATE DATABASE belgium_road_network WITH TEMPLATE template_postgis;" || {
    echo "Error creating database $db_name"
    exit 1
}

# Iterate over the JSON files containing road polygons
for json_file in "$input_dir"/*.json; do
    # Get the base filename (without extension)
    base_name=$(basename "$json_file" .json)
    
    # Run the Python script to swap coordinates to convert file to .geojson format
    python3 swap_coordinates.py "$json_file" "$input_dir/$base_name.geojson" || {
        echo "Error running Python script for $base_name.geojson"
        exit 1
    }
    
    # Load the GeoJSON into PostgreSQL using ogr2ogr
    ogr2ogr -f "PostgreSQL" "PG:dbname=$db_name user=$db_user password=$db_password host=$db_host" "$input_dir/$base_name.geojson" -nln "$base_name" -nlt "POLYGON" || {
        echo "Error loading $base_name.geojson into PostgreSQL"
        exit 1
    }
    
    echo "Processed and loaded $base_name.geojson into $db_name"
done

