import BoundingBox from "boundingbox";
import { GeoHash } from "geohash";

/**
 * Takes zoom level of map and returns Precision, Level and Square Size (in kms)
 *
 * @param {*} zoom
 * @returns {[number, number, number]}
 */
export const getZoomConfig = (zoom): [number, number, number] => {
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

const BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";

const aggregateGeohashKey = (key, level, binSize?) => {
  binSize = binSize || 16 / 2 ** ((1 - key.length) & 1) / 4 ** level;
  const keyExceptLast = key.slice(0, -1);
  const binnedCharAt = ~~(BASE32.indexOf(key.slice(-1)) / binSize);
  return [
    keyExceptLast + BASE32[binSize * binnedCharAt],
    keyExceptLast + BASE32[binSize * (binnedCharAt + 1) - 1]
  ];
};

const processRectangles = function(data, level) {
  var counts = new Map();
  var bins = new Map();
  const features = [];

  for (const [hash, count] of Object.entries(data)) {
    const [kStart, kEnd] = aggregateGeohashKey(hash, level);
    bins.set(kStart, kEnd);
    if (!counts.has(kStart)) {
      counts.set(kStart, 0);
    }
    counts.set(kStart, counts.get(kStart) + count);
  }

  counts.forEach((count, hash) => {
    const bboxStart = GeoHash.decodeGeoHash(hash);
    const bboxEnd = GeoHash.decodeGeoHash(bins.get(hash));
    const feature = new BoundingBox({
      minlat: bboxStart.latitude[0],
      minlon: bboxStart.longitude[0],
      maxlat: bboxEnd.latitude[1],
      maxlon: bboxEnd.longitude[1]
    }).toGeoJSON();
    features.push({ ...feature, properties: { count } });
  });

  return features;
};

const processSquares = data => {
  const features = [];

  for (const [hash, count] of Object.entries(data)) {
    const bbox = GeoHash.decodeGeoHash(hash);
    const feature = new BoundingBox({
      minlat: bbox.latitude[0],
      minlon: bbox.longitude[0],
      maxlat: bbox.latitude[1],
      maxlon: bbox.longitude[1]
    }).toGeoJSON();
    features.push({ ...feature, properties: { count } });
  }

  return features;
};

/**
 * Converts {geohash: count} to geojson
 *
 * @param {*} data
 * @param {number} level
 * @returns
 */
const geohashToJSON = (data, level: number) => ({
  type: "FeatureCollection",
  features:
    Object.keys(data).length === 0
      ? []
      : level === -1
      ? processSquares(data)
      : processRectangles(data, level)
});

export default geohashToJSON;
