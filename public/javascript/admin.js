$(document).ready(function() {

$('#user-search-box').on('keyup',function(e){
    if(e.which === 13){
        let data = {name:$(this).val(),lastId:''};
        fetch(`/api/searchuser/${$(this).val()}`,
            {
                // body: JSON.stringify(data), // must match 'Content-Type' header
                credentials: 'same-origin',
                headers: {
                        'user-agent': 'Mozilla/4.0',
                        'authorization': localStorage.getItem('token')
                },
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors' // no-cors, cors, *same-origin
          })
          .then(resp => resp.json())
          .then((response)=>{
              let row = '';
              let container = $('.user-search-box');
              container.empty();
              response.docs.forEach(function(element){

                    row = `<div class="user-result-container" id="${element._id}">
                                <div class="user-search-name">${element.name.first + ' ' + element.name.last} <a href="#" class="view-payment" title="View user payment info"><i class="fas fa-address-book"></i></a></div>
                                <div>Email: <span>${element.email}</span></div>
                                <div>Gender: ${element.gender==='m'?'Male':'Female'}</div>
                                <div>Account status: <span style="display:inline-block;text-transform:uppercase;font-weight:bold;">${element.isActive? 'Activated' : 'Deactivated'}</span> (<a  class="deactivate-user" href="#">${element.isActive?'Deactivate':'Activate'}</a>)</div>
                                <div>Account type: ${element.level===2?'Creator Account':'Buyer account'}</div>
                                <div><a class="detach-user" href="#">Delete Account</a></div>
                           </div>`;
                    container.append(row);
              });
          })
          .catch((err)=>{
              console.log(err);
          });
    }
});

$(document).on('click','.view-payment', function(){
    let item = $(this);
    let id = item.parent().parent().attr('id');
    let data = {userId: id};
    fetch('/api/getuser',{
        body: JSON.stringify(data),
        credentials: 'same-origin',
        headers: {
                'Content-Type': 'application/json',
                'user-agent': 'Mozilla/4.0',
                'authorization': localStorage.getItem('token')
        },
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors' // no-cors, cors, *same-origin
    })
    .then(resp=>resp.json())
    .then((response)=>{
        console.log(response)
        let container = $('.admin-popup-container');
        let subContainer = $('.user-payment-info');
        let dataBlock = '';
        dataBlock = `<div>Name on account: ${response.accountName || "- -"}</div>
                    <div>Account number:  ${response.accountNumber || "- -"}</div>
                    <div>Bank name:  ${response.bankName || "- -"}</div>
                    <div>Branch number:  ${response.branchNumber || "- -"}</div>
                    <div>Institution number:  ${response.institutionNumber || "- -"}</div>
                    <div>PayPal email: ${response.paypalEmail || "- -"}</div>`;
        subContainer.html(dataBlock);
        container.css('top','0%');
    })
    .catch((error)=>{
        console.log(error);
    });
});

$('#close-admin-popup').on('click', function(){
    $(this).parent().css('top', '-100%');
});

$(document).on('click', '.detach-user', function(e){
    e.preventDefault();
    if(confirm('Are you sure you want to permanently delete this account and all it\'s associated data?')){
        let item = $(this);
        let id = item.parent().parent().attr('id');
        let data = {userId: id};
        fetch('/api/removeuser',{
            body: JSON.stringify(data),
            credentials: 'same-origin',
            headers: {
                    'Content-Type': 'application/json',
                    'user-agent': 'Mozilla/4.0',
                    'authorization': localStorage.getItem('token')
            },
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors' // no-cors, cors, *same-origin
        })
        .then(resp=>resp.json())
        .then((response)=>{
            console.log(response)
        })
        .catch((error)=>{
            console.log(error);
        });
    }
});

$(document).on('click', '.deactivate-user', function(e){
    e.preventDefault();
    let item = $(this);
    let id = item.parent().parent().attr('id');
    let data = {userId: id};
    fetch('/api/disableuser',{
        body: JSON.stringify(data),
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
                'user-agent': 'Mozilla/4.0',
                'authorization': localStorage.getItem('token')
        },
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors' // no-cors, cors, *same-origin
    })
    .then(response => response.json().then(json => {
        return json;
      }))
    .then((response)=>{
        console.log(response)
        let status = response.doc.isActive?'Activated':'Deactivated';
        alert(response.doc.name.first + ' has been '+status+'d');
        item.prev('span').text(status);
        item.text(!response.doc.isActive?'Activate':'Deactivate');
    })
    .catch((error)=>{
        console.log(error);
    });
});

$('#event-searching').on('keyup',function(e){
    if(e.which === 13){
        let searchTerm = $(this).val();
        fetch('/api/searchevent/'+searchTerm,{
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                    'user-agent': 'Mozilla/4.0',
                    'authorization': localStorage.getItem('token')
            },
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors' // no-cors, cors, *same-origin
        })
        .then(response => response.json().then(json => {
            return json;
          }))
        .then((response)=>{
            let container = $('.event-search-data');
            console.log(response)
            var row = '';
            container.empty();
            response.docs.forEach((element)=>{
                row = `<div class="event-search-result-container" id="${element._id}">
                            <div class="title"> ${element.eventName} </div>
                            <div class="description">${element.eventDescription.substring(0,100)}...</div>
                            <div><a href="#" class="delete-event">Delete Event</a> | <a href="#" class="deactivate-event">${!element.isActive?'Activate Event':'Deactivate Event'}</a></div>
                       </div>`;
                container.append(row);
            });
        })
        .catch((error)=>{
            alert('An error occured while searching for the event');
        });
    }
});

$(document).on('click', '.deactivate-event', function(e){
    e.preventDefault();
    let item = $(this);
    let id = item.parent().parent().attr('id');
    let data = {eventId: id};
    fetch('/api/disableevent',{
        body: JSON.stringify(data),
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
                'user-agent': 'Mozilla/4.0',
                'authorization': localStorage.getItem('token')
        },
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors' // no-cors, cors, *same-origin
    })
    .then(response => response.json().then(json => {
        return json;
      }))
    .then((response)=>{
        let status = response.doc.isActive?'Event Activated':'Event Deactivated';
        alert(status);
        item.text(!response.doc.isActive?'Activate Event':'Deactivate Event');
    })
    .catch((error)=>{
        alert('An error occured while trying to deactivate this event');
    });
});

$(document).on('click', '.delete-event', function(e){
    e.preventDefault();
    if(confirm('Are you sure you want to delete this event and all associated data?')){
        let item = $(this);
        let id = item.parent().parent().attr('id');
        let data = {eventId: id};
        fetch('/api/deleteevent',{
            body: JSON.stringify(data),
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                    'user-agent': 'Mozilla/4.0',
                    'authorization': localStorage.getItem('token')
            },
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors' // no-cors, cors, *same-origin
        })
        .then(response => response.json().then(json => {
            return json;
        }))
        .then((response)=>{

            alert('Event Deleted');
        })
        .catch((error)=>{
            alert('An error occured while trying to delete this event');
        });
    }
});
});