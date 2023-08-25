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
![Architecture](https://github.com/cxnturi0n/traffic-analyzer/assets/75443422/67525f4c-29ac-4f09-8b13-95d1f27be0ae)





## Web Interface
The user interface has been entirely created using ReactJS, a JavaScript library that facilitates the construction of user interfaces through component-based development. While I'm not an expert in frontend development, my intention was to offer you a more straightforward approach to conducting traffic analysis without the need to directly interact with raw APIs. Here is a usage example:

https://github.com/cxnturi0n/traffic-analyzer/assets/75443422/7be0c789-cb33-456c-8204-c5e6f0ac1656


## API Endpoints

### 1. Get Road Polygons

**Endpoint:** `/traffic-analyzer/api/roads`
- **Parameters:**
  - `region` (String, Mandatory): Select the region of the roads.
- **Example:**
  - Get Anderlecht road polygons: `/traffic-analyzer/api/roads?region=Anderlecht`

### 2. Get Road Polygons by IDs

**Endpoint:** `/traffic-analyzer/api/roads`
- **Parameters:**
  - `region` (String, Mandatory): Select the region of the roads.
  - `roadIds` (Array of integers, Optional): Only select roads with specified IDs.
- **Example:**
  - Retrieve road polygons for roads with IDs 123, 64, and 718 in Brussels: `/traffic-analyzer/api/roads?region=Bruxelles&roadIds=[123,64,718]`
    
### 3. Get Road Count by Region

**Endpoint:** `/traffic-analyzer/api/roads`
- **Parameters:**
  - `region` (String, Mandatory): Select the region of the roads.
  - `count` (Boolean, Optional): Get the count of roads.
- **Example:**
  - Get road count for Belgium: `/traffic-analyzer/api/roads?region=Belgium&count=true`

### 4. Get Road Observations

**Endpoint:** `/traffic-analyzer/api/roads/observations`
- **Parameters:**
  - `region` (String, Mandatory)
  - `granularity` (Integer, Mandatory): 5, 10, or 15 - filter observations by time granularity.
  - `type` (String, Optional): Options - most-crowded, less-crowded, most-speed, least-speed.
  - `roadIds` (Array of integers, Optional)
  - `polygons` (Boolean, Optional): Return road polygons if true.
  - `tbegin` (Integer, Optional): Unix timestamp for the start time (seconds precision).
  - `tend` (Integer, Optional): Unix timestamp for the end time (seconds precision).
  - `days` (Array of integers, Optional): Select observations on specific days of the week (0=Sunday, 1=Monday, ..., 6=Saturday). 
  - `limit` (Integer, Optional): Limit the result size.
- **Examples:**
  - Get least congested roads in Anderlecht within a time interval, using a 5-minute dataset: `/traffic-analyzer/api/roads/observations?type=least-crowded&region=Anderlecht&tbegin=1565812380&tend=1640463600&granularity=5`
  - Get roads with the highest speeds in Anderlecht starting from a given timestamp, focusing on weekends, using a 15-minute granularity dataset, and returning road geometries as well: `/traffic-analyzer/api/roads/observations?type=most-speed&region=Anderlecht&tbegin=1565812380&days=[6,0]&granularity=15&polygons=true`
  - Get observations of specific roads in Anderlecht captured on Mondays: `/traffic-analyzer/api/roads/observations?region=Anderlecht&roadIds=[10,40,65]&days=[1]&granularity=15&limit=10000`


### 5. Get Number of Vehicles

**Endpoint:** `/traffic-analyzer/api/roads/observations/num-vehicles`
- **Parameters:**
  - `region` (String, Mandatory)
  - `granularity` (Integer, Mandatory)
  - `roadIds` (Array of integers, Optional)
  - `tbegin` (Integer, Optional)
  - `tend` (Integer, Optional)
  - `days` (Array of integers, Optional)
  - `limit` (Integer, Optional)
- **Example:**
  - Get vehicle count in Anderlecht within a specific time interval, focusing on weekdays, using a 30-minute granularity dataset, for roads with IDs 1000 and 2000: `/traffic-analyzer/api/roads/observations/num-vehicles?region=Anderlecht&roadIds=[1000,2000]&tbegin=1565812380&tend=1640463600&granularity=30&days=[1,2,3,4,5]`

### 6. Get Average Speeds

**Endpoint:** `/traffic-analyzer/api/roads/observations/avg-speeds`
- **Parameters:**
  - `region` (String, Mandatory)
  - `granularity` (Integer, Mandatory)
  - `roadIds` (Array of integers, Optional)
  - `tbegin` (Integer, Optional)
  - `tend` (Integer, Optional)
  - `days` (Array of integers, Optional)
  - `limit` (Integer, Optional)
- **Example:**
  - Obtain average speeds in Brussels using a 5-minute granularity dataset, with observations limited to 30000: `/traffic-analyzer/api/roads/observations/avg-speeds?region=Bruxelles&granularity=5&limit=30000`

