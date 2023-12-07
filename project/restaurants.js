let map,directionsService,directionsRenderer
let sourceAutocomplete,desAutocomplete

function initMap() {

    let mapOptions = {
        center: new google.maps.LatLng('35.7126','139.7036'),
        zoom: 16, //since 15 is for streets
        mapId: '2d3c97a609f17045' //I made it to make only restaurants visible
    }

    let map = new google.maps.Map(document.getElementById('map'), mapOptions);

    let markers = []; 
    let infowindow = new google.maps.InfoWindow(); 
    let service = new google.maps.places.PlacesService(map);

    let request = {
        location: mapOptions.center,
        radius: '1000', // Search within 1000 meters of the center
        type: ['restaurant']
    };

    service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            results.forEach((place) => {
                let marker = new google.maps.Marker({
                    position: place.geometry.location,
                    map: map,
                    title: place.name,
                    animation: google.maps.Animation.DROP
                });

                google.maps.event.addListener(marker, 'click', function() {
                    service.getDetails({ placeId: place.place_id }, function(result, status) {
                        if (status === google.maps.places.PlacesServiceStatus.OK) {
                            let destination = result.formatted_address;
                            let contentString = '<div><strong>' + result.name + '</strong><br>' +
                                                'Address: ' + result.formatted_address + '<br>' +
                                                'Rating: ' + (result.rating || 'N/A') + '</div>'+
                                                '<button onclick="setDestination(\'' + destination.replace(/'/g, "\\'") + '\')">To here</button></div>';

                            infowindow.setContent(contentString);
                            infowindow.open(map, marker);
                        }
                    });
                });

                markers.push(marker);
            });
        }
    });
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    sourceAutocomplete = new google.maps.places.Autocomplete(
        document.getElementById('start')
    )
    desAutocomplete = new google.maps.places.Autocomplete(
        document.getElementById('destination')
    )
}

function setDestination(address) {
    document.getElementById('destination').value = address;
}

function calcRoute(){
    var start = document.getElementById('start').value
    var destination = document.getElementById('destination').value

    let request = {
        origin: start,
        destination: destination,
        travelMode: 'WALKING',
        unitSystem: google.maps.UnitSystem.METRIC
    };

    directionsService.route(request,function(result,status){
        if(status == "OK"){
            directionsRenderer.setDirections(result)

            var duration = result.routes[0].legs[0].duration.text;
            var distance = result.routes[0].legs[0].distance.text;

            document.getElementById('travelInfo').innerHTML = 
                "Estimated Travel Time: " + duration + "<br>" +
                "Distance: " + distance;
        }else {
            console.error("error:" + status);
        }
    });
}

function setCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            let geocoder = new google.maps.Geocoder();
            let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

            geocoder.geocode({'location': latLng}, (results, status) => {
                if (status === 'OK') {
                    document.getElementById('start').value = results[0].formatted_address;
                } else {
                    console.error('error: ' + status);
                }
            });
        }, () => {
            alert('Error: Failed to load the current location');
        });
    } else {
        alert("Geolocation is not supported by your browser");
    }
}