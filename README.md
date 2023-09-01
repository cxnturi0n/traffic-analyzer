<H2> Table of contents </H2>
<ul>
    <li><a href="#Introduction">Introduction</a></li>
    <li><a href="#Specifications">Specifications</a></li>
    <li><a href="#WebInterface">Web interface</a></li>
    <li><a href="#HybridApi">Hybrid API</a></li>
    <li><a href="#Neo4j">Neo4j</a></li>
    <li><a href="#Postgis">Postgis</a></li>
    <li><a href="#TryIt">Try it</a></li>
</ul>
<H2 id="Introduction">Introduction</H2>

This project was created as part of the NoSQL course within the Computer Science Master's Degree program at the University of Naples Federico II. It consists of a GRAND (GraphQL, React, Apollo, and Neo4j Database) stack web application designed for traffic analysis. This application exposes a web interface developed in ReactJS, along with a hybrid API that enables you to query the observations stored in Neo4j through *GraphQL*, and access road geometries stored in PostGIS via a *REST API*.
<H2 id="Specifications">Project Specifications</H2>
Since 2016, in Belgium, a maximum threshold (3.5 tons) has been imposed on the weight of trucks circulating on highways. Those exceeding this threshold must pay an additional toll for each kilometer traveled. For this purpose, the installation of an On-Board Unit (OBU) on the affected vehicles (approximately 140,000) has been made mandatory for monitoring movements. Each OBU sends a message approximately every 30 seconds.

Each line in the original dataset contains an ID (anonymously reset every day at 2 AM UTC), a timestamp, GPS coordinates (latitude, longitude), speed, and direction.

The dataset you will use is a modified version that tracks truck traffic on major Belgian highways and in the cities of Brussels and Anderlecht, at different temporal granularities. In particular, the dataset consists of 2 parts:

1) A collection of CSV files containing timestamps, road identifiers, number of vehicles in the time window, and average vehicle speed.

2) JSON files containing the geometries of the considered roads.

### Task

**Develop a system for the storage and spatiotemporal analysis of traffic conditions, with data visualization on a map. The underlying DBMS must necessarily be a hybrid composed of two systems: the first will be Neo4j, while the choice of the second is left to the group members.**

### Deliverable
1. Documentation (Each choice needs to be documented and justified) <br/><br/>
2. Script for data download and loading <br/><br/>
3. User Interface code (Optional)

<H2 id="Overview">Overview</H2>
You can either utilize a web interface or the api to conduct basic spatial and temporal analysis of traffic patterns. The web page is accessible through your preferred browser and retrieves necessary data via an API, which will be discussed in more detail later. Road geometries are persisted over Postgis and road observations on Neo4j. The system filters outcomes based on user-defined criteria.

Several valuable insights can be derived from this system, like for example:

- *Display the visual representation of road geometries on a map, providing the option to filter roads based on their IDs*.
- *Identify the least congested roads during specific time intervals on weekends.*
- *Visualize the top-n roads with the highest speeds on Sundays.*
- *Illustrate the probability distribution of speeds during the COVID-19 pandemic.*
- *Present the probability distribution of vehicle count for specific roads in certain intervals.*
- *...*


Here is an image representing the software components involved:

