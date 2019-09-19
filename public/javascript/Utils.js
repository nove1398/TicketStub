class Utils {
  constructor() {}

  makeCall(url, data, fn, catchFN) {
    fetch(url, {
        body: JSON.stringify(data), // must match 'Content-Type' header
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, same-origin, *omit
        headers: {
          'user-agent': 'Mozilla/4.0',
          'X-Requested-With': 'XMLHttpRequest',
          'content-type': 'application/json',
          'authorization': localStorage.getItem('token')
        },
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, cors, *same-origin
        referrer: 'no-referrer', // *client, no-referrer
      })
      .then(this.throwInvalidResponse)
      .then(fn)
      .catch(catchFN);
  }

  makeGetCall(url, fn, catchFN) {
    fetch(url, {
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, same-origin, *omit
        headers: {
          'user-agent': 'Mozilla/4.0',
          'X-Requested-With': 'XMLHttpRequest',
          'content-type': 'application/json'
        },
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, cors, *same-origin
        redirect: 'error', // manual, *follow, error
        referrer: 'no-referrer', // *client, no-referrer
      })
      .then(this.throwInvalidResponse)
      .then(fn)
      .catch(catchFN);
  }

  makeFileCall(url, data, fn, errBack) {
    fetch(url, {
        body: data, // must match 'Content-Type' header
        credentials: 'same-origin',
        headers: {
          'user-agent': 'Mozilla/4.0',
          'X-Requested-With': 'XMLHttpRequest',
          'authorization': localStorage.getItem('token')
        },
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors' // no-cors, cors, *same-origin
      })
      .then(this.throwInvalidResponse)
      .then(fn)
      .catch((err)=>{console.log(err);});
  }

  throwInvalidResponse(response) {
    let customError = '';
    switch (response.status) {
      case 200:
        return response.json();
        break;
      case 401:
        customError = new Error('Authentication error');
        customError.status = 401;
        customError.msg = 'Authentication required, please log-in';
        throw customError;
        break;
      case 405:
        customError = new Error('Authentication error');
        customError.status = 401;
        customError.msg = 'Invalid credentials provided';
        throw customError;
        break;
      case 501:
        console.log('501 =>', response);
        customError = new Error('Image error');
        customError.status = 501;
        customError.msg = 'Invalid image type selected for upload';
        throw customError;
        break;
      case 413:
        return response.json()
          .then(err => {
            customError = new Error('Image too large error');
            customError.status = 413;
            customError.msg = 'Image file selected is too large';
            throw err;
          });
        break;
      case 406:
        customError = new Error('Ticket issue');
        customError.status = 406;
        customError.msg = 'Ticket was sold out';
        throw customError;
        break;
      case 403:
        return response.json()
          .then(err => {
            customError = new Error('Registration error');
            customError.status = 403;
            customError.msg = err.error;
            throw err;
          });
        break;
      case 444:
        return response.json()
          .then(err => {
            customError = new Error('Failed request ');
            customError.status = 444;
            customError.msg = err.error.msg;
            throw err;
          });
        break;
      default:
        console.log('Invalid response Default =>', response);
    }


  }


  /*
   *  el    - element to check value for
   *  count - min length to check for 
   *  arr   - the error array to increment
   *  errMsg - error message to add to array
   */
  checkValid(el, count, arr, errMsg) {
    if (el.val().length < count) {
      arr.push({
        id: el.attr('id'),
        msg: errMsg
      });
    }
    if (el.attr('type') === 'number') {
      arr.push({
        id: el.attr('id'),
        msg: errMsg
      });
    }
  }

}