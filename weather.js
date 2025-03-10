export class Weather {
    static fetchAt(latitude, longitude) {
        return fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=cc899ff07e1cdf8cd42fe037272216fb&units=metric`
        )
        .then((response) => {
            return response.json().then((fetchedData) => {
                const data = {
                    temperature: fetchedData.main.temp,
                    location: fetchedData.name,
                    description: fetchedData.weather[0].description,
                    sunriseUNIXTime: fetchedData.sys.sunrise*1000,
                    sunsetUNIXTime: fetchedData.sys.sunset*1000
                }

                return data; 
            }).catch((err) => {
                throw err;
            })
        });
    }
}
