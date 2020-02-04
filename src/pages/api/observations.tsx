import axios from "axios";

export default async (req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  const {
    data: { viewFilteredGeohashAggregation }
  } = await axios.get(
    "https://venus.strandls.com/biodiv-api/naksha/search/observation/observation",
    {
      params: {
        count: 0,
        hasMore: true,
        max: 1,
        offset: 0,
        sort: "lastrevised",
        view: "map",
        geoAggregationField: "location",
        geoAggegationPrecision: 4,
        top: 37,
        left: 59,
        bottom: 5,
        right: 106,
        onlyFilteredAggregation: false
      }
    }
  );
  const data = JSON.parse(viewFilteredGeohashAggregation)[
    "geohash_grid#location-4"
  ].buckets;
  //.reduce(
  //   (acc, { key, doc_count }) => ({ ...acc, [key]: doc_count }),
  //   {}
  // )
  res.end(JSON.stringify(data));
};