![BackendFrontend](https://github.com/cxnturi0n/traffic-analyzer/assets/75443422/c73c1741-aeca-4f9b-a05f-bb8ee9ee6e2f)


<H2 id="WebInterface">Web Interface</H2>
The user interface is a Single Page Application, entirely created using ReactJS, a JavaScript library that facilitates the construction of user interfaces through component-based development. While I'm not an expert nor a fan of frontend development, my intention was to offer you a more straightforward and yet simple approach to conduct traffic analysis without the need to directly interact with raw APIs. Maps are integrated using Leaflet React components. Here is a usage example:

https://github.com/cxnturi0n/traffic-analyzer/assets/75443422/2d6dfa43-c14a-4802-b0d6-d5caa3cedc01

<H2 id="HybridApi">Hybrid API</H2>

The API is empowered by Express, a backend web application framework designed for creating APIs using Node.js. It consists of an hybrid Api, where road observations can be queried using GraphQL and road geometries using rest endpoints. [Here](backend/server.js) is the source code of the server entrypoint.

<H3>Why Hybrid?</H3>

The motivation behind this decision was to reduce latency when rendering road geometries on a map. Road geometries are stored as collections of GeoJSONs, where each road consists of a polygon containing ring coordinates (each polygon can have one or more rings), represented as an array of latitude and longitude pairs.

The reason of this decision was to reduce latency to render road geometries on the map. Road geometries are stored as collections of geojsons, where each road consists of a polygon, which contain ring coordinates(each polygon can have 1 or more rings), as an array of latitude and longitude. Initially, I defined following typedefs to represent a *Road* object:
```
#graphql
  ...

  type Road {
    road_id: Int!
    polygons: [Polygon]!
  }

  type Polygon {
    rings: [LinearRing!]!
  }

  type LinearRing {
    coordinates: [Coordinate!]!
  }
  
  type Coordinate {
    latitude: Float!
    longitude: Float!
  }


  type Query {
    ...

    roads(where: RoadGeometriesWhere): [Road!]!
  }

```
A road has a road ID, and a list of polygons, where each polygon has a list of rings, and each ring has an array of coordinates representing latitude and longitude pairs. This structure was designed to allow the server to be queried for road geometries based on certain filters.
The challenge with this approach surfaced on the frontend. React Leaflet expects road geometries in the following format:
```
[ [
    [
        [
            [lat,lng],
            [lat,lng],...
        ],
        [
            [lat,lng],
            [lat,lng],...
        ],
    ],
    [
        [
            [lat,lng],
            [lat,lng],...
        ],
        [
            [lat,lng],
            [lat,lng],...
        ],
    ],
] ]
```
To query and fetch all road geometries for a specific area, I used a query similar to this one:
```
query Roads($where: RoadGeometriesWhere) {
  roads(where: $where) {
    road_id
    polygons {
      rings {
        coordinates {
          longitude
          latitude
        }
      }
    }
  }
}
{
  "where": {
    "roadIds": null,
    "region": "Anderlecht"
  }
}
```
Before rendering these geometries on the map, I had to convert the array of Road objects returned by the server into the format expected by Leaflet. This conversion process placed a significant load on the browser and turned out to be slow and inefficient, taking approximately 10 seconds to render all road geometries for a region like Anderlecht.
By leveraging REST, I was able to return the road geometries in the exact format that Leaflet expected, effectively reducing the latency to render the map to just 1 second.

<H3>Rest Api</H3>

### 1. Get Road Geometries

**Endpoint:** `/traffic-analyzer/api/roads`
- **Parameters:**
  - `region` (String, Mandatory): Select the region of the roads.
- **Example:**
  - Get Anderlecht road polygons: `/traffic-analyzer/api/roads?region=Anderlecht`

### 2. Get Road Geometries by IDs

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

<H3>GraphQL Api</H3>

GraphQL is integrated into Express server using the Apollo Express Middleware. To get an in-depth look at how I've defined types and resolvers, you can explore the following files:
- [Typedefs](backend/src/graphql/typedefs.graphql.js): This file contains the type definitions that outline the GraphQL schema.
- [Resolvers](backend/src/graphql/resolvers.graphql.js): In this file, you'll find the resolver definitions responsible for resolving types by executing dynamic cypher queries.
- [Resolvers implementation](backend/src/graphql/resolvers.graphql.js): In this file, you'll find the resolvers implementation.


The clients can query observations using graqphql syntax, that is simple and intuitive, mostly if you are familiar with json. You are only getting what you ask, and so there is not the risk of overfetching. If you only ask for the road ids and number of vehicles, you don't get timestamps and average speeds as well, like in a common rest api scenario would occur. The graphql server will take care of translating the graphql query into a cypher query, and will return the result in the json format you asked. The following picture shows how a graphql query to get the first 3 most congested roads from 2019/01/01 to 2019/01/16, on weekends (saturdays and sundays) is managed by the server. First, the apollo client on the browser triggers an http post request towards the graphql server endpoint, passing in the body the query and additional variables that represent filters. The server then invokes the appropriate resolver which is in charge of dinamically creating a cypher query that can resolve the type asked by the user. The query is run, relevant fields are extracted and forwarded to Apollo Middleware that will incapsulate the data into an http response and return it as a simple JSON. 

![GraphQLLogic](https://github.com/cxnturi0n/traffic-analyzer/assets/75443422/e9625300-ef51-4abd-bc7a-040b65cacd18)


While Neo4j offers the *Neo4j GraphQL Library*, which automates GraphQL CRUD queries generation and provides complex filtering capabilities (and more), I opted for a custom GraphQL setup to gain more control over the queries. This allowed me to perform queries that extend beyond simple CRUD operations. For instance, I could execute queries to calculate the sum of vehicles for each road, a task not readily achievable with autogenerated queries. Additionally, I had the flexibility to filter observations based on specific days of the week.

Implementing GraphQL in this manner also provided an excellent opportunity to become more familiar with GraphQL concepts. We had the freedom to design types, inputs, enums, and resolvers. While field resolvers were autogenerated, this happened because the type field names matched the attribute names of Neo4j nodes, simplifying our development process. I didn't need to manually write field resolvers. This was made possible because the Apollo GraphQL library automatically generated them, because I made sure that GraphQL field names precisely matched with the neo4j node attribute names.

<H2 id="Neo4j">Neo4j</H2>

As per the project specifications, the recorded data from the On-Board Units (OBU) installed on freight transportation vehicles needed to be stored in Neo4j. The dataset contains observations from three distinct regions: Anderlecht, Brussels, and Belgium. Each region comprises nine CSV files. Among these, three CSV files encompass observations spanning from 2019/01/01 to 2019/01/03, with varying time granularities: 5, 15, and 30 minutes. An additional set of three CSV files contains observations between 2021/03/13 and 2021/06/06, again with differing time granularities. Lastly, the remaining three CSV files hold observations from 2021/06/05 to 2021/10/16, across the same range of time granularities. To persist this data I decided to create 9 different nodes. 3 nodes for each region, where each one of these contain observations over the 3 different intervals over a certain granularity. As an example, in the next image you can see it just for Anderlecht csv files but the same logic is applied for other regions, substituting *Anderlecht* with another region name:

![CsvsToNodes](https://github.com/cxnturi0n/traffic-analyzer/assets/75443422/68fff2b9-87d6-4a5c-8cbc-dba73fbc2fcb)

### Loading
The automation of CSV file loading into Neo4j is done through the [init-neo4j.sh](deploy/init-neo4j.sh) script. This script employs the Bolt protocol, an application protocol over HTTP that enables the execution of database queries, specifically Cypher in this context. To enhance efficiency during insertion, mitigating memory issues and minimizing completion time, the `apoc.periodic.iterate` function is adopted. This function enables batch inserts and the distribution of these inserts across multiple CPUs.

An insertion statement invocation appears as follows:

```
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
  { batchSize: 10000, parallel: true });
```

  
The first query loads *batchSize* lines from the csv and the second query is applied for each element in the batch, until the csv is over. By default if *parallel* is set to true, there will be 50 concurrent tasks performing the insert, but this value can be tuned by setting the *concurrency* option to the value needed. I didn't really try to fine tune it because on my pc the over reported configuration for loading Anderlecht observations (about 12 million nodes) took around 2 minutes.

To speed up queries involving this substantial dataset, specific indexes are established. Notably, RANGE indexes are enforced for attributes like *timestamp* and *road_id*. These indexes significantly enhance query performance. Here are the index creation statements for timestamp and road_id over ObservationAnderlecht_5min nodes:
```
CREATE INDEX Index_ObservationAnderlecht_5min_road_id IF NOT EXISTS FOR (o:ObservationAnderlecht_5min) ON (o.road_id);
CREATE INDEX Index_ObservationAnderlecht_5min_timestamp IF NOT EXISTS FOR (o:ObservationAnderlecht_5min) ON (o.timestamp);
```

### Neo4j Javascript driver
The Neo4j JavaScript Driver is among the five officially supported drivers, with the other options encompassing Java, .NET, Python, and Go. I opted for this particular driver due to my requirement for a straightforward, secure and efficient means of interacting with Neo4j, especially within a backend framework like Node.js. This choice was made to avoid the potentially complex initial setup of alternatives such as Spring Boot. Although my confidence in JavaScript is not as strong as it is in Java, I proceeded with this decision.
Since I'm not utilizing a cluster setup, I rely on a single instance of the driver, implemented through the Singleton Pattern.
This driver establishes numerous TCP connections with the database. From this collection, a subset of connections are borrowed by sessions that are responsible for performing sequences of transactions. The driver additionally supports the use of placeholders in dinamic statements, to prevent sql injections. More details in the [backend/src/databases/neo4j.database.js](backend/src/databases/neo4j.database.js) and [backend/src/services/observations.service.js](backend/src/services/observations.service.js) modules.

<H2 id="Postgis">Postgis</H2>
The database chosen for storing road geometries is PostGIS, which is an extension for PostgreSQL adding support storing, indexing and querying geographic data. I choose PostGIS as I was already familiar with PostgreSQL, and I did not have any other experience with other Geospatial databases.

### Loading
Geometries loading is automatized using [deploy/init-postgis.sh](deploy/init-postgis.sh) script. It leverages ogr2ogr utility from the Gdal package. The process was not straightforward. Geometries present in the dataset jsons were in CRS84 format, which represent polygon coordinates as a pairs of this type (&lt;longitude&gt;, &lt;latitude&gt;). Leaflet react components expect coordinates to be pairs of this type (&lt;latitude&gt;,&lt;longitude&gt;). Instead of performing the swaps on the backend or directly in the browser, causing performances issues, I switched the latitude and longitude fields of every road polygon in the jsons before performing the load on the database, using the following python script [deploy/swap_coordinates.py](deploy/swap_coordinates.py). It converts the CRS84 to a valid GeoJSON using WGS84 as coordinate reference system. After the conversion data is loaded using ogr2ogr. I am not sure if there is a way to perform this conversion directly with ogr2ogr, however, this approach worked fine. Here is an example of loading the Anderlecht geoJson into the database:
```
ogr2ogr -f "PostgreSQL" "PG:dbname=belgium_road_network user=postgres password=password host=192.168.1.130" "Anderlecht_streets.geojson" -nln "anderlecht_streets" -nlt "POLYGON"
```

### Postgres queries
Since the geometries are stored in the form of GeoJSON, fetching road geometries through a query is quite simple. For instance, to extract geometries related to Anderlecht, the following query is executed:
```
SELECT ogc_fid AS road_id, ST_AsGeoJSON(wkb_geometry) AS polygons FROM anderlecht_streets;
```
 The result of this query is an array of pairs that hold road IDs along with their corresponding geometries, specifically polygons. Each polygon is represented as an array of latitude and longitude coordinates.

### Postgres Javascript driver
Postgis is an extension of Postgres so I could use the simple and well documented Javascript driver. To avoid opening a connection for each request, I used the out of the box connection pool provided by the driver itself. More details here: [backend/src/databases/postgres.databases.js](backend/src/databases/postgres.database.js).

<H2 id="TryIt">Try it</H2>

If you wish to try the software, you can follow these steps. At the end you will be able to access, locally, the react single page application, the Apollo GraphQL client web interface, the rest api for retrieving road geometries, the neo4j web interface and optionally(if decommented from the docker compose) to pg-admin. You should be equipped with a Linux environment with docker, npm and yarn already installed. It works on both AMD64 and ARM64 architectures. This is an image representing the [Docker Compose](deploy/docker-compose.yaml) containers: 

![DockerCompose](https://github.com/cxnturi0n/traffic-analyzer/assets/75443422/8f8f7cc8-c66b-449a-8ebe-bd89eb54e7bc)

The containers are interconnected through a Docker network bridge called *deploy_default*. This arrangement facilitates communication between the containers, employing their individual container names as hostnames. The Docker DNS (with the IP address 127.0.1.11) resolves these names to the respective IP addresses of the containers.
Within the setup, the *react_nginx* container is composed of an nginx server along with the compiled react web interface and it is the only container exposed to the outside on port 80. Nginx firstly acts as a web server, delivering the *index.html* file to user browsers when they access the webpage. Secondly, it acts as a reverse proxy, forwarding API requests initiated by the browser to the Express server running inside *nodejs_express* container. This Express server acts as a Rest and GraphQL server. It retrieves necessary data from the associated databases, running in *neo4j* and *postgis* containers, and subsequently responds with the relevant results. These responses are then processed by the browser to update various html components such as the Leaflet map, graphs, or tables within the user interface.


The [install.sh](deploy/install.sh) script handles the following tasks:
1. Installs necessary dependencies for launching services and loading data into the database. This involves tools like `ogr2ogr` from the GDAL package.
2. Downloads road geometries and OBU CSV files from my personal Google Drive.
3. Builds the Docker image for the React webpage along with the NGINX web server.
4. Builds the Docker image for the Node.js Express server.
5. Pulls Docker images for Neo4j, PostGIS, and optionally PGAdmin.
6. Initiates Docker containers in detached mode.
7. Executes the `init-postgis.sh` script to convert road geometries into GeoJSON format and loads them into PostGIS.
8. Executes the `init-neo4j.sh` script to load CSV files and indexes into Neo4j.

If I have convinced you that I will not install any malware on your machine you can follow these simple steps to proceed with the installation:

1. Clone the repository:
```
git clone https://github.com/cxnturi0n/traffic-analyzer.git
```
3. Navigate to the deploy directory:
```
cd traffic-analyzer/deploy
```
5. Provide execute permissions to the `install.sh` script:
```
chmod u+x install.sh
```
7. Run the script:
```
./install.sh
```

Once done, you can access the following in your browser:
- React UI: http://localhost/traffic-analyzer
- Neo4j UI: http://localhost:7474 (Use bolt protocol with credentials in neo4j.env)
- Apollo GraphQL Web Client: http://localhost:8087/traffic-analyzer/api/observations
- PGAdmin UI: http://localhost:5555 (Credentials in pgadmin.env)

