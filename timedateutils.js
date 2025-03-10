export class TimeDateUtils {
    static currentTimeFormatted() {
        // "YYYY/MM/DD **:**:**" format
      
        let today = new Date();
        let year = today.getFullYear();
        let month = (today.getMonth() + 1);
        let dateTime = today.getDate();
      
        let date = year;
        date += ((month < 10) ? '/0' : "/") + month;
        date += ((date < 10) ? '/0' : "/") + dateTime;
      
        let hour = today.getHours();
        let minute = today.getMinutes();
        let second = today.getSeconds();
      
        let time = ((hour < 10) ? '0' : '') + hour;
          if (hour == 0)
            time = '00';
        time += ((minute < 10) ? ':0' : ':') + minute;
        time += ((second < 10) ? ':0' : ':') + second;
        return `${date}\n${time}`;
    }

    static nightTimeNow(sunsetTime, sunriseTime) {
        const currentDate = new Date();
        return currentDate >= new Date(sunsetTime) || currentDate <= new Date(sunriseTime);
    }
}