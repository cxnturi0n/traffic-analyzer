<H2> Table of contents </H2>
<ul>
    <li><a href="#Introduction">Introduction</a></li>
    <li><a href="#Specifications">Specifications</a></li>
    <li><a href="#WebInterface">Web interface</a></li>
    <li><a href="#ApiEndpoints">Api endpoints</a></li>
    <li><a href="#Neo4j">Neo4j</a></li>
    <li><a href="#Postgis">Postgis</a></li>
    <li><a href="#TryIt">Try it</a></li>
</ul>
<H2 id="Introduction">Introduction</H2>
This project was created as part of the NoSQL course within the Computer Science Master's Degree program at the University of Naples Federico II. It consists of a minimal full stack web application designed for traffic analysis, with a web interface developed in ReactJS, linked to a Nodejs Express server that retrieves road geometries from PostGIS and gathers observations from Neo4j. 
<H2 id="Specifications">Project Specifications</H2>
Since 2016, in Belgium, a maximum threshold (3.5 tons) has been imposed on the weight of trucks circulating on highways. Those exceeding this threshold must pay an additional toll for each kilometer traveled. For this purpose, the installation of an On-Board Unit (OBU) on the affected vehicles (approximately 140,000) has been made mandatory for monitoring movements. Each OBU sends a message approximately every 30 seconds.

Each line in the original dataset contains an ID (anonymously reset every day at 2 AM UTC), a timestamp, GPS coordinates (latitude, longitude), speed, and direction.

The dataset you will use is a modified version that tracks truck traffic on major Belgian highways and in the cities of Brussels and Anderlecht, at different temporal granularities. In particular, the dataset consists of 2 parts:

1) A collection of CSV files containing timestamps, road identifiers, number of vehicles in the time window, and average vehicle speed.

2) JSON files containing the geometries of the considered roads.

### Task

**Develop a system for the storage and spatiotemporal analysis of traffic conditions, with data visualization on a map. The underlying DBMS must necessarily be a hybrid composed of two systems: the first will be Neo4j, while the choice of the second is left to the group members.**

### Deliverable
1. Documentation <br/><br/>
2. Script for data download and loading <br/><br/>
3. User Interface code (Optional)

<H2 id="Overview">Overview</H2>
You can either utilize a web interface or the api to conduct basic spatial and temporal analysis of traffic patterns. The web page is accessible through your preferred browser and retrieves necessary data via an API, which will be discussed in more detail later. Road geometries are persisted over Postgis and road observations on Neo4j. The system filters outcomes based on user-defined criteria.

Several valuable insights can be derived from this system, like for example:

- *Display the visual representation of road geometries on a map, providing the option to filter roads based on their IDs*.
- *Identify the least congested roads during specific time intervals on weekends.*
- *Visualize the top-n roads with the highest speeds on Sundays.*
- *Illustrate the probability distribution of speeds during the COVID-19 pandemic.*
- *Present the probability distribution of vehicle counts for specific roads.*
- *...*


Here is an image representing the software components involved:

