import json
import sys

def swap_coordinates(input_filename, output_filename):
    # Load the JSON data
    with open(input_filename, "r") as f:
        json_data = json.load(f)

    # Swap latitude and longitude values
    for feature in json_data["features"]:
        coordinates = feature["geometry"]["coordinates"][0]
        for i in range(len(coordinates)):
            coordinates[i][0], coordinates[i][1] = coordinates[i][1], coordinates[i][0]

    # Save the modified GeoJSON data
    with open(output_filename, "w") as f:
        json.dump(json_data, f, indent=2)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python swap_coordinates.py <input_filename> <output_filename>")
        sys.exit(1)

    input_filename = sys.argv[1]
    output_filename = sys.argv[2]

    swap_coordinates(input_filename, output_filename)
