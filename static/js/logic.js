const leafletMapId = "map-id";
const startingCoords = [39.8283, -98.5795]
const startingZoomLevel = 5;
const leafletEndpoint = "https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}";
const mapLayerSettings = [
	{
		name: "Statalite",
		id: "light-v10"
	},
	{
		name: "Grayscale",
		id: "dark-v10"
	},
	{
		name: "Outdoors",
		id: "satellite-streets-v10"
	}
];
const mapOverlaySettings = [
	{
		name: "Earthquakes",
		endpoint: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson",
		layerGroup: (json, err) => createEarthquakesLayerGroup(json, err),
	},
	{
		name: "Tectonic Plates",
		endpoint: "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json",
		layerGroup: (json, err) => createTectonicPlatesLayerGroup(json, err),
	},
];

var maxZoom = 18;
var overlayMaps = {};

for (var i = 0; i < mapOverlaySettings.length; i++)
	loadOverlay(mapOverlaySettings[i]);

function loadOverlay(overlay) {
	d3.json(overlay.endpoint)
		.then((jsonData, err) => {
			overlayMaps[overlay.name] = overlay.layerGroup(jsonData, err);
			if (hasLoadedAllOverlays())
				createMap();
		}).catch((error) => console.log(error));
}

function hasLoadedAllOverlays() {
	for (var i = 0; i < mapOverlaySettings.length; i++) {
		if (mapOverlaySettings[i].name in overlayMaps)
			continue;
		return false;
	}
	return true;
}

function createEarthquakesLayerGroup(rawData, err) {
	var layerGroup = new L.LayerGroup();
	return layerGroup;
}

function createTectonicPlatesLayerGroup(rawData, err) {
	var layerGroup = new L.LayerGroup();
	return layerGroup;
}

// Create the createMap function
function createMap() {
	// Create the tile layer that will be the background of our map
	var mapLayers = createMapLayers();

	// Create a baseMaps object to hold the lightmap layer
	var baseMaps = {};
	for (var i = 0; i < mapLayerSettings.length; i++)
		baseMaps[mapLayers[i].name] = mapLayers[i].layer;

	// Create the map object with options
	var mapParams = {
		center: startingCoords,
		zoom: startingZoomLevel,
		layers: [mapLayers[0].layer]
	};
	var map = L.map(leafletMapId, mapParams);

	// Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
	L.control.layers(
		baseMaps,
		overlayMaps,
		{ collapsed: false }
	).addTo(map);
}

function createMapLayers() {
	var params = {
		attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
		maxZoom: maxZoom,
		accessToken: API_KEY
	};

	var mapLayers = [];

	// Create the tile layers that will be the background of our map
	for (var i = 0; i < mapLayerSettings.length; i++) {
		// modify the params id to match the layer id
		params.id = mapLayerSettings[i].id;
		// create the layer settings with leaflet
		var layerSettings = L.tileLayer(leafletEndpoint, params);
		// push the settings onto the map layers
		mapLayers.push({
			name: mapLayerSettings[i].name,
			layer: layerSettings
		});
	}

	return mapLayers;
}