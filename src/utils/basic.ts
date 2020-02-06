import axios from "axios";

import geohashToJSON from "./geo";
import Rainbow from "rainbowvis.js";
import Colors from "colorbrewer";
import legends from "./legends";
import geohash from "./latlon-geohash";

export const getData = async () => {
  const { data } = await axios.get("/api/observations");
  const geojson = geohashToJSON(data, 1);
  const { min, max, newBins } = getMinMax(data, 6);
  console.log("legend", legends("Blues", true, 6, Array.from(new Set())));
  console.log("bins", newBins);
  return { geojson, data: hashedData(data), newBins };
};

const hashedData = data => {
  console.log(data);
  const hd = Object.entries(data).map(([hash, count]) => {
    const { lat, lon } = geohash.decode(hash);
    return {
      coordinates: [lon, lat],
      count
    };
  });
  console.log("hd", hd);
  return hd;
};

const getMinMax = (data = [0], bins) => {
  const sortedData = Object.values(data).sort((a, b) => a - b);
  const sortedDataLength = sortedData.length;
  const cutoff = Math.floor(sortedDataLength / bins);
  console.log("cutoff", cutoff, sortedData.length);
  const newBins = new Array(bins).fill(0).map((_, index) => {
    console.log("index", cutoff * (index + 1));
    return sortedData[cutoff * (index + 1)];
  });
  return {
    min: sortedData[0],
    max: sortedData[sortedData.length - 1],
    newBins
  };
};
