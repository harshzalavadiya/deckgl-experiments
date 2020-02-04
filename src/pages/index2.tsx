import { GridCellLayer } from "@deck.gl/layers";
import { MapboxLayer } from "@deck.gl/mapbox";
import DeckGL from "@deck.gl/react";
import React, { useEffect, useRef, useState } from "react";
import { StaticMap } from "react-map-gl";

import { getData } from "../utils/basic";

export default function index() {
  const deckRef = useRef(null);
  const [gl, setGl] = useState();
  const [data, setData] = useState([]);
  const [viewState, setViewState] = useState({
    latitude: 24,
    longitude: 78.4,
    zoom: 4,
    // pitch: 40,
    // bearing: 0
  });

  useEffect(() => {
    getData().then(setData);
  }, []);

  const layer = new GridCellLayer({
    id: "grid-cell-layer",
    data,
    pickable: true,
    extruded: false,
    cellSize: 10000,
    elevationScale: 20,
    getPosition: d => d.centroid,
    getFillColor: d => [48, 128, d.count * 255, 255],
    getElevation: d => d.count
    // onHover: ({ object, x, y }) => {
    //   const tooltip = `height: ${object.value * 5000}m`;
    //   /* Update tooltip
    //      http://deck.gl/#/documentation/developer-guide/adding-interactivity?section=example-display-a-tooltip-for-hovered-object
    //   */
    // }
  });

  return (
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
                id: "column-layer",
                deck: deckRef.current.deck
              })
            );
          }}
          mapboxApiAccessToken="pk.eyJ1IjoicW9ueXRlZ2V0bmFkYWNvbSIsImEiOiJjazV4eTJ5aHgyYXk1M2xubmlqYnl2bTQwIn0.2fhCIQBveWAqzPTlUJxvlg"
          mapStyle="mapbox://styles/qonytegetnadacom/ck5xy6ccd02t41ip7tbaha5uc"
        />
      )}
    </DeckGL>
  );
}
