const WsygCalendar = new function () {
    let weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let months = ["January", "February", "March", "Arpil", "May", "June", "July", "August", "September", "October", "November", "December"];
    let calDate = null;
    let selectedDateObj = null;
    let calendarContainer = null;
    let resultsContainer = null;
    let calendarTitle = null;
    let _this = this;
    let defaultFormat = "D-M-yyy";
    let currentHour = 1;
    let currentDay = 0;
    let currentMinutes = 0;
    let dateTimePreview = "";
    const calendarHTML = `<div class="wysg-calendar-container">
      <div class="wysg-calendar-header">
        <span class="wysg-calendar-prev">&#10094;</span>
        <div>
          <div class="wysg-calendar-current-month"></div>
        </div>
        <span class="wysg-calendar-next">&#10095;</span>
      </div>
      <ul class="wysg-calendar-weekdays">
          <li>Sun</li>
          <li>Mon</li>
          <li>Tue</li>
          <li>Wed</li>
          <li>Thu</li>
          <li>Fri</li>
          <li>Sat</li>
      </ul>
      <ul class="wysg-calendar-body">
      </ul>
      <div class="wysg-calendar-time-container">
        <p>Hour</p>
          <input type="range" step="1" min="1" max="24" value="1" class="wysg-calendar-time-slider hours" data-tip="1">
          <span class="wysg-calendar-midday-marker">12</span>
        <p>Minute</p>
         <input type="range" step="5" min="0" max="55" value="0" class="wysg-calendar-time-slider minutes" data-tip="00">
          <span class="wysg-calendar-minute-marker">30</span>
          <div class="wysg-calendar-time-preview-container">
            <div class="wysg-calendar-time-preview"><small>(Select a date to begin)</small></div>
          </div>
      </div>
      <div class="wysg-calendar-controls">
        <button class="wysg-calendar-cancel-btn">CANCEL</button>
        <button class="wysg-calendar-accept-btn">ACCEPT</button>
      </div>
    </div>`;

    /**
     ** Initialize the calendar instance
     **  dateObj - the date to start the calendar with
     **  container - the container to add the calendar into
     **  dateCallback - callback after clicking on a day
     **/
    this.initCalendar = (params) => {
        this.setContainer(params.container);
        this.setResultsContainer(params.resultsContainer);
        this.setHtml();
        calendarTitle = document.getElementsByClassName('wysg-calendar-current-month')[0];
        dateTimePreview = document.querySelector('.wysg-calendar-time-preview');
        this.setDateObj(params.dateObj);
        this.setCalendarTitle();
        this.getCalendarDays();
        this.setListeners(params.callback, params.closeCallback);
    }
    /**
     * Sets the title/month name on the calendar UI
     */
    this.setCalendarTitle = () => {
        calendarTitle.innerHTML = `${_this.getMonth()} ${_this.getYear()}`;
    }
    /**
     * Sets the results container to show a preview of the selected date options
     */
    this.setResultsContainer = (container) => {
        resultsContainer = container;
    };
    /**
     * Sets the html content for the calendar
     */
    this.setHtml = () => {
        calendarContainer.innerHTML = calendarHTML;
    };
    /**
     * Set the container to be used for the calendar UI
     */
    this.setContainer = (cont) => {
        if (typeof cont === 'string')
            cont = document.body.querySelector(cont);
        if (!cont || cont === null)
            throw new Error('No container added for calendar');
        calendarContainer = cont;
    }
    /**
     * Set the initial date object, the current date object.
     */
    this.setDateObj = (dateObj) => {
        if (dateObj === null || typeof dateObj !== 'object' || Object.prototype.toString.call(dateObj) !== '[object Date]')
            calDate = new Date();
        else
            calDate = dateObj;
    }
    /**
     * Get and setup the days in the calendar UI
     */
    this.getCalendarDays = () => {
        let currentYear = calDate.getFullYear();
        let currentMonth = calDate.getMonth();
        let totDays = _this.getTotalDaysForMonth(currentMonth, currentYear);
        let firstDay = _this.getMonthFirstDateNum(currentMonth, currentYear);
        let lastDay = _this.getMonthLastDay(currentMonth, currentYear);
        let rowContent = "";
        let dayCount = 1;

        for (let i = 1; i <= totDays; i++) {
            if (i > firstDay && dayCount <= lastDay) {
                if (dayCount == calDate.getDate()) {
                    _this.setSelectedDay(dayCount);
                }
                let selected = dayCount === calDate.getDate() ? 'active' : '';
                rowContent += `<li class="days ${selected}"><span>${dayCount++}</span></li>`;
            } else {

                rowContent += `<li class="days na"></li>`;
                totDays++;
            }
        }
        document.querySelector('.wysg-calendar-body').innerHTML = rowContent;
    }
    this.setListeners = (dateCallback, closeCallback) => {
        if (!calDate || calDate === null || Object.prototype.toString.call(calDate) !== '[object Date]') {
            throw new Error('No valid date object set!');
        }
        if (calendarContainer === null || !calendarContainer) {
            throw new Error('No calendar container set to add layout to');
        }

        let closeHandle = calendarContainer.getElementsByClassName('wysg-calendar-cancel-btn')[0];
        let acceptHandle = calendarContainer.getElementsByClassName('wysg-calendar-accept-btn')[0];
        let nextHandle = document.getElementsByClassName('wysg-calendar-next')[0];
        let prevHandle = document.querySelector('.wysg-calendar-prev');
        let daysHandle = calendarContainer.getElementsByClassName('days');
        let hourRange = document.querySelector('.wysg-calendar-time-slider.hours');
        let minuteRange = document.querySelector('.wysg-calendar-time-slider.minutes');


        for (let day = 0; day < daysHandle.length; day++) {
            if (!daysHandle[day].classList.contains('na') && !daysHandle[day].classList.contains('past'))
                daysHandle[day].addEventListener("click", function (e) {
                    const day = parseInt(e.target.innerText, 10);
                    if (day < calDate.getDate()) {
                        return;
                    }
                    if (document.querySelector('.wysg-calendar-body li.days.active'))
                        document.querySelector('.wysg-calendar-body li.days.active').classList.remove('active');
                    if (e.target.matches('li') || e.target.matches('span')) {
                        e.target.parentNode.classList.add('active');
                        _this.setSelectedDay(day);
                        _this.setPreviewDate();
                    }
                });
        }
        hourRange.addEventListener('change', function (e) {
            currentHour = parseInt(e.target.value, 10);
            _this.setPreviewDate();
        });
        minuteRange.addEventListener('change', function (e) {
            currentMinutes = parseInt(e.target.value, 10) < 10 ? "0" + e.target.value : e.target.value;
            _this.setPreviewDate();
        });
        nextHandle.addEventListener("click", function (e) {
            _this.initCalendar({
                dateObj: new Date(calDate.getFullYear(), _this.getNextMonth(), 1),
                container: calendarContainer,
                resultsContainer: resultsContainer,
                callback: dateCallback,
                closeCallback: closeCallback
            });

        }, false);
        prevHandle.addEventListener("click", function (e) {
            _this.initCalendar({
                dateObj: new Date(calDate.getFullYear(), _this.getPrevMonth(), 1),
                container: calendarContainer,
                resultsContainer: resultsContainer,
                callback: dateCallback,
                closeCallback: closeCallback
            });
        });
        closeHandle.addEventListener("click", function () {
            _this.dismissCalendar();
            closeCallback();
        }, false);
        acceptHandle.addEventListener("click", function (e) {

            let obj = {
                day: _this.getSelectedDay(),
                month: _this.getMonthNumber(),
                year: _this.getYear(),
                hour: _this.getHour(),
                minutes: _this.getMinutes(),
                dateObj: _this.getSelectedDateObject()
            };

            let text = `${obj.day}/${obj.month}/${obj.year} ${obj.hour}:${obj.minutes}`;
            _this.setResultsContent(text);
            if (dateCallback && dateCallback !== null) {
                dateCallback(obj);

            }
        }, false);
    }
    this.setResultsContent = (content) => {
        resultsContainer.innerHTML = content;
    }
    this.setPreviewDate = () => {
        let html = "";
        if (_this.getSelectedDay() !== 0) {
            html = `${_this.getMonth()} ${_this.getSelectedDay()}, 
                ${_this.getYear()} ${_this.getHour()>12?(_this.getHour()-12):_this.getHour()}:${_this.getMinutes()}${_this.getTimeOfDay()}`;
        } else {
            html = `No day selected!`;
        }
        dateTimePreview.innerHTML = html;
    };
    /**
     * Returns the date object of the set date
     * (Perhaps I should return a timestamp for portability? Might be easier to transfer over the wire)
     */
    this.getSelectedDateObject = () => {
        selectedDateObj = new Date(this.getYear(), calDate.getMonth(), this.getSelectedDay(), //date
            this.getHour(), this.getMinutes(), 0); //time
        return selectedDateObj;
    };
    /**
     * Returns the first date of a given month and year
     * monthNo - month in number format 0-11
     * year - year to be used for parsing
     */
    this.getMonthFirstDateNum = (monthNo, year) => {
        return new Date(year, (monthNo), 1).getDay();
    };
    /**
     * Last Day of month for given month
     * monthNo - month in number format 0-11
     * year - year to be used for parsing
     */
    this.getMonthLastDay = (monthNo, year) => {
        let tmpDate = new Date(year, (monthNo + 1));
        tmpDate.setDate(0);
        return tmpDate.getUTCDate();
    };
    this.getTimeOfDay = () => {
        return currentHour > 12 ? "PM" : "AM";
    };
    this.setSelectedDay = (day) => {
        currentDay = day;
    };
    this.getSelectedDay = () => {
        return currentDay;
    };
    this.getMonthNumber = () => {
        return calDate.getUTCMonth();
    };
    this.getMonth = () => {
        return months[calDate.getUTCMonth()];
    };
    this.getYear = () => {
        return calDate.getUTCFullYear();
    };
    this.getHour = () => {
        if (!currentHour || currentHour === 1)
            return 1;
        return currentHour;
    };
    /**
     * Return minutes for current calDate object [int]
     */
    this.getMinutes = () => {
        if (currentMinutes === 0)
            return "00";
        return currentMinutes;
    };
    /**
     * Return next month to that currently set in the calDate object [int]
     */
    this.getNextMonth = () => {
        return (calDate.getUTCMonth() + 1);
    };
    /**
     * Return previous month to that currently set in the calDate object [int]
     */
    this.getPrevMonth = () => {
        return (calDate.getUTCMonth() - 1);
    };
    /**
     * Returns if year is a leap year
     * year - year to check for leap year status [int]
     */
    this.isLeapYear = (year) => {
        return (year % 4 == 0 || year % 100 == 100) ? true : false;
    };
    /**
     * Returns the total days for a given month
     * monthNo - month in number format 0-11
     * year - year to be used for parsing
     */
    this.getTotalDaysForMonth = (monthNo, year) => {
        switch (monthNo) {
            case 0:
            case 2:
            case 4:
            case 6:
            case 7:
            case 9:
            case 11:
                return 31;
            case 3:
            case 5:
            case 8:
            case 10:
                return 30;
            case 1: //for february
                if (this.isLeapYear(year))
                    return 29;
                else
                    return 28;
                break;
            default:
                return 99;
        }
    };
    this.dismissCalendar = () => {
        calendarContainer.querySelector('.wysg-calendar-container').remove();
    };
    //end of class
};

// WsygCalendar.initCalendar({
//                           dateObj: new Date(),
//                           resultsContainer:document.body.querySelector('#results'),
//                            container: document.body.querySelector('#cal'),
//                            callback: (dater)=>{
//                                           console.log(dater);      
//                                       }
//                           });