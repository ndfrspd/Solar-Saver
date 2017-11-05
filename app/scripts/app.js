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
	});
}]);


$(".responseBoard").hide();
$(".userInput").hide();

$("#searchbtn").click(function(){
	$('.userForm').addClass('animated bounceOut');

	$('.userInput').addClass('animated fadeIn');
	$('.responseBoard').addClass('animated fadeInUp');

	setTimeout(function(){

		$(".userInput").show();
		$(".responseBoard").show();
		$(".userForm").hide();

		$("body").css('background','linear-gradient(to bottom,  #5585f7 0%, #366ff6 55%, #f1f4f6 36%, #f1f4f6 100%)');
		$("body").css('background-repeat','no-repeat');
		$(".logo").css('color','white');
	},1000);

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
					$('.industrial').text("$ " + industrialValue + " kWh");
					// Commercial utility rate
					$('.commercial').text("$ " + commercialValue + " kWh");
					// Residential utility rate
					$('.residential').text("$ " + residentialValue + " kWh");

					// Solar rates
					fetch("https://developer.nrel.gov/api/solar/solar_resource/v1.json?api_key=1jXG0B0jJJRZt9pJqHljfY6CpCiOZNrzTb8JsRpA&lat=" + results[0].geometry.location.lat() + "&lon=" + results[0].geometry.location.lng())
						.then((resp) => resp.json())
						.then(function(data) {
						console.log(data);

						var monthlyDataJan= data.outputs.avg_ghi.monthly.jan;
						var monthlyDataFeb= data.outputs.avg_ghi.monthly.feb;
						var monthlyDataMar= data.outputs.avg_ghi.monthly.mar;
						var monthlyDataApr= data.outputs.avg_ghi.monthly.apr;
						var monthlyDataMay= data.outputs.avg_ghi.monthly.may;
						var monthlyDataJun= data.outputs.avg_ghi.monthly.jun;
						var monthlyDataJul= data.outputs.avg_ghi.monthly.jul;
						var monthlyDataAug= data.outputs.avg_ghi.monthly.aug;
						var monthlyDataSept= data.outputs.avg_ghi.monthly.sep;
						var monthlyDataOct= data.outputs.avg_ghi.monthly.oct;
						var monthlyDataNov= data.outputs.avg_ghi.monthly.nov;
						var monthlyDataDec= data.outputs.avg_ghi.monthly.dec;

						var ctx = document.getElementById("myChart");
						var myChart = new Chart(ctx, {
							type: 'line',
							data: {
								labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
								datasets: [{
									label: 'Monthly Irradiance',
									data: [monthlyDataJan, monthlyDataFeb, monthlyDataMar, monthlyDataApr, monthlyDataMay, monthlyDataJun, monthlyDataJul,monthlyDataAug,monthlyDataSept,monthlyDataOct,monthlyDataNov,monthlyDataDec],
									backgroundColor: 'rgba(255,255,255,0)',
									borderColor: [
										'rgba(54,111,246,1)',
									],
									borderWidth: 2
								}]
							},

							options: {
								animation: {
									duration: 0, // general animation time
								},
								hover: {
									animationDuration: 0, // duration of animations when hovering an item
								},
								responsiveAnimationDuration: 0, // animation duration after a resize
								scales: {
									xAxes: [{
										gridLines: {
											display: false
										}
									}],
									yAxes: [{
										gridLines: {
											display: false
										},
										ticks: {
											beginAtZero: true
										}
									}]
								}
							}
						});

						var globalHor_Irr = data.outputs.avg_ghi.annual;
						var avgDirNorm_Irr = data.outputs.avg_dni.annual;


						// Direct Normal - Angled Roof
						$('.annual_avg_dni').text("annual_avg_dni: " + avgDirNorm_Irr);
						// Global Horizontal - Flat roof
						$('.annual_avg_ghi').text("annual_avg_ghi: " + globalHor_Irr);


						var address = autocomplete.getPlace().formatted_address;
						var residenceType = $("#residenceType option:selected" ).text();
						var roofType = $("#roofType option:selected" ).text();
						var energyUsage = $( "#energyUsage" ).val();


						$('.address').text(address);
						$('.retype').text(residenceType);
						$('.rotype').text(roofType);
						$('.eusage').text(energyUsage);


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

						console.log("Annual Utility Cost: " + annualGrid_cost);


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
						var yearsSolarEff = Math.floor(solarCost/gridCostPerYear);

						console.log("Number of Panels: " + panelNumber);
						console.log("Irradiance per panel: " + irr_Panel);
						console.log("Solar Payment: " + solarCost);
						console.log("Grid value per Year: " + gridCostPerYear);
						console.log("Num years for solar over grid: " + yearsSolarEff);


						// Industrial utility rate
						$('.numYears').text(yearsSolarEff + " Years");
						// Commercial utility rate
						$('.estimatedPanels').text(panelNumber);
						// Residential utility rate
						$('.totalSolarCost').text("$ " + solarCost + " USD");



						var message;
						if(yearsSolarEff < 15)
						{
							message = "Solar is viable!"
							$('.solarVerdict').text("Congrats, your property is solar ready!");

						}
						else{
							message = "Solar is not the best option based on your selection!";
							$(".solarVerdict").css('color','red');
							$('.solarVerdict').text("Based on our calculations, solar power is not the most economic option for you.");
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
