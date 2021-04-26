const earthquakesLegendTitle = "Depth (Miles)";
const earthquakesRadiusMulti = 5;
const earthquakesRanges = [
	{
		color: "#a3f600",
		label: "-10–10",
		withinRange: (depth) => depth < 10
	},
	{
		color: "#dcf400",
		label: "10–30",
		withinRange: (depth) => depth >= 10 && depth < 30
	},
	{
		color: "#f7db11",
		label: "30–50",
		withinRange: (depth) => depth >= 30 && depth < 50
	},
	{
		color: "#fdb72a",
		label: "50–70",
		withinRange: (depth) => depth >= 50 && depth < 70
	},
	{
		color: "#fca35d",
		label: "70–90",
		withinRange: (depth) => depth >= 70 && depth < 90
	},
	{
		color: "#ff5f65",
		label: "90+",
		withinRange: (depth) => depth >= 90
	}
];

/**
 * Create the Earthquakes' LayerGroup by parsing in the raw data from the d3 json call
 * 
 * @param {FeatureCollection} rawData the raw json data from the d3 call
 * @param {Error} err any errors that might happen
 * @returns {LayerGroup} the Earthquakes' LayerGroup
 */
function createEarthquakesLayerGroup(rawData, err) {
	// console.log(rawData);

	// create the layer data using the leaflet geoJson function
	// where the attributes can be functions
	var layerData = L.geoJson(rawData,
		{
			// create the circle marker
			pointToLayer: (feature, latlng) => L.circleMarker(latlng),
			// set the circle style
			style: (feature) => styleCircleMarker(feature),
			// add an onclick event for a popup
			onEachFeature: (feature, layer) => layer.bindPopup(writePopupText(feature))
		}
	);

	// attach the data to a new layer
	return layerData.addTo(new L.LayerGroup());
}

/**
 * create the style object for each circle marker from the geoJson data
 * 
 * @param {Feature} feature an individual geoJson feature
 * @returns a style object for the Leaflet CircleMarker object
 */
function styleCircleMarker(feature) {
	return {
		fillOpacity: 1,
		fillColor: getEarthquakeColor(feature.geometry.coordinates[2]),
		radius: scaleEarthquakeMag(feature.properties.mag),
		weight: 0.25
	};
}

/**
 * Get the earthquake color from the depth
 * 
 * @param {Number} depth the earthquake depth
 * @returns {HtmlColor} a string html color
 */
function getEarthquakeColor(depth) {

	// iterate backwords thru the earthquakesRanges, testing each within that range
	for (var i = earthquakesRanges.length - 1; i > -1; i--)
		if (earthquakesRanges[i].withinRange(depth))
			return earthquakesRanges[i].color;

	// if for some reason fail, return default
	return earthquakesRanges[0].color;
}

/**
 * Scale up the earthquake magnitude with a constant
 * 
 * @param {Number} magnitude the earthquake magnitude
 * @returns {Number} scaled magnitude
 */
function scaleEarthquakeMag(magnitude) {
	return magnitude * earthquakesRadiusMulti;
}

/**
 * Return the popup text to use
 * 
 * @param {GeoJson.Feature} feature 
 * @returns {String} the html popup for the earthquake circle marker
 */
function writePopupText(feature) {

	var text = [
		`<strong>${feature.properties.type.charAt(0).toUpperCase()}${feature.properties.type.slice(1)}</strong>`,
		`Depth:  ${feature.geometry.coordinates[2]}`,
		`Magnitude:  ${feature.properties.mag}`,
		`Location:  ${feature.properties.place}`,
	];

	// join all within the array with a break
	return text.join("<br>");
}

/**
 * Create the earthquake color legend
 * 
 * @returns {Leaflet.Control} the legend object for a leaflet map
 */
function createEarthquakesColorLegend() {

	// create the legend on the bottom right
	var legend = L.control({ position: "bottomright" });

	// give the legend a function to call when it is added to the main map
	legend.onAdd = attachColorLegendValues;

	return legend;
}

/**
 * This function is called when the legend is attached to the map
 * 
 * @returns {HtmlElement} returns the overriding div element for the earthquake color legend
 */
function attachColorLegendValues() {

	// attach the legend to a new div
	var div = L.DomUtil.create("div", "color legend");

	// Create the main html for the legend
	var legendHtml = [`<strong>${earthquakesLegendTitle}</strong>`];

	// iterate thru the earthquakesRanges and add each line
	for (var i = 0; i < earthquakesRanges.length; i++)
		legendHtml.push(`<i style="background: ${earthquakesRanges[i].color}"></i>${earthquakesRanges[i].label}`);

	// join all within the array with a break
	div.innerHTML = legendHtml.join("<br>");

	return div;
}