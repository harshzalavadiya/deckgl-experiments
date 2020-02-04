import BoundingBox from "boundingbox";
import { GeoHash } from "geohash";

import GeohashAggrKey from "./aggregate-geohash";

export default function(data, level) {
  var geojson = {
    type: "FeatureCollection",
    features: []
  };
  var counts = [];

  var count_map = new Map();
  var bin_map = new Map();
  for (var i = 0; i < data.length; i++) {
    var key = GeohashAggrKey(data[i].key, level);

    bin_map.set(key.start, key.end);

    if (!count_map.has(key.start)) count_map.set(key.start, 0);

    count_map.set(key.start, count_map.get(key.start) + data[i].doc_count);
  }

  count_map.forEach((value, hash) => {
    var bbox_start = GeoHash.decodeGeoHash(hash);
    var bbox_end = GeoHash.decodeGeoHash(bin_map.get(hash));

    var boundingbox = new BoundingBox({
      minlat: bbox_start.latitude[0],
      minlon: bbox_start.longitude[0],
      maxlat: bbox_end.latitude[1],
      maxlon: bbox_end.longitude[1]
    });

    var feature = boundingbox.toGeoJSON();

    feature["properties"] = {
      doc_count: value
    };

    geojson.features.push(feature);
    counts.push(value);
  });

  counts.sort(function(a, b) {
    return a - b;
  });

  return geojson;
}

export function squareGeoHash(data) {
  var geojson = {
    type: "FeatureCollection",
    features: []
  };
  var counts = [];

  for (var i = 0; i < data.length; i++) {
    var bbox = GeoHash.decodeGeoHash(data[i].key);
    var count = data[i].doc_count;

    var boundingbox = new BoundingBox({
      minlat: bbox.latitude[0],
      minlon: bbox.longitude[0],
      maxlat: bbox.latitude[1],
      maxlon: bbox.longitude[1]
    });

    var feature = boundingbox.toGeoJSON();

    feature["properties"] = {
      doc_count: count
    };

    geojson.features.push(feature);
    counts.push(count);
  }

  counts.sort(function(a, b) {
    return a - b;
  });

  return geojson;
}
