<H2> Table of contents </H2>
<ul>
    <li><a href="#Introduction">Introduction</a></li>
    <li><a href="#Specifications">Specifications</a></li>
    <li><a href="#Overview">Implementation overview</a></li>
    <li><a href="#WebInterface">Web interface</a></li>
    <li><a href="#HybridApi">Hybrid API</a></li>
    <li><a href="#Neo4j">Neo4j</a></li>
    <li><a href="#Postgis">Postgis</a></li>
    <li><a href="#TryIt">Try it</a></li>
</ul>
<H2 id="Introduction">Introduction</H2>

This project was created as part of the NoSQL course within the Computer Science Master's Degree program at the University of Naples Federico II. It consists of a GRAND (GraphQL, React, Apollo, and Neo4j Database) stack web application designed for *road traffic analysis*. This application exposes a web interface developed in ReactJS, along with a hybrid API that enables you to query the observations stored in Neo4j through *GraphQL*, and access road geometries stored in PostGIS via a *REST API*.
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

<H2 id="Overview">Implementation Overview</H2>
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

https://github.com/cxnturi0n/traffic-analyzer/assets/75443422/70d988f1-d7c5-4a7d-b583-8e045d1cf332

<H2 id="HybridApi">Hybrid API</H2>

The API is empowered by Express, a backend web application framework designed for creating APIs using Node.js. It consists of an hybrid Api, where road observations can be queried using GraphQL and road geometries using rest endpoints. [Here](backend/server.js) is the source code of the server entrypoint.

<H3>Why Hybrid?</H3>

