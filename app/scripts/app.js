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


$(".responseBoard").hide();

$("#searchbtn").click(function(){
	$(".responseBoard").show();
	$(".userForm").hide();
	
	$("body").css('background','linear-gradient(to bottom,  #8cd98c 0%, #66cc66 35%, #f1f4f6 36%, #f1f4f6 100%)');
	$("body").css('background-repeat','no-repeat');
});

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
//	autocomplete.addListener('place_changed', fillInAddress);
	autocomplete.addListener('place_changed', geolocate);
}

//function fillInAddress() {
//	// Get the place details from the autocomplete object.
//	var place = autocomplete.getPlace();
//	//    //	console.log(place);
//	//
//	//    for (var component in componentForm) {
//	//        document.getElementById(component).value = '';
//	//        document.getElementById(component).disabled = false;
//	//    }
//	//
//	//    // Get each component of the address from the place details
//	//    // and fill the corresponding field on the form.
//	//    for (var i = 0; i < place.address_components.length; i++) {
//	//        var addressType = place.address_components[i].types[0];
//	//        if (componentForm[addressType]) {
//	//            var val = place.address_components[i][componentForm[addressType]];
//	//            document.getElementById(addressType).value = val;
//	//        }
//	//    }
//}

// Bias the autocomplete object to the user's geographical location,
// as supplied by the browser's 'navigator.geolocation' object.
function geolocate() {
	if (navigator.geolocation) {

		var geocoder = new google.maps.Geocoder();
		var address = document.getElementById("autocomplete").value;
		geocoder.geocode( { 'address': address}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {

				// Utility rates
				fetch("https://developer.nrel.gov/api/utility_rates/v3.json?api_key=1jXG0B0jJJRZt9pJqHljfY6CpCiOZNrzTb8JsRpA&lat=" + results[0].geometry.location.lat() + "&lon=" + results[0].geometry.location.lng())
					.then((resp) => resp.json())
					.then(function(data) {
					console.log(data);

					var industrialValue = data.outputs.industrial;
					var commercialValue = data.outputs.commercial;
					var residentialValue = data.outputs.residential;
					// Industrial utility rate
					$('.industrial').text("Industrial: " + industrialValue);
					// Commercial utility rate
					$('.commercial').text("Commercial: " + commercialValue);
					// Residential utility rate
					$('.residential').text("Residential: " + residentialValue);

					// Solar rates
					fetch("https://developer.nrel.gov/api/solar/solar_resource/v1.json?api_key=1jXG0B0jJJRZt9pJqHljfY6CpCiOZNrzTb8JsRpA&lat=" + results[0].geometry.location.lat() + "&lon=" + results[0].geometry.location.lng())
						.then((resp) => resp.json())
						.then(function(data) {
						console.log(data);

						var globalHor_Irr = data.outputs.avg_ghi.annual;
						var avgDirNorm_Irr = data.outputs.avg_dni.annual;
						// Direct Normal - Angled Roof
						$('.annual_avg_dni').text("annual_avg_dni: " + avgDirNorm_Irr);
						// Global Horizontal - Flat roof
						$('.annual_avg_ghi').text("annual_avg_ghi: " + globalHor_Irr);

						var residenceType = $("#residenceType option:selected" ).text();
						var roofType = $("#roofType option:selected" ).text();
						var energyUsage = $( "#energyUsage" ).val();

						console.log("residenceType: ", residenceType);
						console.log("roofType: ", roofType);
						console.log("energyUsage: ", energyUsage);

						var residencyTypeValue;
						if(residenceType == "Industrial")
						{
							residencyTypeValue = industrialValue;
						}
						if(residenceType == "Commercial")
						{
							residencyTypeValue = commercialValue;            
						}
						if(residenceType == "Residential")
						{
							residencyTypeValue = residentialValue;
						}

						var energyUsage_year = energyUsage * 12;
						var annualGrid_cost = residencyTypeValue * energyUsage_year;

						console.log("Annual Grid: " + annualGrid_cost);


						var roofTypeValue;
						if(roofType == "Flat")
						{
							roofTypeValue = globalHor_Irr;

						}
						if(roofType == "Pyramid")
						{
							roofTypeValue = avgDirNorm_Irr;

						}

						var irr_Panel = roofTypeValue * 1.63;
						var efficiency = 0.20;
						var panelNumber = Math.ceil(energyUsage_year/(irr_Panel * efficiency * 365));
						var solarCost = (11000/20)*panelNumber;

						var gridCostPerYear = residencyTypeValue*energyUsage_year;
						var yearsSolarEff = solarCost/gridCostPerYear;

						console.log("Number of Panels: " + panelNumber);
						console.log("Irradiance per panel: " + irr_Panel);
						console.log("Solar Payment: " + solarCost);
						console.log("Grid value per Year: " + gridCostPerYear);
						console.log("Num years for solar over grid: " + yearsSolarEff);

						var message;
						if(yearsSolarEff < 15)
						{
							message = "Solar is viable!"

						}
						else{
							message = "Solar is not the best option based on your selection!";
						}

						console.log(message);


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
