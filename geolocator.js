export class Geolocator {
    static getCurrentPosition(successCallback, errorCallback) {        
        const navigationOptions = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        };

        navigator.geolocation.getCurrentPosition(successCallback, errorCallback, navigationOptions);
    }
}