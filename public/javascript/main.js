$(document).ready(function () {
  $("#signin-btn").on("click", function (e) {
    e.preventDefault();
    let signInBlock = $(".sign-in-global");
    if (signInBlock.hasClass("active")) {
      signInBlock.removeClass("active").addClass("inactive");
    } else {
      signInBlock.removeClass("inactive").addClass("active");
    }
  });

  //Rsvp event
  $('#rsvp-tickets').on('click', function () {
    let box = $('#rsvp-email');
    if (box.attr('isOpen') === 'false') {
      box.slideDown();
      box.css({
        display: 'flex'
      });
      box.attr('isOpen', true);
    } else {
      box.slideUp();
      box.attr('isOpen', false);
    }
  });
  $('#rsvp-submit').on('click', function () {
    let id = $(this).parent().attr('data-id');
    let mail = $(this).prev('input').val();
    let rsvpBox = $('#rsvp-email');
    rsvpBox.attr('isOpen', false);
    rsvpBox.slideUp();
    $.post('/api/rsvp-event', {
        eventId: id,
        email: mail
      })
      .done(function (resp) {
        new Modal({}).openAlert({
          text: resp.msg,
          type: resp.result === true ? 'success' : 'error'
        });
      })
      .fail(function (error) {
        let message = error.responseJSON.error.msg;
        new Modal({}).openAlert({
          text: message || 'Not authenticated',
          type: 'error'
        });
        rsvpBox.slideDown();
        rsvpBox.attr('isOpen', true);
      });

  });

  /*
  * When the ticket has switched on limited sales time
  * After clicking on an element that requires a calendar instance to be shown
  * */
  $(document).on('change', '.limited-check-toggle', function (e) {
    if ($(this).is(':checked'))
      $(e.target).parent().parent().children('.limited-ticket-data-block').css('height', 'max-content');
    else
      $(e.target).parent().parent().children('.limited-ticket-data-block').css('height', '0px');
  });
  $(document).on('click', '.custom-ticket-limited-sale-time', function () {
    let calendarBox = $('<div>');
    let _this = $(this);
    calendarBox.css({
      'position': 'fixed',
      'display': 'flex',
      'background': 'rgba(0,0,0,0.5)',
      'justify-content': 'center',
      'align-items': 'center',
      'width': '100%',
      'height': '100%',
      'top': '0px',
      'left': '0px'
    });
    document.body.appendChild(calendarBox[0]);
    WsygCalendar.initCalendar({
      dateObj: new Date(),
      resultsContainer: $(this),
      container: calendarBox[0],
      callback: (dater) => {
        console.log(dater);
        calendarBox.remove();
        _this[0].dataset.dateAttr = `${(dater.dateObj.getTime() - (new Date().getTimezoneOffset() * 60000))}`;

        if (dater.hour > 12) {
          dater.hour = (dater.hour - 12) + ':' + dater.minutes + 'PM';
        } else {
          dater.hour = dater.hour + ':' + dater.minutes + 'AM';
        }
        $(this).children('span').text(` ${dater.day}/${dater.month}/${dater.year} ${dater.hour}`)
      },
      closeCallback: () => {
        calendarBox.remove();
      }
    });
  });

  //Submit event
  $('#submit-event').on('click', function (e) {
    const eventName = $('#event-name').val();
    const orgName = $('#event-organizer-name').val();
    const eventDescription = wsyJA.getTextContent();
    const eventCountry = $('#event-country').val();
    const eventAddress = $('#event-address').val();
    const eventCity = $('#event-city').val();
    const eventState = $('#state').val();
    const eventZipcode = $('#zipcode').val();
    const eventTimeStart = $('#event-time-start').val();
    const eventTimeEnd = $('#event-time-end').val();
    const eventTimeOfDayStart = $('#time-of-day-start').val();
    const eventTimeOfDayEnd = $('#time-of-day-end').val();
    const eventMonth = $('#event-month').val();
    const eventDay = $('#event-day').val();
    const eventYear = $('#event-year').val();
    const ticketCurrency = $('#currency-type').val();
    const termsCheck = $('#terms-check').val();
    const rsvpCheck = $('#rsvp-check').prop('checked');
    const rsvpLimit = $('#rsvp-limit').val();
    let ticketBlocks = $('.custom-ticket-block');
    const tagArray = [];
    const errors = [];
    let ticketObjs = [];
    // let names = $('.custom-ticket-name');
    // let descriptions = $('.custom-ticket-description');
    // let price = $('.custom-ticket-price');
    // let quantity = $('.custom-ticket-quantity');
    // let ticketObjects = [];
    // const ticketNames = [],
    //   ticketPrices = [],
    //   ticketQuantity = [],
    //   ticketDescriptions = [];

    // for (let inp in limitedTimeDays) {
    //   if (limitedTimeDays.hasOwnProperty(inp))
    //     console.log(limitedTimeDays[inp].value);
    // }
    // for (let el in names)
    //   if (names.hasOwnProperty(el)) {
    //     ticketNames.push(names[el].value);
    //   }
    // for (let el in price)
    //   if (price.hasOwnProperty(el)) {
    //     ticketPrices.push(price[el].value);
    //   }
    // for (let el in descriptions)
    //   if (descriptions.hasOwnProperty(el)) {
    //     ticketDescriptions.push(descriptions[el].value);
    //   }
    // for (let el in quantity)
    //   if (quantity.hasOwnProperty(el)) {
    //     ticketQuantity.push(quantity[el].value);
    //   }
    // for (let i = 0; i < names.length; i++) {
    //   ticketObjects.push({
    //     name: ticketNames[i],
    //     price: ticketPrices[i],
    //     description: ticketDescriptions[i],
    //     quantity: ticketQuantity[i]
    //   });
    // }
    ticketBlocks.each(function (index, val) {
      let tmp = $(val).find('input,textarea,div.start-time,div.end-time');
      ticketObjs.push({
        name: tmp[0].value,
        price: tmp[1].value,
        description: tmp[3].value,
        quantity: tmp[2].value,
        limitedTime: $(tmp[4]).prop('checked') === true ? true : false,
        limitedStart: $(tmp[5]).attr('data-date-attr'),
        limitedEnd: $(tmp[6]).attr('data-date-attr')
      });
    });
    if (ticketObjs.length < 1 && rsvpCheck === false) {
      Components.showAlert({
        title: 'Oops',
        alertType: 'invalid',
        contentText: "Must have a ticket price, if it's a free event enter 0"
      });
      return;
    }

    if (!$('#terms-check').prop('checked')) {
      return alert('You must agree to the terms and conditions if you wish to continue');
    }

    $('.tags .event-tag').each(function (i, item) {
      let tag = item.textContent;
      if (tag.length > 0)
        tagArray.push(item.textContent);
    });


    const utils = new Utils();
    utils.checkValid($('#event-name'), 3, errors, 'Invalid event name');
    utils.checkValid($('#event-organizer-name'), 4, errors, 'Organizer name too short');
    utils.checkValid($('#event-country'), 2, errors, 'Invalid country');
    let file = $('#event-image')[0].files[0];
    if (typeof file == 'undefined')
      errors.push({
        id: 'event-image',
        msg: 'Image must be uploaded as a part of your event'
      });

    if (errors.length > 0) {
      let errCont = $('#creation-errors');
      errCont.empty();
      errors.forEach((item, index) => {
        $('#' + item.id).addClass('error');
        errCont.append(`<span>${item.msg}</span>`);
      });
      $("body").get(0).scrollIntoView();
      return;
    }


    let formData = new FormData();
    formData.append('flyers', file);
    formData.append('eventName', eventName);
    formData.append('orgName', orgName);
    formData.append('eventDescription', eventDescription);
    formData.append('eventCountry', eventCountry);
    formData.append('eventAddress', eventAddress);
    formData.append('eventCity', eventCity);
    formData.append('eventState', eventState);
    formData.append('eventZipcode', eventZipcode);
    formData.append('eventTimeStart', eventTimeStart);
    formData.append('eventTimeEnd', eventTimeEnd);
    formData.append('eventTimeOfDayStart', eventTimeOfDayStart);
    formData.append('eventTimeOfDayEnd', eventTimeOfDayEnd);
    formData.append('ticketData', JSON.stringify(ticketObjs));
    formData.append('eventTags', tagArray);
    formData.append('eventMonth', eventMonth);
    formData.append('eventDay', eventDay);
    formData.append('eventYear', eventYear);
    formData.append('ticketCurrency', ticketCurrency);
    formData.append('rsvpLimit', rsvpLimit);
    formData.append('rsvpCheck', rsvpCheck);

    utils.makeFileCall('/api/new-event', formData,
      (resp) => {
        let errCont = $('#creation-errors');
        if (resp.error != null) {
          if(resp.error.name == "TokenExpiredError"){
            errCont.append(`<span>Login session expired</span>`);
            $("body").get(0).scrollIntoView();
            setTimeout(function(){window.location = "/loginUser"; },1500);
            return;
          }
          resp.error.forEach(function (item) {
            errCont.append(`<span>${item.msg}</span>`);
          });
          return;
        }
        $("body").get(0).scrollIntoView();
        Components.showAlert({
          title: 'Success',
          alertType: 'success',
          contentText: resp.msg
        });
      },
      (err) => {
        console.log(err);
        Components.showAlert({
          title: 'Oops',
          alertType: 'invalid',
          contentText: err.msg
        });
      });
  });

  $('#terms-check').on('change', function () {
    if ($(this).prop('checked'))
      $('#submit-event').removeClass('disabled');
    else
      $('#submit-event').addClass('disabled');
  });

  //Remove tags from event post
  $(document).on('click', '#event-tags .event-tag span', function () {
    $(this).parent().remove();
    let tagCount = $('#event-tags .event-tag').length;
    if (tagCount == 0)
      $('.tag-status').first().text('5 tags to go');
    else
      $('.tag-status').first().text((5 - tagCount) + ' tags to go');
  });

  //Adding tags to event post
  $('body').on('keyup', '#event-tag-text', function (e) {
    let code = e.keyCode | e.which;
    let text = $(this).val().trim();
    if (code === 13 && text.length > 2) {
      let tagCount = $('#event-tags .event-tag').length;
      if (tagCount >= 5) {
        return;
      }

      $('.tags').first().prepend('<span class="event-tag">#' + text + '<span><i class="fas fa-times"></i></span></span>');
      $(this).val('');
      $('.tag-status').first().text((4 - tagCount) + ' tags to go');
    }
  })

  //Dropper uploading
  $('#event-image').on('change', function (ev) {
    var reader = new FileReader();
    reader.readAsDataURL($('#event-image').prop('files')[0]);
    reader.onload = function (e) {
      $("#preview-image").attr('src', e.target.result);
      //document.getElementById('event-image').files = $('#event-image').prop('files');
    }
  });

  $('#event-image-dropper')
    .on('drop', function (e) {
      e.preventDefault();
      e.stopPropagation();
      $(this).removeClass('active');

      let dataTransfer = e.originalEvent.dataTransfer;
      if (dataTransfer && dataTransfer.files.length && dataTransfer.files[0].type.indexOf('image/') !== -1) {

        var reader = new FileReader();
        reader.readAsDataURL(dataTransfer.files[0]);
        reader.onload = function (e) {
          $("#preview-image").attr('src', e.target.result);
          document.getElementById('event-image').files = dataTransfer.files;
        }
      }
    }).on('dragenter', function (e) {
      e.preventDefault();
      e.stopPropagation();
      $(this).addClass('active');
    }).on('dragleave', function (e) {
      e.preventDefault();
      e.stopPropagation();
      $(this).removeClass('active');
    }).on('dragover', function (e) {
      e.preventDefault();
      e.stopPropagation();
    });

  //CARRY OUT HOME SEARCH
  $('#home-search-btn').on('click', function () {
    let searcTerm = $('#home-event-name').val().trim();
    let location = $('#home-event-location').val().trim();
    if (searcTerm.length < 3)
      return alert('Please enter a longer search term, so we may assist you better');
    window.location.href = `/search/${searcTerm}/${location}`;
  });

  //BOOKMARK EVENTS
  $('.bookmark-event').on('click', function () {
    const utils = new Utils();

    let data = {
      eventId: $(this).attr('id'),
      name: $(this).parent().parent().siblings('.event-item-name').text()
    };
    utils.makeCall('/api/addbookmark', data,
      (resp) => {
        if (typeof resp.error !== 'undefined') {
          Components.showAlert({
            title: 'Oops',
            alertType: 'invalid',
            contentText: resp.error.msg
          });
        } else {
          Components.showAlert({
            title: 'Success',
            alertType: 'success',
            contentText: resp.msg
          });
        }

      }, (error) => {
        Components.showAlert({
          title: 'Oops',
          alertType: 'invalid',
          contentText: error
        });
      });
  });
  $(document).on('click', '.delete-user-bookmark', function (e) {
    e.preventDefault();
    let id = $(this).attr('id');
    let data = {
      eventId: id
    };
    const utils = new Utils();
    utils.makeCall('/api/removebookmark', data,
      (resp) => {
        $('#' + id).parent().parent().parent().fadeOut(300, function () {
          $(this).remove()
        });
        Components.showAlert({
          title: 'Success',
          alertType: 'success',
          contentText: resp.msg
        });
      }, (err) => {
        Components.showAlert({
          title: 'Ooops',
          alertType: 'invalid',
          contentText: err.error.msg
        });

      });
  });

  //FULL SCREEN IMAGE FROM EVENT
  $('#event-preview-image').on('click', function (e) {
    let src = $(this).attr('src');
    let image = `<div class="modal-container">
                    <div class="modal-frame">
                      <img src=${src} class="modal-image"></div>
                    </div>`;
    $('body').append(image);
  });
  $('body').on('click', '.modal-container img', function () {
    $(this).parent().fadeOut('medium', function () {
      $(this).parent().remove();
    });
  });

  //BUY TICKETS
  $('#purch-tickets').on('click', function () {
    const eventId = window.location.pathname.split('/', 3)[2];

    $.get(`/api/get-event-data/${eventId}`)
      .done((resp) => {
        Components.showModal({
          accentColor: '#f5af1a',
          ticketData: resp.records,
          cancelBtnCallback: () => {
            let els = document.body.querySelectorAll('.stripe_checkout_app');
            for (let node of els)
              node.parentNode.removeChild(node);
          },
          checkoutCallback: () => {
            if (Components.getOrderTotals().totalQuantity < 1) {
              return Components.showAlert({
                title: 'Oops',
                contentText: 'You didn\'t select any tickets',
                alertType: 'invalid'
              });
            }

            let payLoad = {
              eventId: eventId,
              tickets: Components.getSelectedTickets()
            };
            let handler = StripeCheckout.configure({
              key: 'pk_test_ENXFOGCFbqkFfWoAEOy6Q2Ma' //'pk_live_65z0OWy9i3n4npe7nJ8YVmQ7'
            });
            handler.open({
              "name": 'Island Stub Inc',
              "image": '/img/black-logo.png',
              "locale": 'auto',
              "description": `Buying ${Components.getOrderTotals().totalQuantity} ticket(s) for an event`,
              "currency": resp.records.ticketCurrency.toLowerCase(),
              "amount": Components.getOrderTotals().totalPrice,
              "billingAddress": true,
              "token": function (token, args) {
                payLoad.token = token;
                $.post('/api/checkout-tickets', payLoad)
                  .done((resp) => {
                    Components.showAlert({
                      title: 'Awesome!',
                      contentText: resp.msg,
                      alertType: 'success'

                    });
                  })
                  .fail((error) => {
                    Components.showAlert({
                      title: 'oops',
                      contentText: error.responseJSON.error.msg || 'Internal server error',
                      alertType: 'invalid'

                    });
                  })
              }
            });
          }
        });
      })
      .fail((error) => {
        Components.showAlert({
          title: 'oops',
          contentText: error.responseJSON.error.msg,
          alertType: 'invalid'

        });
      });

  });
  // $('#purch-tickets').on('click', function () {
  //   const eventId = window.location.pathname.split('/', 3)[2];
  //   const utils = new Utils();
  //   let handler = StripeCheckout.configure({
  //     key: 'pk_live_65z0OWy9i3n4npe7nJ8YVmQ7'
  //   });

  //   utils.makeGetCall(`/api/get-event-data/${eventId}`, (resp) => {
  //     let ticketData = resp.records.ticketTypes;
  //     let myModal = new Modal({
  //       title: "Select Tickets",
  //       currency: resp.records.ticketCurrency.toUpperCase(),
  //       tickets: ticketData
  //     });
  //     //init modal
  //     myModal.openCheckout();
  //     let stripeButton = myModal.addButtonEvent('Checkout', '.btn .btn-l', () => {
  //       let data = {
  //         item: eventId,
  //         tickets: []
  //       };
  //       for (let el in myModal.options.ticketData) {
  //         let name = myModal.options.ticketData[el].name;
  //         let val = myModal.options.ticketData[el].selected;
  //         data.tickets.push({
  //           name: name,
  //           quantity: val
  //         });
  //       }

  //       handler.open({
  //         "name": 'Island Stub Inc',
  //         "image": '/img/black-logo.png',
  //         "locale": 'auto',
  //         "description": `Buying ${myModal.totalQuantity} ticket(s)`,
  //         "currency": resp.records.ticketCurrency.toLowerCase(),
  //         "amount": myModal.ticketTotalPrice,
  //         "billing-address": true,
  //         "token": function (token, args) {
  //           console.log(args);
  //           stripeButton.style.display = "none";
  //           data.token = token;

  //           utils.makeCall('/api/checkout-tickets', data,
  //             (checkoutData) => { //Callback
  //               if (typeof checkoutData.error !== 'undefined') {
  //                 myModal.close();
  //                 myModal.openAlert({
  //                   text: checkoutData.error.msg,
  //                   type: 'error'
  //                 });
  //                 return;
  //               }
  //               if (checkoutData.status === 'succeeded') {
  //                 myModal.close();
  //                 myModal.openAlert({
  //                   text: checkoutData.msg,
  //                   type: 'success'
  //                 });
  //               } else {
  //                 stripeButton.style.display = 'flex';
  //                 let statustext = '';
  //                 for (let item in checkoutData.msg) {
  //                   console.log(item);
  //                   statustext += `'${item}' ${checkoutData.msg[item]}<br>`;
  //                 }
  //                 myModal.openAlert({
  //                   text: statustext,
  //                   type: 'error'
  //                 });
  //               }
  //             },
  //             (error) => { //Catch
  //               console.log('catch block', error);
  //               stripeButton.style.display = 'flex';
  //               myModal.openAlert({
  //                 text: error.message,
  //                 type: 'error'
  //               });
  //             });
  //         }
  //       });
  //     });

  //   }, (error) => {
  //     new Modal({}).openAlert({
  //       text: error.msg || error.message,
  //       type: 'error'
  //     });
  //   });
  // });

  $('#purchase-data h1').on('click', function () {
    $(this).closest('.user-purchase-history').toggle();
  });

  $('#update-seller-bank').on('click', function () {
    let data = {};
    let instNum = $('#inst-num').val();
    let branchNum = $('#branch-num').val();
    let accNum = $('#acc-num').val();
    let bankName = $('#bank-name').val();
    let accountName = $('#account-holder').val();
    let paypalMail = $('#pp-mail').val();
    data.instNum = instNum;
    data.branchNum = branchNum;
    data.accNum = accNum;
    data.bankName = bankName;
    data.accountName = accountName;
    data.paypalMail = paypalMail;
    fetch('/api/updatebank', {
        body: JSON.stringify(data), // must match 'Content-Type' header
        credentials: 'same-origin',
        headers: {
          'content-type': 'application/json',
          'user-agent': 'Mozilla/4.0',
          'authorization': localStorage.getItem('token')
        },
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors' // no-cors, cors, *same-origin
      }).then(resp => resp.json())
      .then((response) => {
        let text = response.data.name.first + ' ' + response.data.name.last + ' your payment details have been updated';
        Components.showAlert({
          title: 'Success',
          contentText: text,
          alertType: 'success'
        });
      }).catch((error) => {
        console.log(error);
      })
  });

  //Seller profile functions
  $('body').on('click', '.delete-event-seller', function () {
    if (!confirm('Are you sure you want to remove this event listing?')) {
      return;
    }
    let parentEl = $(this).parent().parent();
    const utils = new Utils();
    let body = {
      eventId: $(this).parent().attr('id')
    };
    utils.makeCall('/api/delete-event', body,
      (resp) => {
        if (resp.error) {
          Components.showAlert({
            title: 'Ooops',
            contentText: `${resp.msg}`,
            alertType: 'invalid',
            callback: () => {
              window.location = 'auth/logout';
            }
          });
          return;
        }
        parentEl.fadeOut();
        Components.showAlert({
          title: 'Success',
          contentText: `"${resp.name}" has been deleted`,
          alertType: 'success'
        });
      }, (error) => {
        Components.showAlert({
          title: 'Ooops',
          contentText: error.msg || error.message,
          alertType: 'invalid'
        });
      });
  });

  //Deactivate seller
  $('body').on('click', '.deactivate-event-seller', function () {
    let status = $(this).hasClass('active-event') ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${status} this event listing?`)) {
      return;
    }
    const utils = new Utils();
    let currEl = $(this);
    let body = {
      eventId: currEl.parent().attr('id')
    };
    utils.makeCall('/api/disable-event', body,
      (resp) => {

        currEl.removeClass('inactive-event');
        currEl.removeClass('active-event');
        currEl.addClass(`${resp.doc.isActive?'active-event':'inactive-event'}`);
        Components.showAlert({
          title: 'Success',
          contentText: `"${resp.doc.eventName}" has been ${resp.doc.isActive?'activated':'deactivated'}`,
          alertType: 'success'
        });
      }, (error) => {
        Components.showAlert({
          title: 'Oops',
          contentText: error.msg || error.message,
          alertType: 'invalid'
        });
      });
  });

  //Update event
  $('#update-event').on('click', function () {
    const eventId = $('.event-create-container').attr('data-id');
    const eventName = $('#event-name').val();
    const orgName = $('#event-organizer-name').val();
    const eventDescription = wsyJA.getTextContent();
    const eventCountry = $('#event-country').val();
    const eventVenueName = $('#event-venue-name').val();
    const eventAddress1 = $('#event-address1').val();
    const eventCity = $('#event-city').val();
    const eventState = $('#state').val();
    const eventZipcode = $('#zipcode').val();
    const eventTimeStart = $('#event-time-start').val();
    const eventTimeEnd = $('#event-time-end').val();
    const eventTimeOfDayStart = $('#time-of-day-start').val();
    const eventTimeOfDayEnd = $('#time-of-day-end').val();
    const eventMonth = $('#event-month').val();
    const eventDay = $('#event-day').val();
    const eventYear = $('#event-year').val();
    const rsvpLimit = $('#rsvp-limit').val();
    const rsvpCheck = $('#rsvp-check:checked').val();
    const ticketCurrency = $('#currency-type').val();
    const allTags = $('.event-tag');
    const ticketNames = $('.custom-ticket-name');
    const ticketDescriptions = $('.custom-ticket-description');
    const ticketQuantity = $('.custom-ticket-quantity');
    const ticketPrice = $('.custom-ticket-price');
    let eventTags = [];
    let tickets = [];


    for (let index = 0; index < ticketNames.length; index++) {
      tickets.push({
        name: ticketNames[index].value.trim(),
        description: ticketDescriptions[index].value.trim(),
        quantity: ticketQuantity[index].value.trim(),
        price: ticketPrice[index].value.trim()
      });
    };
    let tag;
    for (let i = 0; i < allTags.length; i++) {
      tag = allTags[i].innerText.trim();
      if (tag.length > 0)
        eventTags.push(tag.replace('#', ''));
    }

    (async () => {
      try {
        let formData = new FormData();
        formData.append('eventName', eventName);
        formData.append('orgName', orgName);
        formData.append('eventDescription', eventDescription);
        formData.append('eventCountry', eventCountry);
        formData.append('eventVenueName', eventVenueName);
        formData.append('eventAddress', eventAddress1);
        formData.append('eventCity', eventCity);
        formData.append('eventState', eventState);
        formData.append('eventZipcode', eventZipcode);
        formData.append('eventTimeStart', eventTimeStart);
        formData.append('eventTimeEnd', eventTimeEnd);
        formData.append('eventTimeOfDayStart', eventTimeOfDayStart);
        formData.append('eventTimeOfDayEnd', eventTimeOfDayEnd);
        formData.append('eventTags', eventTags);
        formData.append('eventMonth', eventMonth);
        formData.append('eventDay', eventDay);
        formData.append('eventYear', eventYear);
        formData.append('ticketCurrency', ticketCurrency);
        formData.append('eventTickets', JSON.stringify(tickets));
        formData.append('eventId', eventId);
        formData.append('rsvpLimit', rsvpLimit);
        formData.append('rsvpCheck', rsvpCheck === 'on' ? true : false);

        let response = await fetch('/api/creator/update-event', {
          body: formData, // must match 'Content-Type' header
          cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
          credentials: 'same-origin', // include, same-origin, *omit
          headers: {
            'user-agent': 'Mozilla/4.0',
            'X-Requested-With': 'XMLHttpRequest',
            'authorization': localStorage.getItem('token')
          },
          method: 'POST', // *GET, POST, PUT, DELETE, etc.
          mode: 'cors', // no-cors, cors, *same-origin
          referrer: 'no-referrer', // *client, no-referrer
        });
        let resp = await response.json();
        if (resp.doc !== null) {
          Components.showAlert({
            title: 'Success',
            contentText: `"${resp.doc.eventName}" has been updated!`,
            alertType: 'success'
          });
        }
      } catch (e) {
        console.log(e);
      }
    })();
  });



  //Carry out searching
  $('#event-search-term').on('keyup', function (e) {
    if (e.which === 13) {
      let searchTerm = $(this).val().trim();
      let location = $('#event-search-location').val().trim();
      $('.event-listing-container').empty();
      loadData('', location, searchTerm);
    }
  });
  $('#search-events').on('click', function (e) {
    e.preventDefault();
    let searchTerm = $('#event-search-term').val().trim();
    let location = $('#event-search-location').val().trim();
    $('.event-listing-container').empty();
    loadData('', location, searchTerm);
  });

  $(window).on("scroll", function () {
    if (window.location.pathname.indexOf('search', 1) === -1) {
      return;
    }
    var scrollHeight = $(document).height();
    var scrollPosition = $(window).height() + $(window).scrollTop();
    if ((scrollHeight - scrollPosition) / scrollHeight === 0) {
      let lastId = $('.event-listing-container .event-item-container:last-of-type').attr('data-id');
      let searchTerm = $('#event-search-term').val().trim();
      let location = $('#event-search-location').val().trim();
      loadData(lastId, location, searchTerm);
    }
  });


  //LOAD DATA FROM SERVER
  function loadData(id = '', location = '', searchTerm = '') {
    const utils = new Utils();
    let data = {
      term: searchTerm,
      location: location,
      lastId: id
    };
    utils.makeCall('/api/search-events', data, (resp) => {
      let resultContainer = $('.event-listing-container');
      let searchLoader = $('loader');
      let searchStatus = $('#search-event-status');
      let docs = resp.records;
      let parsedTags = '';


      if (docs.length < 1) {
        searchStatus.html("<h3>No results found for your query</h3>");
        return;
      }
      resultContainer.html('');
      searchStatus.html('');
      for (let i = 0; i < docs.length; i++) {
        let doc = docs[i];
        for (let k = 0; k < doc.eventTags.length; k++)
          parsedTags += `<span class="event-tag">${ doc.eventTags[k].name }</span>`;

        let row = `<div class="event-item-container" data-id="${doc._id}">
                      <a href="/viewEvent/${doc._id}">
                      <img src="${doc.eventFlyer? doc.eventFlyer: "/img/black-logo.png"}">
                    </a>
                      <div class="event-price">
                        <span>$${ (doc.ticketTypes.general.price != 0)? doc.ticketTypes.general.price : (doc.ticketTypes.vip.price!=0)? doc.ticketTypes.vip.price : (doc.ticketTypes.earlyBirds.price!=0)? doc.ticketTypes.earlyBirds.price : "Check event for price!" }</span>
                      </div>
                      <div class="event-item-body">
                        <div class="event-item-name">${doc.eventName}</div>
                        <div class="event-item-description">
                        ${ doc.eventDescription}
                        </div>
                        <div class="event-actionbar">
                          <div class="tags">
                          ${ parsedTags }
                          </div>
                          <div>
                            ${(resp.logged)? '<i title="Save flyer" class="fas fa-bookmark bookmark-event" id="${doc._id}"></i>': ''}
                            <i title="Share flyer" class="fas fa-share-alt share-event">
                                <div id="share-buttons">
                                <!-- Email -->
                                <a href="mailto:?Subject=IslandStub Event Share&amp;Body=I%20saw%20this%20and%20thought%20to%20share%20it%20with%20you!%20 https://islandstub.ca/viewEvent/<%= doc._id; %>">
                                    <img src="https://simplesharebuttons.com/images/somacro/email.png" alt="Email" />
                                </a>
                                <!-- Facebook -->
                                <a href="http://www.facebook.com/sharer.php?u=https://islandstub.ca/viewEvent/<%= doc._id; %>" target="_blank">
                                    <img src="https://simplesharebuttons.com/images/somacro/facebook.png" alt="Facebook" />
                                </a>  
                              <!-- Twitter -->
                                <a href="https://twitter.com/share?url=https://islandstub.ca/viewEvent/<%= doc._id; %>&text=Check%20out%20this%20event!&hashtags=islandstub,event,islandstub.ca" target="_blank">
                                    <img src="https://simplesharebuttons.com/images/somacro/twitter.png" alt="Twitter" />
                                </a>
                              </div>
                            </i>
                          </div>
                        </div>
                      </div>
                    </div>`;
        resultContainer.append(row);
      }
    }, (error) => {
      console.log(error);
    });
  }



});