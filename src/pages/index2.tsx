import { GeoJsonLayer } from "@deck.gl/layers";
import { MapboxLayer } from "@deck.gl/mapbox";
import DeckGL from "@deck.gl/react";
import React, { useEffect, useRef, useState } from "react";
import { StaticMap } from "react-map-gl";
import colorbrewer from "colorbrewer";
import { getData } from "../utils/basic";
import { scaleThreshold } from "d3-scale";
import hextorgb from "hex-to-rgb";

const PALLETE_COUNT = 6;

export default function index() {
  const deckRef = useRef(null);
  const [gl, setGl] = useState();
  const [data, setData] = useState<any>({
    pallete: () => null,
    geojson: {
      type: "FeatureCollection",
      features: []
    }
  });
  const [viewState, setViewState] = useState({
    latitude: 24,
    longitude: 78.4,
    zoom: 4
    // pitch: 40,
    // bearing: 0
  });

  useEffect(() => {
    getData().then(({ newBins, geojson }) => {
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
    lineWidthMinPixels: 1,
    elevationScale: 20,
    getFillColor: d => {
      const col = data.pallete
        ? [...hextorgb(data.pallete(d.properties.count)), 210]
        : [255, 0, 0];
      // console.log(col);
      return col;
    },
    getLineColor: [0, 0, 0, 10],

    getElevation: d => d.properties.count
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

  return (
    <>
      <DeckGL
        layers={[layer]}
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
