(function () {

    //Get transition type
    function transitionSelect() {
        var el = document.createElement("div");
        if (el.style.WebkitTransition) return "webkitTransitionEnd";
        if (el.style.OTransition) return "oTransitionEnd";
        return 'transitionend';
    }
    //Get animation type
    function animationTypeSelect() {
        let el = document.createElement('div');
        if (el.style.webkitAnimation) return "webkitAnimationEnd";
        return "animationend";
    }

    function loadticketNames(tickets) {

    }
    //Override defaults if available or add in new props
    function extendDefaults(defaultProps, properties) {
        var property;
        for (property in properties) {
            if (properties.hasOwnProperty(property)) {
                defaultProps[property] = properties[property];
                if (property == 'tickets')
                    for (let i = 0; i < defaultProps[property].length; i++) {
                        let obj = defaultProps[property][i];
                        defaultProps.ticketData[obj.name] = {
                            name: obj.name,
                            price: obj.price,
                            selected: 0
                        };
                    }
            }
        }
        return defaultProps;
    }

    //Initialize Event listeners
    function initializeEvents() {
        this.closeButton.addEventListener('click', this.close.bind(this));
        let p = document.getElementsByClassName('ticket-quantity-choice');
        for (let k = 0; k < p.length; k++) {
            p[k].addEventListener('change', this.updateQuantity.bind(this));
        }
    }

    //Calculate total tickets cost
    function calculateTotal() {
        let serviceFee = 0;
        let processFee = 0;
        let totalTicketOnly = 0;
        let totalFees = 0;
        for (let element in this.options.ticketData) {
            let ticket = this.options.ticketData[element];
            let tempCost = ticket.price;
            let tempQuantity = ticket.selected;
            totalTicketOnly += tempCost * tempQuantity;
            serviceFee = calcServiceFee(tempCost);
            processFee = calcProcessFee(tempCost + serviceFee);
            totalFees += (serviceFee + processFee) * tempQuantity;
        }

        let centsTotal = totalTicketOnly;
        this.ticketTotalPrice = centsTotal + totalFees;
        this.ticketTotalContainer.innerHTML = `${this.options.currency}$${fromCents(totalTicketOnly)} <br>`;
        if (totalTicketOnly > 0)
            this.ticketTotalContainer.innerHTML += `+ Fees ${this.options.currency+'$'+fromCents(totalFees)}`;
    }

    // Define our constructor
    this.Modal = function () {

        // Create global element references
        this.ticketTotalContainer = null;
        this.ticketTotalPrice = null;
        this.ticketTotalQuantity = null;
        this.closeButton = null;
        this.modalInner = null;
        this.overlay = null;
        this.options = null;
        this.ticketNames = [];
        this.totalQuantity = 0;

        // Determine proper prefix
        this.transitionEnd = transitionSelect();
        this.animationEnd = animationTypeSelect();

        // Define option defaults
        var defaults = {
            className: 'fade-and-drop',
            closeButton: true,
            content: "",
            overlay: true,
            currency: 'USD',
            onBeforeClose: null,
            onAfterOpen: null,
            ticketData: {}
        };

        // Create options by extending defaults with the passed in arugments
        if (arguments[0] && typeof arguments[0] === "object") {
            this.options = extendDefaults(defaults, arguments[0]);
        }
        return this;
    }


    // Public Methods
    Modal.prototype.close = function () {
        var _ = this;
        let modalInner = document.querySelector('.modal-inner');
        modalInner.classList.toggle("fade-and-dip");
        modalInner.addEventListener(this.animationEnd, function () {
            modalInner.parentNode.parentNode.removeChild(modalInner.parentNode);
        });

    }

    Modal.prototype.addButtonEvent = function (label, cssClasses, callback) {
        this.actionButton = document.createElement('div');
        let _ = this;
        this.actionButton.id = "checkout-tickets-btn";
        if (typeof cssClasses === 'string' && cssClasses.length && cssClasses.indexOf('#') === -1) {
            cssClasses = cssClasses.replace(/\./g, '');
            // add classes to btn
            cssClasses.split(" ").forEach(function (item) {
                _.actionButton.classList.add(item);
            });
        }
        if (typeof cssClasses === 'string' && cssClasses.indexOf('#') !== -1) {
            cssClasses = cssClasses.replace('#', '');
            _.actionButton.id = cssClasses;
        }
        if (typeof callback === 'function')
            this.actionButton.addEventListener('click', callback);
        this.actionButton.innerHTML = label;
        this.footerContainer.appendChild(this.actionButton);
        return this.actionButton;
    }

    Modal.prototype.updateQuantity = function (e) {
        let value = parseInt(e.target.value);
        if (this.totalQuantity > 0) {
            this.totalQuantity -= this.options.ticketData[e.target.id].selected;
        }
        this.options.ticketData[e.target.id].selected = value;
        this.totalQuantity += value;
        calculateTotal.call(this);
        this.ticketTotalQuantity.innerHTML = `QTY:${parseFloat(this.totalQuantity)} `;
    }

    Modal.prototype.showLoader = function (parent) {
        return `<loader>
                            <loader class="inner">
                                <spinner></spinner>
                                <spinner></spinner>
                                <spinner></spinner>
                            </loader>
                        </loader>`;
    }

    Modal.prototype.openCheckout = function (callback) {
        initCheckoutModal.call(this);
        initializeEvents.call(this);
        if (typeof callback !== 'undefined' || callback != null)
            callback.call(this);
    }

    Modal.prototype.openAlert = function (data, fn = null) {
        this.options.alertText = data.text;
        switch (data.type) {
            case 'warning':
                this.options.alertType = 'warning';
                break;
            case 'success':
                this.options.alertType = 'success';
                break;
            case 'error':
                this.options.alertType = 'error';
                break;
        }
        initAlert.call(this);
        if (typeof fn === 'function')
            fn();
    }

    //Private methods
    function initAlert() {
        let textContent = '';
        let docFrag = null;
        let alert = null;

        if (typeof this.options.alertText === "string") {
            textContent = this.options.alertText;
        } else {
            textContent = this.options.alertText.innerHTML;
        }
        //Builder
        alert = document.getElementsByClassName('flash-popup-container')[0];
        if (alert != null) {
            alert.parentNode.removeChild(alert);
        }
        docFrag = document.createDocumentFragment();
        alert = document.createElement('div');
        alert.classList.add("flash-popup-container");
        alert.classList.add("pop-in-out");
        alert.classList.add(this.options.alertType);
        alert.innerHTML = ` <div class="flash-popup-inner">
                                    <p>${textContent}</p>
                                </div>`;
        docFrag.appendChild(alert);
        // Append DocumentFragment to body
        document.body.appendChild(docFrag);
        setTimeout(function () {
            alert.parentNode.removeChild(alert);
        }, 6000);


    }

    function initCheckoutModal() {
        var content, contentHolder, docFrag, modalTitle;

        if (typeof this.options.title === "string") {
            modalTitle = this.options.title;
        } else {
            modalTitle = this.options.title.innerHTML;
        }

        // Create a DocumentFragment to build with
        docFrag = document.createDocumentFragment();

        // Create modal element
        let modalInner = document.createElement("div");
        modalInner.className = "modal-inner " + this.options.className;;
        this.overlay = document.createElement("div");
        this.overlay.className = "modal-container ";
        this.overlay.appendChild(modalInner);
        docFrag.appendChild(this.overlay);

        //Header
        this.headerTitle = document.createElement("span");
        this.closeButton = document.createElement("span");
        this.headerContainer = document.createElement("div");
        this.headerContainer.className = "modal-header";
        this.closeButton.id = "modal-tickets-close";
        this.closeButton.innerHTML = "X";
        this.headerTitle.innerHTML = modalTitle;
        this.headerContainer.appendChild(this.headerTitle);
        this.headerContainer.appendChild(this.closeButton);
        modalInner.appendChild(this.headerContainer);

        //Body
        let modalBodyContainer = document.createElement('div');
        modalBodyContainer.className = "modal-body";
        modalInner.appendChild(modalBodyContainer);
        this.endSalestext = document.createElement('p');
        this.endSalestext.innerHTML = this.options.endingDate;

        this.options.tickets.forEach((ticket) => {
            let ticketBreakdownContainer2 = document.createElement('div');
            ticketBreakdownContainer2.className = "ticket-breakdown";
            let ticketpriceContainer = document.createElement('div');
            let ticketPrice = document.createElement('span');
            let leftContent = document.createElement('div');
            let rightContent = document.createElement('div');
            let ticketQuantitySelect = document.createElement('select');
            ticketQuantitySelect.className = "ticket-quantity-choice";
            ticketQuantitySelect.id = ticket.name;
            //Add ticket quantity
            addOptions(ticketQuantitySelect);
            let ticketTypeTitle = document.createElement('h2');
            let ticketDescription = document.createElement('div');
            ticketPrice.className = "checkout-price";
            ticketTypeTitle.innerHTML = ticket.name;
            ticketDescription.innerHTML = ticket.description;
            ticketPrice.innerHTML = `${this.options.currency}$${parseFloat((ticket.price / 100)).toFixed(2)}(per ticket)`;
            ticketpriceContainer.appendChild(ticketPrice);
            ticketpriceContainer.appendChild(ticketDescription);
            rightContent.appendChild(ticketQuantitySelect);
            leftContent.appendChild(ticketTypeTitle);
            leftContent.appendChild(ticketpriceContainer);
            ticketBreakdownContainer2.appendChild(leftContent);
            ticketBreakdownContainer2.appendChild(rightContent);
            modalBodyContainer.appendChild(ticketBreakdownContainer2);
        });
        if (this.options.tickets.length < 1) {
            let ticketBreakdownContainer2 = document.createElement('div');
            ticketBreakdownContainer2.innerHTML = "<strong>Tickets are all sold out!</strong>";
            modalBodyContainer.appendChild(ticketBreakdownContainer2);
        }

        //Footer
        this.checkoutBreakdown = document.createElement('div');

        this.footerContainer = document.createElement('div');
        this.ticketTotalQuantity = document.createElement('span');
        this.ticketTotalContainer = document.createElement('span');
        this.ticketTotalContainer.className = "checkout-data checkout-price";
        this.ticketTotalQuantity.className = "checkout-data";
        this.footerContainer.className = "modal-footer";
        this.ticketTotalContainer.innerHTML = "USD $0.00";
        this.ticketTotalQuantity.innerHTML = "QTY: 0 ";
        this.checkoutBreakdown.appendChild(this.ticketTotalQuantity);
        this.checkoutBreakdown.appendChild(this.ticketTotalContainer);
        this.footerContainer.appendChild(this.checkoutBreakdown);
        modalInner.appendChild(this.footerContainer);

        // Append DocumentFragment to body
        document.body.appendChild(docFrag);
    }

    function addOptions(holder) {
        for (let i = 0; i < 11; i++) {
            let option1 = document.createElement("option");
            option1.text = i;
            option1.value = i;
            holder.add(option1);
        }
    }

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
}());