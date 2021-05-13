# travel_agent

## Development setup

Start the docker compose file with

```
docker-compose up
```

Open localhost:7474 in your browser. Use username "neo4j" and password "letmein" to login. After that, seed the database with the following cypher query:

```
WITH '
SELECT *
WHERE { ?item wdt:P31 wd:Q4989906 .
        ?item wdt:P17 wd:Q29 .
        ?item rdfs:label ?monumentName .
        filter(lang(?monumentName) = "en")
        ?item wdt:P625 ?location .
        ?item wdt:P18 ?image} LIMIT 100' AS sparql
CALL apoc.load.jsonParams(
      "https://query.wikidata.org/sparql?query=" + apoc.text.urlencode(sparql),
      { Accept: "application/sparql-results+json"},
      null
    )
    YIELD value
UNWIND value.results.bindings as result
MERGE (m:Monument{id:result.item.value})
SET m.image = result.image.value,
    m.latitude = toFloat(replace(split(split(result.location.value, "(")[1], " ")[1], ")", "")),
    m.longitude = toFloat(split(split(result.location.value, "(")[1], " ")[0])
```

GraphQL endpoint is available at localhost:4001

A sample graphql query is:

```
query {
  monuments {
    name
    image
    latitude
    longitude
  }
}
```

