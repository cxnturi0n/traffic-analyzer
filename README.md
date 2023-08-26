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
The user interface is a Single Page Application, entirely created using ReactJS, a JavaScript library that facilitates the construction of user interfaces through component-based development. While I'm not an expert in frontend development, my intention was to offer you a more straightforward approach to conducting traffic analysis without the need to directly interact with raw APIs. Here is a usage example:

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

## Neo4j
As per the project specifications, the recorded data from the On-Board Units (OBU) installed on freight transportation vehicles needed to be stored in Neo4j. The dataset contains observations from three distinct regions: Anderlecht, Brussels, and Belgium. Each region comprises nine CSV files. Among these, three CSV files encompass observations spanning 2019/01/01 to 2019/01/03, with varying time granularities: 5, 15, and 30 minutes. An additional set of three CSV files contains observations between 2021/03/13 and 2021/06/06, again with differing time granularities. Lastly, the remaining three CSV files hold observations from 2021/06/05 to 2021/10/16, across the same range of time granularities. To persist this data I decided to create 9 different nodes. 3 nodes for each region, where each one of these contain observations over the 3 different intervals over a certain granularity. As an example, in the next image you can see it just for Anderlecht csv files but the same logic is applied for other regions, substituting "Anderlecht" with another region name: 

![CsvToNodes](https://github.com/cxnturi0n/traffic-analyzer/assets/75443422/da3c0af6-353b-4bdf-9314-ae27d8733898)

### Loading
The automation of CSV file loading into Neo4j is done through the deploy/init-neo4j.sh script, check it out. This script employs the Bolt protocol, an application protocol over HTTP that enables the execution of database queries, specifically Cypher in this context. To enhance efficiency during insertion, mitigating memory issues and minimizing completion time, the 'apoc.periodic.iterate' function is adopted. This function enables batch inserts and the distribution of these inserts across multiple CPUs.

An insertion statement invocation appears as follows:

`
CALL apoc.periodic.iterate(
  "LOAD CSV FROM 'file:///And_05min_0101_0103_2019.csv' AS line
   RETURN line",
  "CREATE (o:ObservationAnderlecht_5min {
     road_id: toInteger(line[1]),
     region: 'Anderlecht',
     timestamp: apoc.date.parse(line[0], 's', 'yyyy-MM-dd HH:mm:ss'),
     num_vehicles: toInteger(line[2]),
     avg_speed: toFloat(line[3])
   })",
  { batchSize: 10000, parallel: true });`

  
The first query loads batchSize lines from the csv and the second query is applied for each element in the batch, until the csv is over. By default if parallel is set to true, there will be 50 concurrent tasks performing the insert, but this value can be fine tuned setting the "concurrency" option to the value needed. I didn't really try to fine tune because on my pc the over reported configuration for loading Anderlecht observations (around 12 million nodes !) took me 2 minutes.

To speed up queries involving this substantial dataset, specific indexes are established. Notably, RANGE indexes are implemented for attributes like timestamp and road_id. These indexes significantly enhance query performance. Here are the index creation statements for timestamp and road_id over ObservationAnderlecht_5min nodes:`
CREATE INDEX Index_ObservationAnderlecht_5min_road_id IF NOT EXISTS FOR (o:ObservationAnderlecht_5min) ON (o.road_id);
CREATE INDEX Index_ObservationAnderlecht_5min_timestamp IF NOT EXISTS FOR (o:ObservationAnderlecht_5min) ON (o.timestamp);`

### Cypher queries
As you can see from the API Endpoints section, there are many queries that can be done, each with different combinations of parameters. Instead of having a separate function for each query combination and ending up with a lot of boilerplate code, I came up with a solution. In the backend/src/services/observations.service.js module, I designed a JavaScript function called 'getObservationsQueryWithFilters(params)' which is in charge of dynamically creating a specific Cypher query based on the given parameters.

For instance, when the user wants to find the least crowded roads in the Anderlecht region during a certain time, using a 5-minute dataset, and limiting the results to 500, it would trigger the browser to perform an HTTP request to this URI: /traffic-analyzer/api/roads/observations?type=least-crowded&region=Anderlecht&tbegin=1565812380&tend=1640463600&granularity=5. The function 'getObservationsQueryWithFilters(params)' would then generate this query:
`
MATCH (o:ObservationAnderlecht_5min)
WHERE o.timestamp >= 1565812380 AND o.timestamp < 1640463600 WITH o.road_id AS road_id, SUM(o.num_vehicles) AS sum_vehicles
ORDER BY sum_vehicles ASC 
LIMIT 500 
RETURN road_id ,sum_vehicles
`
This query will finally be executed by a neo4j driver session inside a read transaction and return the requested observations.

### Neo4j driver
The Neo4j JavaScript Driver is among the five officially endorsed drivers, with the other options encompassing Java, .NET, Python, and Go. I opted for this particular driver due to my requirement for a straightforward and efficient means of interacting with Neo4j, especially within a backend framework like Node.js. This choice was made to avoid the potentially complex initial setup of alternatives such as Spring Boot. Although my confidence in JavaScript is not as strong as it is in Java, I proceeded with this decision.
Since I'm not utilizing a cluster setup, I rely on a single instance of the driver, implemented through the Singleton Pattern, as shown in the backend/databases/neo4j.database.js module.
This driver establishes numerous TCP connections with the database. From this collection, a subset of connections can be borrowed by sessions that are responsible for performing sequences of transactions. In substance, this driver allowed me to ignore the intricacies of handling underlying resources like pools of database connections, so that I could focus on the business logic.

## Postgis



