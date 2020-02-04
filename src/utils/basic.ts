import axios from "axios";

import geohash from "../utils/latlon-geohash";
import square from "@turf/square";
import explode from "@turf/explode";

export const convert = (data: object) => {
  const r = Object.entries(data).map(([key, value]) => {
    const centroid = geohash.decode(key);
    return {
      centroid: [centroid.lon, centroid.lat],
      count: value
    };
  });
  console.log(r);
  return r;
};

export const getData = async () => {
  const { data } = await axios.get("/api/observations");
  const converted = convert(data);
  return converted;
};
