import axios from "axios";

import geohash from "../utils/latlon-geohash";
import square from "@turf/square";
import explode from "@turf/explode";
import aggregated_geohash from "./geohash/geohash-aggregated-geojson";

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
  const converted = aggregated_geohash(data, 1);
  console.log(JSON.stringify(converted));
  return converted;
};

export const getZoomConfig = zoom => {
  if (zoom < 6) return [4, 1, 39.2];
  else if (zoom < 7) return [5, 0, 19.6];
  else if (zoom < 8) return [5, 1, 9.8];
  else if (zoom < 9) return [5, -1, 4.9];
  else if (zoom < 10) return [6, 0, 2.45];
  else if (zoom < 11) return [6, 1, 1.225];
  else if (zoom < 12) return [7, 0, 0.612];
  else if (zoom < 13) return [7, 1, 0.306];
  else if (zoom < 14) return [7, -1, 0.153];
  else if (zoom < 15) return [8, 0, 0.077];
  return [8, 1, 0.039];
};
