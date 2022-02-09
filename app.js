


// this function requests our coordinates from the chrome browser must be an async function because user could reject program breaks obviously if it is rejected. 
async function getCoords(){
	const pos = await new Promise((resolve, reject) => {
		navigator.geolocation.getCurrentPosition(resolve, reject)
	});
	return [pos.coords.latitude, pos.coords.longitude]
}



// map object
const myMap = {

	// we need to establish these arrays and objects below so that they can be accessed later by other functions 

	// coordinates needs an empty array as we will use latitude and longitude numbers.
	coordinates: [],
	// businesses will be a simple array no further complexity needed. 
	businesses: [],
	// this will be a complex object using leaflet code.
	map: {},
	// this will be a complex object using leaflet code to put markers on our map object.
	markers: {},

	// build leaflet map
	buildMap() {

		// this first function creates a map using leaflet library
		this.map = L.map('map', {
		// Here the map is centering on our coordinates which are grabbed by the getCoords function below 
		center: this.coordinates,
		// Sets zoom level pretty straightforward 
		zoom: 11,
		});
		// add openstreetmap tiles places streets on our map 

		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution:
			'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		minZoom: '15',


		}).addTo(this.map) 
		// adds the above layer  to the map 


		// create and add geolocation marker
		const marker = L.marker(this.coordinates)
		marker
		.addTo(this.map)
		.bindPopup('<p1><b>You are here</b><br></p1>')
		.openPopup()
	},

	// add business markers
	addMarkers() {
		// goes through our parsed data from foursquare and places markers 
		for (var i = 0; i < this.businesses.length; i++) {
		this.markers = L.marker([
			this.businesses[i].lat,
			this.businesses[i].long,
		])
			.bindPopup(`<p1>${this.businesses[i].name}</p1>`)
			.addTo(this.map)
		}
	},
}



// get foursquare businesses
async function getFoursquare(business) {
	// this variable is used to simplify our fetch request I like this usage 
	const options = {
		method: 'GET',
		headers: {
		Accept: 'application/json',
		Authorization: 'fsq3ATzZbmcGhdeFafr73wZcnJ+LlN6bK+4dh19a7ClS4u8='
		}
	}

	// number of businesses requested from foursquare 
	let limit = 5
	// uses our current map coordinates to be plugged into our fetch request 
	let lat = myMap.coordinates[0]
	let lon = myMap.coordinates[1]
	// fetch request out to foursquare to retrieve business data for our pop-outs 
	let response = await fetch(`https://api.foursquare.com/v3/places/search?&query=${business}&limit=${limit}&ll=${lat}%2C${lon}`, options)
	let data = await response.text()
	// We recieve json data from foursquare and need to parse it to make it usable 
	let parsedData = JSON.parse(data)
	let businesses = parsedData.results
	console.log(businesses)
	return businesses

}
// process foursquare array
// from the above comment it seems we recieved an array of data from foursquare and need to process it to make our pop-outs functional 
function processBusinesses(data) {
	let businesses = data.map((element) => {
		let location = {
			// this takes the data from foursquare and gets it name and coordinates our of the array so we can make this into pop-outs using leaflet
			name: element.name,
			lat: element.geocodes.main.latitude,
			long: element.geocodes.main.longitude
		};
		return location
	})
	return businesses
}


// event handlers
// window load we cant load the map before we get coordinates or everything breaks 
window.onload = async () => {
	const coords = await getCoords()
	myMap.coordinates = coords
	myMap.buildMap()
}

// business submit button
// this makes it so our fetch request does not fire until we submit our businesses we want to be pop-outs 
document.getElementById('submit').addEventListener('click', async (event) => {
	event.preventDefault()
	let business = document.getElementById('business').value
	let data = await getFoursquare(business)
	myMap.businesses = processBusinesses(data)
	myMap.addMarkers()
})
