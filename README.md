# traffic-analyzer
A simple React web application designed for traffic analysis, linked to an Express server that retrieves road geometries from PostGIS and gathers observations from Neo4j. This project was created as part of the NoSQL course within the Computer Science Master's Degree program at the University of Naples Federico II.
## Specifications
Since 2016, in Belgium, a maximum threshold (3.5 tons) has been imposed on the weight of trucks circulating on highways. Those exceeding this threshold must pay an additional toll for each kilometer traveled. For this purpose, the installation of an On-Board Unit (OBU) on the affected vehicles (approximately 140,000) has been made mandatory for monitoring movements. Each OBU sends a message approximately every 30 seconds.

Each line in the original dataset contains an ID (anonymously reset every day at 2 AM UTC), a timestamp, GPS coordinates (latitude, longitude), speed, and direction.

The dataset you will use is a modified version that tracks truck traffic on major Belgian highways and in the cities of Brussels and Anderlecht, at different temporal granularities. In particular, the dataset consists of 2 parts:

1) A collection of CSV files containing timestamps, road identifiers, number of vehicles in the time window, and average vehicle speed.

2) JSON files containing the geometries of the considered roads.

### Task

**Develop a system for the storage and spatiotemporal analysis of traffic conditions, with data visualization on a map. The underlying DBMS must necessarily be a hybrid composed of two systems: the first will be Neo4j, while the choice of the second is left to the group members.**

### Deliverable

- Documentation (each choice must be documented and justified)
- Script for data download and loading
- User Interface code (Optional)

## Overview
You can either utilize a web interface or the api to conduct basic spatial and temporal analysis of traffic patterns. The web page is accessible through your preferred browser and retrieves necessary data via an API, which will be discussed in more detail later. This API is empowered by Express, a backend web application framework designed for creating RESTful APIs using Node.js. Express leverages PostGIS for road geometries and Neo4j for road observations. The system filters outcomes based on user-defined criteria.

Several valuable insights can be derived from this system:

- Display the visual representation of road geometries on a map, providing the option to filter roads based on their IDs.
- Identify the least congested roads during specific time intervals on weekends.
- Visualize the top-n roads with the highest speeds on Sundays.
- Illustrate the probability distribution of speeds during the COVID-19 pandemic.
- Present the probability distribution of vehicle counts for specific roads.
- ...

Here is an image representing the software components involved:
![TrafficAnalyzer_Architecture](https://github.com/cxnturi0n/traffic-analyzer/assets/75443422/67525f4c-29ac-4f09-8b13-95d1f27be0ae)


## Postgis


