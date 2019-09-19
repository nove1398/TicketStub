(function (window) {
    function myComponents() {
        let myLibrary = {};
        let alertTypes = ["warning", "invalid", "success", "info"];
        let alertColors = ['#f1c40f', '#e74c3c', '#35b084', '#3498db'];
        let defaults = {
            alertType: alertTypes[3],
            modal: null,
            tickets: null
        };

        // Get animation type
        function animationTypeSelect() {
            if (document.body.style.webkitAnimation) return "webkitAnimationEnd";
            return "animationend";
        }
        // Parse ticket row
        function ticketComponent(data, currency) {
            let count = '';
            for (let i = 0; i < 11; i++) {
                count += `<option value='${i}' >${i}</option>`
            }
        //     let now = (new Date().getTime() - (new Date().getTimezoneOffset() * 60000));
        //     let saleStart = new Date(+data.saleStart).getTime();
        //     let saleEnd = new Date(+data.saleEnd).getTime();
        //     var outSalePeriod = now >= data.saleEnd;
        //     var inSalePeriod = now >= saleStart && now <= saleEnd;
        // console.log(saleEnd);
        //     if(!inSalePeriod && data.limitSales === true){
        //         countdownTimer(saleStart);
        //     }

            let serviceFee = calcServiceFee(data.price);
            let processFee = calcProcessFee(data.price + serviceFee);
            let fees = fromCents((serviceFee + processFee) * 1);
            let accent = defaults.accentColor.length > 0 ? `style='border-left: 10px solid ${defaults.accentColor};'` : '';
            return `<div class='component-ticket' data-id='${data._id}' ${accent}>
                      <div>
                        <span class='component-ticket-name'>${data.name} <span>${currency}</span>$${fromCents(data.price)} <small>+$${fees} fee</small></span>
                        <span class='component-ticket-description'>${data.description}</span>
                      </div>
                      <div>
                          <select data-id='${data._id}' class='component-ticket-quantity '> 
                            ${count}
                          </select>
                      </div>
                 </div>`;
        }

        function parseTicketData(data) {
            let content = '';
            data.ticketTypes.forEach((ticket) => {
                content += ticketComponent(ticket, data.ticketCurrency);
            });
            return content;
        }

        function countdownTimer(dateTo){
            var timerInterval = setInterval(function(dateTo){
                let timeNow = new Date().getTime();
                let timeLeft = dateTo - timeNow;
                // Time calculations for days, hours, minutes and seconds
                let days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
                let hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                let minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                let seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
                //Update timer
                let timer = document.getElementsByClassName("component-ticket-quantity")[0].parentNode();
                timer.innerHTML = {days:days,hours:hours,minutes:minutes,seconds:seconds};
                timer.classList.remove("hidden");
                console.log({days:days,hours:hours,minutes:minutes,seconds:seconds});
                  if(timeLeft <= 0){
                    clearInterval(timerInterval);
                    console.log('DONE!!!');
                  }
                },1000,dateTo);
        }

        // Calculations
        function calcServiceFee(val) {
            return Math.round((val * 0.05) + 60);
        }

        function calcProcessFee(val) {
            return Math.round((val * 0.029) + 30);
        }

        function toCents(val) {
            return Math.round(parseFloat(val) * 100);
        }

        function fromCents(val) {
            return parseFloat((val / 100)).toFixed(2);
        }

        function updateTotals(quantityNode, priceNode) {
            let {
                totalPrice,
                totalQuantity
            } = myLibrary.getOrderTotals();

            quantityNode.innerHTML = `QTY: ${totalQuantity}`;
            priceNode.innerHTML = `<span>${defaults.tickets.ticketCurrency}</span> $${fromCents(totalPrice)}`;
        }

        ////////////// LIBRARY METHODS ///////////////
        myLibrary.init = () => {
            return myLibrary;
        };
        myLibrary.getSelectedTickets = function () {
            let tickets = [];
            defaults.tickets.ticketTypes.forEach((ticket) => {
                if (ticket.selectedQuantity && ticket.selectedQuantity > 0) {
                    tickets.push({
                        ticketId: ticket._id,
                        ticketQuantity: Number(ticket.selectedQuantity)
                    });
                }
            });
            return tickets;
        };
        myLibrary.getOrderTotals = function () {
            let counter = 0,
                price = 0;
            defaults.tickets.ticketTypes.forEach((ticket) => {
                if (ticket.selectedQuantity && ticket.selectedQuantity > 0) {
                    counter += Number(ticket.selectedQuantity);
                    let serviceFee = calcServiceFee(ticket.price);
                    let processFee = calcProcessFee(ticket.price + serviceFee);
                    let fees = ((serviceFee + processFee));
                    price += ((ticket.price + fees) * ticket.selectedQuantity);
                }
            });
            return {
                totalPrice: price,
                totalQuantity: counter
            };
        };
        myLibrary.showModal = function (args) {
            defaults.accentColor = args.accentColor || '';
            defaults.tickets = args.ticketData;
            let modalHtml = `<div class='components-modal-background'>
                          <div class='components-modal-container show disable-touch-feedback'>
                            <h3 class='components-modal-header'>Select </h3>
                            <div class='components-modal-body'>
                               ${parseTicketData(args.ticketData)}
                            </div>
                            <div class='components-modal-controls'>
                              <button class="components-modal-btn-cancel">Cancel</button>
                              <button class="components-modal-btn-checkout">Checkout</button>                                
                            </div>
                            <div class='components-modal-footer'>
                                <span class='checkout-data checkout-quantity'>QTY: 0</span>
                                <span class='checkout-data checkout-price'>USD $00.00</span>                  
                            </div>
                          </div>
                      </div>`;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            defaults.modal = document.querySelector('.components-modal-background');
            defaults.modal.style.display = 'flex';
            let checkOutBtn = defaults.modal.querySelector('.components-modal-btn-checkout');
            let cancelBtn = defaults.modal.querySelector('.components-modal-btn-cancel');
            let modalContainer = document.querySelector('.components-modal-container');
            let selectedQuantity = document.querySelector('.checkout-quantity');
            let selectedPrice = document.querySelector('.checkout-price');
            let selectBoxes = document.querySelectorAll('.component-ticket-quantity');
            for (let box of selectBoxes) {
                box.addEventListener('change', function (e) {
                    let id = e.target.getAttribute('data-id');
                    defaults.tickets.ticketTypes.forEach((item) => {
                        if (item._id == id) {
                            item.selectedQuantity = Number(e.target.value);
                        }
                    });
                    updateTotals(selectedQuantity, selectedPrice);
                });
            }
            cancelBtn.addEventListener('click', function () {
                modalContainer.classList.replace('show', 'hide');
                defaults.tickets = null;
                if (args.cancelBtnCallback && typeof args.cancelBtnCallback === 'function') {
                    args.cancelBtnCallback();
                }
            });
            checkOutBtn.addEventListener('click', function () {
                if (typeof args.checkoutCallback === 'function') {
                    args.checkoutCallback();
                };
            });
            modalContainer.addEventListener(animationTypeSelect(), function () {
                if (modalContainer.classList.contains('hide')) {
                    defaults.modal.style.display = 'none';
                    document.body.removeChild(defaults.modal);
                    defaults.modal = null;
                }

            });
            return myLibrary;
        };
        myLibrary.showAlert = function (args) {
            if (!alertTypes.includes(args.alertType))
                args.alertType = defaults.alertType;
            let alertContainer = document.querySelector('.components-alert-container');
            if (alertContainer) {
                alertContainer.parentNode.removeChild(alertContainer);
            }
            let alert = `<div class='components-alert-container ${args.alertType} show'>
                            <div class='components-alert-body'>
                                <h2>${args.title}</h2>  
                                <p>${args.contentText}</p>
                                <button class="components-alert-btn">Ok</button> 
                            </div>
                          </div>
                      `;

            document.body.insertAdjacentHTML('beforeend', alert);
            let cancelButton = document.querySelector('.components-alert-btn');
            alertContainer = document.querySelector('.components-alert-container');
            cancelButton.addEventListener('click', function (event) {
                event.preventDefault()
                alertContainer.classList.replace('show', 'hide');
            });
            alertContainer.addEventListener(animationTypeSelect(), function () {
                if (alertContainer.classList.contains('hide')) {
                    alertContainer.parentNode.removeChild(alertContainer);
                    if (args.callback && typeof args.callback === 'function')
                        args.callback();
                }
            });
        };
        return myLibrary;
    };


    if (typeof (window.myComponents) === 'undefined') {
        window.Components = myComponents();
        window.Components.init();
    }

})(window);