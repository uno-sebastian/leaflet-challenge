const leafletMapId = "map-id";
const startingCoords = [39.8283, -98.5795]
const startingZoomLevel = 5;
const maxZoom = 18;
const leafletEndpoint = "https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}";
const leafletAttribution = "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>";
const mapLayerSettings = [
	{
		name: "Statalite",
		id: "satellite-v9"
	},
	{
		name: "Grayscale",
		id: "light-v10"
	},
	{
		name: "Outdoors",
		id: "outdoors-v11"
	}
];
const mapOverlaySettings = [
	{
		name: "Earthquakes",
		endpoint: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson",
		// this is stored in /static/js/earthquakesLayerGroup.js
		createLayerGroup: (json, err) => createEarthquakesLayerGroup(json, err),
	},
	{
		name: "Tectonic Plates",
		endpoint: "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json",
		// this is stored in /static/js/tectonicPlatesLayerGroup.js
		createLayerGroup: (json, err) => createTectonicPlatesLayerGroup(json, err),
	},
];

// the overlays that will cover the map
var mapOverlays = {};


/*
     _______.___________.    ___      .______     .___________.
    /       |           |   /   \     |   _  \    |           |
   |   (----`---|  |----`  /  ^  \    |  |_)  |   `---|  |----`
    \   \       |  |      /  /_\  \   |      /        |  |     
.----)   |      |  |     /  _____  \  |  |\  \----.   |  |     
|_______/       |__|    /__/     \__\ | _| `._____|   |__| 

*/													   
// this essentially starts the logic.js;
// this iterates thru the overlay settings, calling the endpoints to load
for (var i = 0; i < mapOverlaySettings.length; i++)
	loadOverlay(mapOverlaySettings[i]);

/**
 * This loads the overlay that will be used by loading in the endpoint 
 * and calling the linked function to create the LayerGroup
 * 
 * @param {OverlaySetting} overlay The overlay settings sent in
 */
function loadOverlay(overlay) {
	// use d3 to load in a json endpoint
	d3.json(overlay.endpoint)
		.then((jsonData, err) => {

			// once the data is loaded, use the createLayerGroup func
			// to load in the translated data
			mapOverlays[overlay.name] = overlay.createLayerGroup(jsonData, err);

			// if all overlays have loaded, create the map
			if (hasLoadedAllOverlays())
				createMap();

		}).catch((error) => console.log(error));
}

/**
 * Returns a bool if has loaded all overlays
 * 
 * @returns {Boolean} If all the overlays have loaded
 */
function hasLoadedAllOverlays() {

	// iterate thru all the settings
	for (var i = 0; i < mapOverlaySettings.length; i++) {

		// if the overlay does not exist in the mapOverlays, return false
		if (mapOverlaySettings[i].name in mapOverlays == false)
			return false;
	}

	// if all the overlays exist in the mapOverlays, return true
	return true;
}

/**
 * Create the leaflet map!
 */
function createMap() {

	// Create the map layers that will be the background of our map 
	var mapLayers = createMapLayers();

	// Create the map object with options
	var map = L.map(leafletMapId, {
		center: startingCoords,
		zoom: startingZoomLevel,
		// add in the first map layer and add in all the map overlays
		layers: [mapLayers[mapLayerSettings[0].name], ...Object.values(mapOverlays)]
	});

	// Create a layer control, pass in the baseMaps and mapOverlays. Add the layer control to the map
	L.control.layers(
		mapLayers,
		mapOverlays,
		{ collapsed: false }
	).addTo(map);

	// Add in the earthquakes color legend
	// this is stored in /static/js/earthquakesLayerGroup.js
	createEarthquakesColorLegend().addTo(map);
}

/**
 * Create the map layers from the map layer settings stored up top
 * 
 * @returns the map layers ad an object with the layers name and
 */
function createMapLayers() {

	// Create the default prams for all the layers
	var params = {
		attribution: leafletAttribution,
		maxZoom: maxZoom,
		accessToken: API_KEY
	};

	var mapLayers = {};

	// Create the tile layers that will be the background of our map
	for (var i = 0; i < mapLayerSettings.length; i++) {

		// modify the params id to match the layer id
		params.id = mapLayerSettings[i].id;

		// create the layer settings with leaflet using the name as the key
		mapLayers[mapLayerSettings[i].name] = L.tileLayer(leafletEndpoint, params);
	}

	return mapLayers;
}