'use strict';

/**
 * @ngdoc overview
 * @name hackAeApp
 * @description
 * # hackAeApp
 *
 * Main module of the application.
 */

var hackae = angular.module('hackAeApp', ['ngRoute']);

$(document).ready(function() {

	$(".button-collapse").sideNav();
	$('select').material_select();

});

// routes
hackae.config(['$routeProvider', function($routeProvider) {
	$routeProvider // route for the home page
		.when('/', {
		templateUrl: 'views/main.html',
		controller: 'MainCtrl'
	})
		.when('/savings', {
		templateUrl: 'views/savings.html',
		controller: 'SavingsCtrl'
	});
}]);

//hackae.value('GlobalLatitude', '0');
//hackae.value('GlobalLongitude', '0');
//
//hackae.value('geolocationData', {
//	LAT:1,
//	LONG:2
//});



var placeSearch, autocomplete;
var componentForm = {
	street_number: 'short_name',
	route: 'long_name',
	locality: 'long_name',
	administrative_area_level_1: 'short_name',
	country: 'long_name',
	postal_code: 'short_name'
};

function initAutocomplete() {
	// Create the autocomplete object, restricting the search to geographical
	// location types.
	autocomplete = new google.maps.places.Autocomplete(
		/** @type {!HTMLInputElement} */(document.getElementById('autocomplete')),
		{types: ['geocode']});

	// When the user selects an address from the dropdown, populate the address
	// fields in the form.
	autocomplete.addListener('place_changed', fillInAddress);
	autocomplete.addListener('place_changed', geolocate);
}

function fillInAddress() {
	// Get the place details from the autocomplete object.
	var place = autocomplete.getPlace();
//	console.log(place);

	for (var component in componentForm) {
		document.getElementById(component).value = '';
		document.getElementById(component).disabled = false;
	}

	// Get each component of the address from the place details
	// and fill the corresponding field on the form.
	for (var i = 0; i < place.address_components.length; i++) {
		var addressType = place.address_components[i].types[0];
		if (componentForm[addressType]) {
			var val = place.address_components[i][componentForm[addressType]];
			document.getElementById(addressType).value = val;
		}
	}
}

// Bias the autocomplete object to the user's geographical location,
// as supplied by the browser's 'navigator.geolocation' object.
function geolocate() {
	if (navigator.geolocation) {

		var geocoder = new google.maps.Geocoder();
		var address = document.getElementById("autocomplete").value;
		geocoder.geocode( { 'address': address}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {

				//				console.log("Latitude", results[0].geometry.location.lat());
				//				console.log("Longitude", results[0].geometry.location.lng());
				//

				// Utility rates
				fetch("https://developer.nrel.gov/api/utility_rates/v3.json?api_key=1jXG0B0jJJRZt9pJqHljfY6CpCiOZNrzTb8JsRpA&lat=" + results[0].geometry.location.lat() + "&lon=" + results[0].geometry.location.lng())
					.then((resp) => resp.json())
					.then(function(data) {
						console.log(data);
							// Industrial utility rate
							$('.industrial').text("Industrial: " + data.outputs.industrial);
							// Commercial utility rate
							$('.commercial').text("Commercial: " + data.outputs.commercial);
							// Residential utility rate
							$('.residential').text("Residential: " + data.outputs.residential);
					
							// Solar rates
							fetch("https://developer.nrel.gov/api/solar/solar_resource/v1.json?api_key=1jXG0B0jJJRZt9pJqHljfY6CpCiOZNrzTb8JsRpA&lat=" + results[0].geometry.location.lat() + "&lon=" + results[0].geometry.location.lng())
								.then((resp) => resp.json())
								.then(function(data) {
									console.log(data);
									// Direct Normal - Angled Roof
									$('.annual_avg_dni').text("annual_avg_dni: " + data.outputs.avg_dni.annual);
									// Global Horizontal - Flat roof
									$('.annual_avg_ghi').text("annual_avg_ghi: " + data.outputs.avg_ghi.annual);
								
									var residenceType = $("#residenceType option:selected" ).text();
									var roofType = $("#roofType option:selected" ).text();
									var energyUsage = $( "#energyUsage" ).val();
								
									console.log("residenceType: ", residenceType);
									console.log("roofType: ", roofType);
									console.log("energyUsage: ", energyUsage);
									

								})
									.catch(function(error) {
									console.log(error);
								}); 

				})
					.catch(function(error) {
					console.log(error);
				}); 

			} 

			else {
				console.log("Couldn't find geocode data!");
			}
		});

	}
}
