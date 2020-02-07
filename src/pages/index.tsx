import { GeoJsonLayer } from "@deck.gl/layers";
import { MapboxLayer } from "@deck.gl/mapbox";
import DeckGL from "@deck.gl/react";
import React, { useEffect, useRef, useState } from "react";
import { StaticMap } from "react-map-gl";
import colorbrewer from "colorbrewer";
import { getData } from "../utils/basic";
import { scaleThreshold } from "d3-scale";
import hextorgb from "hex-to-rgb";
import { HexagonLayer } from "@deck.gl/aggregation-layers";
import { TileLayer } from "@deck.gl/geo-layers";
import { VectorTile } from "@mapbox/vector-tile";
import Protobuf from "pbf";

const PALLETE_COUNT = 6;

export default function index() {
  const deckRef = useRef(null);
  const [gl, setGl] = useState();
  const [hashedData, setHashedData] = useState<any>([]);
  const [colorDomain, setColorDomain] = useState<any>([]);
  const [data, setData] = useState<any>({
    pallete: () => null,
    geojson: {
      type: "FeatureCollection",
      features: []
    }
  });
  const [viewState, setViewState] = useState({
    // latitude: 20.5,
    // longitude: 78.9,
    // zoom: 4
    latitude: 40.679648,
    longitude: -74.047185,
    zoom: 10
    // pitch: 40,
    // bearing: 0
  });

  useEffect(() => {
    getData().then(({ data, newBins, geojson }) => {
      setHashedData(data);
      setColorDomain(newBins);
      setData({
        pallete: scaleThreshold()
          .domain(newBins)
          .range(colorbrewer.YlOrRd[PALLETE_COUNT]),
        geojson
      });
    });
  }, []);

  const layer = new GeoJsonLayer({
    id: "geojson-layer",
    data: data.geojson,
    pickable: true,
    stroked: true,
    filled: true,
    extruded: false,
    // lineWidthScale: 20,
    // lineWidthMinPixels: 1,
    // elevationScale: 20,
    getFillColor: d => {
      const col = data.pallete
        ? [...hextorgb(data.pallete(d.properties.count)), 210]
        : [255, 0, 0];
      // console.log(col);
      return col;
    }
    // getLineColor: [0, 0, 0, 10],

    // getElevation: d => d.properties.count
    // getLineColor: d => [0, 0, 0],
    // getRadius: 100,
    // getLineWidth: 1,
    // getElevation: 300
    // onHover: ({ object, x, y }) => {
    //   const tooltip = object.properties.name || object.properties.station;
    //   /* Update tooltip
    //      http://deck.gl/#/documentation/developer-guide/adding-interactivity?section=example-display-a-tooltip-for-hovered-object
    //   */
    // }
  });

  const layer1 = new TileLayer({
    id: "geojson-layer",
    // stroked: false,

    // getLineColor: [192, 192, 192],
    // getFillColor: [140, 170, 180],

    // getLineWidth: f => {
    //   if (f.properties.layer === "transportation") {
    //     switch (f.properties.class) {
    //       case "primary":
    //         return 12;
    //       case "motorway":
    //         return 16;
    //       default:
    //         return 6;
    //     }
    //   }
    //   return 1;
    // },
    // lineWidthMinPixels: 1,

    getTileData: ({ x, y, z }) => {
      const mapSourcex = `https://a.tiles.mapbox.com/v4/mapbox.mapbox-streets-v7/${z}/${x}/${y}.vector.pbf`;
      const mapSourcey = `https://pamba.strandls.com/naksha/api/geoserver/gwc/service/tms/1.0.0/biodiv:lyr_110_india_aquifer@EPSG%3A900913@pbf/${z}/${x}/${y}.pbf`;
      const mapSource = `http://paleru.strandls.com/geoserver/gwc/service/wmts?REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&LAYER=tiger:poly_landmarks&STYLE=poly_landmarks&TILEMATRIX=EPSG:900913:${z}&TILEMATRIXSET=EPSG:900913&FORMAT=application/vnd.mapbox-vector-tile&TILECOL=${x}&TILEROW=${y}`;
      // const mapSource = `http://venus.strandls.com/geoserver/gwc/service/tms/1.0.0/biodiv:lyr_116_india_states@EPSG%3A900913@pbf/${z}/${x}/${y}.pbf`;
      return fetch(mapSource)
        .then(response => response.arrayBuffer())
        .then(buffer => {
          const tile = new VectorTile(new Protobuf(buffer));
          const features = [];
          console.log(tile);
          for (const layerName in tile.layers) {
            const vectorTileLayer = tile.layers[layerName];
            for (let i = 0; i < vectorTileLayer.length; i++) {
              console.log(vectorTileLayer);
              const vectorTileFeature = vectorTileLayer.feature(i);
              const feature = vectorTileFeature.toGeoJSON(x, y, z);
              console.log(feature);
              features.push(feature);
            }
          }
          return features;
        });
    }
  });

  return (
    <>
      <DeckGL
        layers={[layer1]}
        ref={deckRef}
        controller={true}
        viewState={viewState}
        onViewStateChange={({ viewState }) => setViewState(viewState)}
        onWebGLInitialized={gl => setGl(gl)}
        //   onAfterRender={() => {
        //     console.log("AfterRender");
        //   }}
      >
        {gl && (
          <StaticMap
            gl={gl}
            onLoad={e => {
              e.target.addLayer(
                new MapboxLayer({
                  id: "geojson-layer",
                  deck: deckRef.current.deck
                })
              );
            }}
            mapboxApiAccessToken="pk.eyJ1IjoicW9ueXRlZ2V0bmFkYWNvbSIsImEiOiJjazV4eTJ5aHgyYXk1M2xubmlqYnl2bTQwIn0.2fhCIQBveWAqzPTlUJxvlg"
            mapStyle="mapbox://styles/qonytegetnadacom/ck5xy6ccd02t41ip7tbaha5uc"
          />
        )}
      </DeckGL>
    </>
  );
}