![Architecture](https://github.com/cxnturi0n/traffic-analyzer/assets/75443422/67525f4c-29ac-4f09-8b13-95d1f27be0ae)


<H2 id="WebInterface">Web Interface</H2>
The user interface is a Single Page Application, entirely created using ReactJS, a JavaScript library that facilitates the construction of user interfaces through component-based development. While I'm not an expert nor a fan of frontend development, my intention was to offer you a more straightforward and yet simple approach to conducting traffic analysis without the need to directly interact with raw APIs. Maps are integrated using Leaflet React components. Here is a usage example:

https://github.com/cxnturi0n/traffic-analyzer/assets/75443422/7be0c789-cb33-456c-8204-c5e6f0ac1656

<H2 id="ApiEndpoints">Api Endpoints</H2>
The API is empowered by Express, a backend web application framework designed for creating RESTful APIs using Node.js. Here is an overview of the endpoints with the available query parameters:

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

<H2 id="Neo4j">Neo4j</H2>
As per the project specifications, the recorded data from the On-Board Units (OBU) installed on freight transportation vehicles needed to be stored in Neo4j. The dataset contains observations from three distinct regions: Anderlecht, Brussels, and Belgium. Each region comprises nine CSV files. Among these, three CSV files encompass observations spanning 2019/01/01 to 2019/01/03, with varying time granularities: 5, 15, and 30 minutes. An additional set of three CSV files contains observations between 2021/03/13 and 2021/06/06, again with differing time granularities. Lastly, the remaining three CSV files hold observations from 2021/06/05 to 2021/10/16, across the same range of time granularities. To persist this data I decided to create 9 different nodes. 3 nodes for each region, where each one of these contain observations over the 3 different intervals over a certain granularity. As an example, in the next image you can see it just for Anderlecht csv files but the same logic is applied for other regions, substituting *Anderlecht* with another region name:

![CsvsToNodes](https://github.com/cxnturi0n/traffic-analyzer/assets/75443422/d3176a8f-dbb6-46ee-b126-8b09c7ee0e92)


### Loading
The automation of CSV file loading into Neo4j is done through the [init-neo4j.sh](deploy/init-neo4j.sh), check it out. This script employs the Bolt protocol, an application protocol over HTTP that enables the execution of database queries, specifically Cypher in this context. To enhance efficiency during insertion, mitigating memory issues and minimizing completion time, the `apoc.periodic.iterate` function is adopted. This function enables batch inserts and the distribution of these inserts across multiple CPUs.

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

  
The first query loads *batchSize* lines from the csv and the second query is applied for each element in the batch, until the csv is over. By default if *parallel* is set to true, there will be 50 concurrent tasks performing the insert, but this value can be fine tuned setting the *concurrency* option to the value needed. I didn't really try to fine tune because on my pc the over reported configuration for loading Anderlecht observations (around 12 million nodes) took me 2 minutes.

To speed up queries involving this substantial dataset, specific indexes are established. Notably, RANGE indexes are enforced for attributes like *timestamp* and *road_id*. These indexes significantly enhance query performance. Here are the index creation statements for timestamp and road_id over ObservationAnderlecht_5min nodes:`
CREATE INDEX Index_ObservationAnderlecht_5min_road_id IF NOT EXISTS FOR (o:ObservationAnderlecht_5min) ON (o.road_id);
CREATE INDEX Index_ObservationAnderlecht_5min_timestamp IF NOT EXISTS FOR (o:ObservationAnderlecht_5min) ON (o.timestamp);`

### Cypher queries
As you can see from the API Endpoints section, there are many queries that can be done, each with different combinations of parameters. Instead of having a separate function for each query combination and ending up with a lot of boilerplate code, I came up with a solution. In the [backend/src/services/observations.service.js](backend/src/services/observations.service.js) module, I designed a JavaScript function called `getObservationsQueryWithFilters(params)` which is in charge of dynamically creating a specific Cypher query based on the given parameters.

For instance, when the user wants to find the least crowded roads in the Anderlecht region during a certain time period, using a 5-minute dataset, and limiting the results to 500, it would trigger the browser to perform an HTTP request to this URI: `/traffic-analyzer/api/roads/observations?type=least-crowded&region=Anderlecht&tbegin=1565812380&tend=1640463600&granularity=5`. The function `getObservationsQueryWithFilters(params)` would then generate this query:
`
MATCH (o:ObservationAnderlecht_5min)
WHERE o.timestamp >= 1565812380 AND o.timestamp < 1640463600 WITH o.road_id AS road_id, SUM(o.num_vehicles) AS sum_vehicles
ORDER BY sum_vehicles ASC 
LIMIT 500 
RETURN road_id ,sum_vehicles
`
This query will finally be executed by a neo4j driver session inside a read transaction and return the requested observations.

### Neo4j Javascript driver
The Neo4j JavaScript Driver is among the five officially supported drivers, with the other options encompassing Java, .NET, Python, and Go. I opted for this particular driver due to my requirement for a straightforward, secure and efficient means of interacting with Neo4j, especially within a backend framework like Node.js. This choice was made to avoid the potentially complex initial setup of alternatives such as Spring Boot. Although my confidence in JavaScript is not as strong as it is in Java, I proceeded with this decision.
Since I'm not utilizing a cluster setup, I rely on a single instance of the driver, implemented through the Singleton Pattern.
This driver establishes numerous TCP connections with the database. From this collection, a subset of connections are borrowed by sessions that are responsible for performing sequences of transactions. The driver additionally supports the use of placeholders in dinamic statements, to prevent sql injections. More details in the [backend/src/databases/neo4j.dhttps://github.com/cxnturi0n/traffic-analyzer/tree/main/frontend/srcatabase.js](backend/src/databases/neo4j.database.js) and [backend/src/services/observations.service.js](backend/src/services/observations.service.js) modules.

<H2 id="Postgis">Postgis</H2>
The database chosen for storing road geometries is PostGIS, which is an extension for PostgreSQL adding support storing, indexing and querying geographic data. I choose PostGIS as I was already familiar with PostgreSQL, and I did not have any other experience with other Geospatial databases.

### Loading
Geometries loading is automatized using [deploy/init-postgis.sh](deploy/init-postgis.sh) script. It leverages ogr2ogr utility from the Gdal package. The process was not straightforward. Geometries present in the dataset jsons were in CRS84 format, which represent polygon coordinates as a pairs of this type (<longitude>, <latitude>). Leaflet react components expect coordinates to be pairs of this type (<latitude>,<longitude>). Instead of performing the swaps on the backend or directly in the browser, causing performances issues, I switched the latitude and longitude fields of every road polygon in the jsons before performing the load on the database, using the following python script [deploy/swap_coordinates.py](deploy/swap_coordinates.py). It converts the CRS84 to a valid GeoJSON using WGS84 as coordinate reference system. After the conversion data is loaded using ogr2ogr. I am not sure if there is a way to perform this conversion directly with ogr2ogr though. Here is an example of loading the Anderlecht geoJson into the database:
`ogr2ogr -f "PostgreSQL" "PG:dbname=belgium_road_network user=postgres password=password host=192.168.1.130" "Anderlecht_streets.geojson" -nln "anderlecht_streets" -nlt "POLYGON"`

### Postgres queries
Since the geometries are stored in the form of GeoJSON, fetching road geometries through a query is quite simple. For instance, to extract geometries related to Anderlecht, the following query is executed: `SELECT ogc_fid AS road_id, ST_AsGeoJSON(wkb_geometry) AS polygons FROM anderlecht_streets`. The result of this query is an array of pairs that hold road IDs along with their corresponding geometries, specifically polygons. Each polygon is represented as an array of latitude and longitude coordinates.

### Postgres Javascript driver
Postgis is an extension of Postgres so I could use the simple and well documented Javascript driver. To avoid opening a connection for each request, I used the out of the box connection pool provided by the driver itself. More details here: [backend/src/databases/postgres.databases.js](backend/src/databases/postgres.databases.js).

<H2 id="TryIt">Try it</H2>
To demonstrate the software in action to the professors, I'm presenting two approaches. 

### Deploy locally through docker compose
Although a bit more complex, grants you complete control over the involved services. This includes accessing the webpage, the API, PGAdmin (if uncommented from the docker-compose file), and the Neo4j web interface. To proceed with this approach, you should be equipped with a Linux environment containing Docker, as the initialization scripts require it. I have successfully tested it on both AMD64 and ARM64 architectures. This is an image representing the [Docker Compose](deploy/docker-compose.yaml) containers: 

![Docker](https://github.com/cxnturi0n/traffic-analyzer/assets/75443422/8f452d62-7d52-41fe-b2e9-0ba432846cef)


The containers are interconnected through a Docker network bridge called *deploy_default* This arrangement facilitates communication between the containers, employing their individual container names as hostnames. The Docker DNS (with the IP address 127.0.1.11) resolves these names to the respective IP addresses of the containers.
Within the setup, the "nginx_react" is composed of an nginx server along with the compiled react web interface. Nginx firstly acts as a web server, delivering the *index.html* file to user browsers when they access the webpage. Secondly, it acts as a reverse proxy, forwarding API requests initiated by the browser to the Express server. This Express server retrieves necessary data from the associated databases and subsequently responds with the relevant results. These responses are then processed by the browser to update various components such as the Leaflet map, graphs, or tables within the user interface.


The [install.sh](deploy/install.sh) script handles the following tasks:
1. Installs necessary dependencies for launching services and loading data into the database. This involves tools like `ogr2ogr` from the GDAL package.
2. Downloads road geometries and OBU CSV files from my personal Google Drive.
3. Builds the Docker image for the React webpage along with the NGINX web server.
4. Builds the Docker image for the Node.js Express server.
5. Pulls Docker images for Neo4j, PostGIS, and optionally PGAdmin.
6. Initiates Docker containers in detached mode.
7. Executes the `init-postgis.sh` script to convert road geometries into GeoJSON format and loads them into PostGIS.
8. Executes the `init-neo4j.sh` script to load CSV files into Neo4j.

If I have convinced you that I will not install any malware on your machine you can follow these simple steps to proceed with the installation:

1. Clone the repository: `git clone https://github.com/cxnturi0n/traffic-analyzer.git`
2. Navigate to the deploy directory: `cd traffic-analyzer/deploy`
3. Provide execute permissions to the `install.sh` script: `chmod u+x install.sh`
4. Run the script: `./install.sh`

Once done, you can access the following in your browser:
- React UI: http://localhost/traffic-analyzer
- Neo4j UI: http://localhost:7474 (Use bolt protocol with credentials in neo4j.env)
- PGAdmin UI: http://localhost:5555 (Credentials in pgadmin.env)

### Directly try Web UI

The second approach is the faster but just gives access to the web UI. Connect to https://projects.fabiocinicolo.dev/traffic-analyzer. It has been deployed on my raspberry pi, which of course will not guarantee you good performances due to its limited computational resources and additionally could be offline sometimes for personal reasons. As the storage is limited, I just loaded Anderlecht csvs, so you can "only" query the 12 millions observations over the Anderlecht region.

