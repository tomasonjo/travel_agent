import { React, useEffect, useState } from "react";
import "./App.css";

import MapGL, { Marker, Popup } from "@urbica/react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import ClipLoader from "react-spinners/ClipLoader";

import { gql, useQuery } from "@apollo/client";

const accessToken = process.env.REACT_APP_MAPBOX_TOKEN

const QUERY = gql`
  query {
    monuments {
      name
      image
      latitude
      longitude
    }
  }
`;

const Search = () => {
  const { loading, error, data } = useQuery(QUERY);

  if (error) return <p>Error</p>;
  if (loading) return <p>Loading...</p>;
  return <MapResults monuments={data.monuments} />;
};

const LoadingIndicator = () => {
  return <ClipLoader color="#000" loading={true} size={150} />;
};
const useImage = (src) => {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [hasStartedInitialFetch, setHasStartedInitialFetch] = useState(false);

  useEffect(() => {
    setHasStartedInitialFetch(true);
    setHasLoaded(false);
    setHasError(false);
    const image = new Image();
    image.src = src;
    const handleError = () => {
      setHasError(true);
    };
    const handleLoad = () => {
      setHasLoaded(true);
      setHasError(false);
    };
    image.onerror = handleError;
    image.onload = handleLoad;

    return () => {
      image.removeEventListener("error", handleError);
      image.removeEventListener("load", handleLoad);
    };
  }, [src]);

  return { hasLoaded, hasError, hasStartedInitialFetch };
};

const MapPopup = ({ monument, onClose }) => {
  const { hasLoaded, } = useImage(monument.image);
  return (
    <Popup
      longitude={monument.longitude}
      latitude={monument.latitude}
      closeOnClick={false}
      onClose={onClose}
    >
      {!hasLoaded && <LoadingIndicator />}
      {hasLoaded && <img src={monument.image} alt="" className="photo" />}
    </Popup>
  );
};
const MapMarker = ({ key, lon, lat, onClick }) => {
  const style = {
    padding: "8px",
    color: "#fff",
    cursor: "pointer",
    background: "#1978c8",
    borderRadius: "50%",
  };
  return (
    <Marker key={key} longitude={lon} latitude={lat}>
      <div onClick={onClick} style={style}></div>
    </Marker>
  );
};
const MapResults = (props) => {
  const [viewport, setViewport] = useState({
    latitude: 39.6352,
    longitude: -3.832,
    zoom: 5,
  });

  const [currentMonument, setCurrentMonument] = useState(props.monuments[0]);
  return (
    <div className="overlay">
      <MapGL
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/light-v9"
        accessToken={accessToken}
        latitude={viewport.latitude}
        longitude={viewport.longitude}
        zoom={viewport.zoom}
        onViewportChange={setViewport}
      >
        {props.monuments.map((p, i) => {
          return (
            <MapMarker
              key={i}
              lon={p.longitude}
              lat={p.latitude}
              onClick={() => setCurrentMonument(p)}
            />
          );
        })}
        {currentMonument === null ? null : (
          <MapPopup
            monument={currentMonument}
            onClose={() => setCurrentMonument(null)}
          />
        )}
      </MapGL>
    </div>
  );
};

function App() {
  return <Search />;
}

export default App;