The motivation behind this decision was to reduce latency when rendering road geometries on a map. Road geometries are stored as collections of GeoJSONs, where each road consists of a polygon containing ring coordinates (each polygon can have one or more rings), represented as an array of latitude and longitude pairs.
Initially, I defined the following types to represent and query *Road* objects:
```
#graphql
  ...

  type Road {
    road_id: Int!
    polygon: Polygon!
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
A road has a road ID, and a polygon. Each polygon has a list of rings, and each ring has an array of coordinates representing latitude and longitude pairs. This structure was designed to allow the server to be queried for road geometries based on certain filters.
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
    polygon {
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
By leveraging REST, I was able to return the road geometries in the exact format that Leaflet expected, effectively reducing the latency to render the map in less than 1 second.

<H3>GraphQL Api</H3>

GraphQL is integrated into Express server using the Apollo Express Middleware. To get an in-depth look at how I've defined types and resolvers, you can explore the following files:
- [Typedefs](backend/src/graphql/typedefs.graphql.js): This file contains the type definitions that outline the GraphQL schema.
- [Resolvers](backend/src/graphql/resolvers.graphql.js): In this file, you'll find the resolver definitions responsible for resolving types by executing dynamic cypher queries.
- [Resolver implementations](backend/src/services/observations.service.js): In this file, you'll find the resolver implementations.


The clients can query observations using graqphQL syntax, that is simple and intuitive, mostly if you are familiar with json. You are only getting what you ask, and so there is not the risk of overfetching. If you only ask for the road ids and number of vehicles, you don't get timestamps and average speeds as well, like in a common rest api scenario would occur. The GraphQL server will handle the translation of the GraphQL query into a Cypher query and return the result in the JSON format as requested. The following diagram illustrates how the server processes a GraphQL query to retrieve the top 3 most congested roads from January 1, 2019, to January 16, 2019, specifically on weekends (Saturdays and Sundays).
First, the Apollo client in the browser initiates an HTTP POST request to the GraphQL server's endpoint. In the request body, the client includes the query and additional variables representing filters. The server then invokes the appropriate resolver, responsible for dynamically generating a Cypher query that can fulfill the user's request.
The query is executed, and the relevant fields are extracted. These extracted fields are then passed to Apollo Middleware, which encapsulates the data into an HTTP response and returns it in a simple JSON format.

![GraphQLlogic](https://github.com/cxnturi0n/traffic-analyzer/assets/75443422/d2e3de5d-8442-4097-b9c0-aa0e665df4c7)

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

<H3>Considerations</H3>

While Neo4j offers the *Neo4j GraphQL Library*, which automates GraphQL CRUD queries generation and provides complex filtering capabilities (and more), I opted for a custom GraphQL setup to gain more control over the queries. This allowed me to perform queries that extend beyond simple CRUD operations. For instance, I could execute queries to calculate the average speed of vehicles for each road, a task not readily achievable with autogenerated queries. Additionally, I had the flexibility to filter observations based on specific days of the week.
Implementing server-side GraphQL logic also provided a good opportunity to become more familiar with GraphQL concepts. I had the freedom to design types, inputs, enums, and resolvers. However, I didn't need to manually write field resolvers. This was made possible because the Apollo GraphQL library automatically generates them if GraphQL field names match neo4j node attribute names, and I made sure to enforce that to save some development time.

<H2 id="Neo4j">Neo4j</H2>

As per the project specifications, the recorded data from the On-Board Units (OBU) installed on freight transportation vehicles needed to be stored in Neo4j. The [dataset](https://www.kaggle.com/datasets/giobbu/belgium-obu) contains observations from three distinct regions: Anderlecht, Brussels, and Belgium. Each region comprises nine CSV files. Among these, three CSV files encompass observations spanning from 2019/01/01 to 2019/01/03, with varying time granularities: 5, 15, and 30 minutes. An additional set of three CSV files contains observations between 2021/03/13 and 2021/06/06, again with differing time granularities. Lastly, the remaining three CSV files hold observations from 2021/06/05 to 2021/10/16, across the same range of time granularities. To persist this data I decided to create 9 different nodes. 3 nodes for each region, where each one of these contain observations over the 3 different intervals over a certain granularity. As an example, in the next image you can see it just for Anderlecht csv files but the same logic is applied for other regions, substituting *Anderlecht* with another region name:

![CsvConversion](https://github.com/cxnturi0n/traffic-analyzer/assets/75443422/83334339-7c4f-4599-82d6-f85a4b9b59f4)

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

  
The first query loads *batchSize* lines from the csv and the second query is applied for each element in the batch, until the csv is over. By default if *parallel* is set to true, there will be 50 concurrent tasks performing the insert, but this value can be tuned by setting the *concurrency* option to the value needed. I didn't really try to fine tune it because on my pc the over reported configuration for loading Anderlecht observations (about 12 million nodes) took around 1 minute.

To speed up queries involving this substantial dataset, specific indexes are established. Notably, RANGE indexes are enforced for attributes like *timestamp* and *road_id*. These indexes significantly enhance query performance. Here are the index creation statements for timestamp and road_id over ObservationAnderlecht_5min nodes:
```
CREATE INDEX Index_ObservationAnderlecht_5min_road_id IF NOT EXISTS FOR (o:ObservationAnderlecht_5min) ON (o.road_id);
CREATE INDEX Index_ObservationAnderlecht_5min_timestamp IF NOT EXISTS FOR (o:ObservationAnderlecht_5min) ON (o.timestamp);
```

### Neo4j Javascript driver
The Neo4j JavaScript Driver is among the five officially supported drivers, with the other options encompassing Java, .NET, Python, and Go. I opted for this particular driver due to my requirement for a straightforward, secure and efficient means of interacting with Neo4j, especially within a backend framework like Node.js. This choice was made to avoid the potentially complex initial setup of alternatives such as Spring Boot. Although my confidence in JavaScript is not as strong as it is in Java, I proceeded with this decision.
Since I'm not utilizing a cluster setup, I rely on a single instance of the driver, implemented through the Singleton Pattern.
This driver establishes numerous TCP connections with the database. From this collection, a subset of connections are borrowed by sessions that are responsible for performing sequences of transactions. The driver additionally supports the use of placeholders in dinamic statements, to prevent sql injections. More details in the [neo4j.database.js](backend/src/databases/neo4j.database.js), [observations.controller.js](backend/src/controllers/observations.controller.js) and [observations.service.js](backend/src/services/observations.service.js) modules.

<H2 id="Postgis">Postgis</H2>
The database chosen for storing road geometries is PostGIS, which is an extension for PostgreSQL adding support storing, indexing and querying geographic data. I choose PostGIS as I was already familiar with PostgreSQL, and I did not have experience with any other Geospatial database.

### Loading
Geometries loading is automatized using [init-postgis.sh](deploy/init-postgis.sh) script. It leverages ogr2ogr utility from the Gdal package. The process was not straightforward. Geometries present in the dataset jsons were in CRS84 format, which represent polygon coordinates as a pairs of this type (&lt;longitude&gt;, &lt;latitude&gt;). Leaflet react components expect coordinates to be pairs of this type (&lt;latitude&gt;,&lt;longitude&gt;). Instead of performing the swaps on the backend or directly in the browser, causing performances issues, I switched the latitude and longitude fields of every road polygon in the jsons before performing the load on the database, using the following python script [swap_coordinates.py](deploy/swap_coordinates.py). It converts the CRS84 to a valid GeoJSON using WGS84 as coordinate reference system. After the conversion data is loaded using ogr2ogr. I am not sure if there is a way to perform this conversion directly with ogr2ogr, however, this approach worked fine. Here is an example of loading the Anderlecht geoJson into the database:
```
ogr2ogr -f "PostgreSQL" "PG:dbname=belgium_road_network user=postgres password=password host=192.168.1.130" "Anderlecht_streets.geojson" -nln "anderlecht_streets" -nlt "POLYGON"
```

### Postgres queries
Since the geometries are stored in the form of GeoJSON, fetching road geometries through a query is quite simple. For instance, to extract geometries related to Anderlecht, the following query is executed:
```
SELECT ogc_fid AS road_id, ST_AsGeoJSON(wkb_geometry) AS polygon FROM anderlecht_streets;
```
 The result of this query is an array of pairs that hold road IDs along with their corresponding geometries.

### Postgres Javascript driver
Postgis is an extension of Postgres so I could use the simple and well documented Javascript driver. To avoid opening a connection for each request, I used the out of the box connection pool provided by the driver itself. More details here: [postgres.databases.js](backend/src/databases/postgres.database.js).

<H2 id="TryIt">Try it</H2>

If you wish to try the software, you can follow these steps. At the end you will be able to access, locally, the react single page application, the Apollo GraphQL client web interface, the rest api for retrieving road geometries and the neo4j web interface. It works on both AMD64 and ARM64 architectures. This following is an image representing the [Docker Compose](deploy/docker-compose.yaml) containers: 

![ComposeServices](https://github.com/cxnturi0n/traffic-analyzer/assets/75443422/6667efb8-4e09-436b-8c0a-04e34733f065)

The containers are interconnected through a Docker network bridge called *traffic-analyzer-network*. This arrangement facilitates communication between the containers, employing their individual container names as hostnames. The Docker DNS (with the IP address 127.0.1.11) resolves these names to the respective IP addresses of the containers.
Within the setup, the *react_nginx* container is composed of an nginx server along with the compiled react web interface and apollo client. Nginx firstly acts as a web server, delivering the *index.html* file to user browsers when they access the webpage. Secondly, it acts as a reverse proxy, forwarding API requests initiated by the browser to the Express server running inside *nodejs_express* container. This Express server acts as a Rest and GraphQL server. It retrieves necessary data from the associated databases, running in *neo4j* and *postgis* containers, and subsequently responds with the relevant results. These responses are then processed by the browser to update various html components such as the Leaflet map, graphs, or tables within the user interface.


The [install.sh](deploy/install.sh) script handles the following tasks:
1. Installs necessary dependencies for launching services and loading data into the database. This involves tools like `ogr2ogr` from the GDAL package.
2. Downloads [road geometries](https://drive.google.com/file/d/1BXGqJDuagXCaF2V50XXh8zrCQFPSu7X4/view?usp=sharing) and [Anderlecht OBU CSVs](https://drive.google.com/file/d/1QqkWglvE26-KixXvIEQSjR3HZ_6_vgX3/view?usp=sharing) data from my personal Google Drive.
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

On my discrete pc the installation process takes around 5 minutes. Once done, you can access the following pages in your browser:
- React UI: http://localhost/traffic-analyzer
  
![ReactUI](https://github.com/cxnturi0n/traffic-analyzer/assets/75443422/c61f7bba-c8ac-4c8a-9c74-63d9c8eb3e8d)

- Neo4j UI: http://localhost:7474 (Credentials in [neo4j.env](deploy/neo4j.env))
  
![Neo4jUI](https://github.com/cxnturi0n/traffic-analyzer/assets/75443422/de5a5d88-2fd0-42d8-8833-3afcf5606652)

- Apollo GraphQL UI: http://localhost:8087/traffic-analyzer/api/observations

![ApolloUI](https://github.com/cxnturi0n/traffic-analyzer/assets/75443422/65864b18-e43d-48e2-b887-f5385daa85b3)
