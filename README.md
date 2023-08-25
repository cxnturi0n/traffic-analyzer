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
You can perform some basic spatial and temporal traffic analysis through a simple web interface you can access from your favourite browser. The web page fetches the data needed via an api that will be discussed later, that is empowered by express, which is a backend web application framework for building RESTful APIs with Node.js. Express queries PostGIS for road geometries and Neo4j for road observations, filtering outcomes based on user-specified filters. Here is an image representing the software components involved:
![Architecture](https://github.com/cxnturi0n/traffic-analyzer/assets/75443422/2b98e1dc-1bd7-438d-964f-df422f1689c9)
