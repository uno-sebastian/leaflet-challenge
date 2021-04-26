const tectonicPlatesLineColor = "#fda000";
const tectonicPlatesLineWidth = 3;

/**
 * Create the TectonicPlates' LayerGroup by parsing in the raw data from the d3 json call
 * 
 * @param {FeatureCollection} rawData the raw json data from the d3 call
 * @param {Error} err any errors that might happen
 * @returns {LayerGroup} the TectonicPlates' LayerGroup
 */
function createTectonicPlatesLayerGroup(rawData, err) {
	// console.log(rawData);

	// create the layer data using the leaflet geoJson function
	// where the attributes can be functions
	var layerData = L.geoJson(rawData,
		{
			color: tectonicPlatesLineColor,
			weight: tectonicPlatesLineWidth
		}
	);
	
	// attach the data to a new layer
	return layerData.addTo(new L.LayerGroup());
}