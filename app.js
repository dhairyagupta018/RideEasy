
/* =========================================
   RIDEEASY - LOCAL STORAGE FEATURES
   Beginner-friendly vanilla JavaScript
========================================= */


/* STORAGE KEYS */

const STORAGE = {
    bookings: "rideeasy_bookings",
    selected: "rideeasy_selected_vehicle",
    compare: "rideeasy_compare",
    favourites: "rideeasy_favourites",
    recent: "rideeasy_recently_viewed",
    user: "rideeasy_user",
    users: "rideeasy_users"
};


/* VEHICLE DATA */

const vehicles = [
    {name:"Maruti Swift", category:"Hatchback", price:1500},
    {name:"Maruti Baleno", category:"Hatchback", price:1700},
    {name:"Hyundai i20", category:"Hatchback", price:1800},
    {name:"Tata Altroz", category:"Hatchback", price:1600},

    {name:"Honda City", category:"Sedan", price:2500},
    {name:"Hyundai Verna", category:"Sedan", price:2300},
    {name:"Maruti Dzire", category:"Sedan", price:1800},
    {name:"Honda Amaze", category:"Sedan", price:1900},

    {name:"Hyundai Creta", category:"SUV", price:2800},
    {name:"Tata Nexon", category:"SUV", price:2200},
    {name:"Mahindra Scorpio", category:"SUV", price:3500},
    {name:"Kia Seltos", category:"SUV", price:2700},

    {name:"Classic 350", category:"Bike", price:1200},
    {name:"Harley Davidson Nightster", category:"Bike", price:1500},
    {name:"BMW R 1300 GS", category:"Bike", price:2000},

    {name:"Activa", category:"Scooter", price:700}
];


/* LOCAL STORAGE FUNCTIONS */

function getData(key, fallback) {
    try {
        const data = JSON.parse(localStorage.getItem(key));
        return data || fallback;
    } catch (error) {
        return fallback;
    }
}

function saveData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}


/* TOAST MESSAGE */

function showToast(message) {
    let toast = document.getElementById("rideeasy-toast");

    if (!toast) {
        toast = document.createElement("div");
        toast.id = "rideeasy-toast";
        toast.className = "rideeasy-toast";
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(window.rideEasyToastTimer);

    window.rideEasyToastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2600);
}


/* POPUP CONFIRMATION */

function showModal(title, message, confirmText, onConfirm) {

    const oldModal = document.getElementById("rideeasy-modal");

    if (oldModal) {
        oldModal.remove();
    }

    const modal = document.createElement("div");

    modal.id = "rideeasy-modal";
    modal.className = "rideeasy-modal";

    modal.innerHTML = `
        <div class="rideeasy-modal-card" role="dialog" aria-modal="true">

            <span class="rideeasy-modal-mark">✓</span>

            <h2>${title}</h2>

            <p>${message}</p>

            <div class="rideeasy-modal-actions">

                <button type="button" class="button" id="rideeasy-confirm">
                    ${confirmText || "Continue"}
                </button>

                <button type="button" class="rideeasy-modal-cancel" id="rideeasy-close">
                    Close
                </button>

            </div>

        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById("rideeasy-confirm").addEventListener("click", () => {

        modal.remove();

        if (onConfirm) {
            onConfirm();
        }

    });

    document.getElementById("rideeasy-close").addEventListener("click", () => {
        modal.remove();
    });

    modal.addEventListener("click", event => {

        if (event.target === modal) {
            modal.remove();
        }

    });

}


/* VEHICLE FUNCTIONS */

function findVehicle(name) {

    return vehicles.find(vehicle =>
        vehicle.name.toLowerCase() === String(name).toLowerCase()
    );

}

function bookingLink(vehicle) {

    return "booking.html?vehicle=" +
        encodeURIComponent(vehicle.name) +
        "&price=" + vehicle.price;

}

function rememberSelected(vehicle) {

    if (vehicle) {
        saveData(STORAGE.selected, vehicle);
    }

}

function getSelectedFromPage() {

    const params = new URLSearchParams(window.location.search);

    const name = params.get("vehicle");
    const price = Number(params.get("price"));

    if (name) {

        const found = findVehicle(name);

        const selected = found || {
            name: name,
            price: price || 0
        };

        rememberSelected(selected);

        return selected;
    }

    return getData(STORAGE.selected, null);

}


/* =========================================
   VEHICLE CARDS
   FAVOURITES, RECENT VIEWS AND COMPARE
========================================= */

function setupVehicleCards() {

    document.querySelectorAll(".vehicle-card").forEach(card => {

        const bookLink = card.querySelector('a[href*="booking.html?vehicle="]');

        const heading = card.querySelector("h3");

        if (!heading) return;

        const name = heading.textContent.trim();

        if (
            name.toLowerCase() === "cars" ||
            name.toLowerCase() === "bikes" ||
            name.toLowerCase() === "scooters"
        ) {
            return;
        }

        const vehicle = findVehicle(name);

        if (!vehicle) return;


        /* RECENTLY VIEWED */

        const recent = getData(STORAGE.recent, []);

        const updatedRecent = [
            name,
            ...recent.filter(item => item !== name)
        ].slice(0, 6);

        saveData(STORAGE.recent, updatedRecent);


        /* FAVOURITE AND COMPARE BUTTONS */

        if (!card.querySelector(".rideeasy-card-actions")) {

            const actions = document.createElement("div");

            actions.className = "rideeasy-card-actions";


            /* FAVOURITE BUTTON */

            const favourite = document.createElement("button");

            favourite.type = "button";
            favourite.className = "rideeasy-secondary-button";

            const updateFavouriteText = () => {

                const favourites = getData(STORAGE.favourites, []);

                favourite.textContent = favourites.includes(name)
                    ? "♥ Saved"
                    : "♡ Favourite";

            };

            updateFavouriteText();

            favourite.addEventListener("click", () => {

                let favourites = getData(STORAGE.favourites, []);

                if (favourites.includes(name)) {

                    favourites = favourites.filter(item => item !== name);

                    showToast("Removed from favourites");

                } else {

                    favourites.push(name);

                    showToast("Added to favourites");

                }

                saveData(STORAGE.favourites, favourites);

                updateFavouriteText();

            });


            /* COMPARE BUTTON */

            const compare = document.createElement("button");

            compare.type = "button";
            compare.className = "rideeasy-secondary-button";
            compare.textContent = "＋ Compare";

            compare.addEventListener("click", () => {
                addToCompare(vehicle);
            });


            actions.append(favourite, compare);

            const content = card.querySelector(".vehicle-card-content");

            if (content) {
                content.appendChild(actions);
            }

        }


        /* REMEMBER SELECTED VEHICLE */

        if (bookLink) {

            bookLink.addEventListener("click", () => {
                rememberSelected(vehicle);
            });

        }

    });

}


/* =========================================
   COMPARE VEHICLES
========================================= */

function addToCompare(vehicle) {

    let list = getData(STORAGE.compare, []);

    if (list.some(item => item.name === vehicle.name)) {

        showToast("This vehicle is already selected");

        return;
    }

    if (list.length >= 2) {

        showModal(
            "Compare limit reached",
            "You can compare only two vehicles. Remove one vehicle first.",
            "Okay"
        );

        return;
    }

    list.push(vehicle);

    saveData(STORAGE.compare, list);

    showToast(vehicle.name + " added to comparison");

    if (window.location.pathname.endsWith("compare.html")) {
        renderComparePage();
    }

}


/* COMPARE PAGE */

function renderComparePage() {

    const wrapper = document.querySelector("[data-compare-area]");

    if (!wrapper) return;

    const list = getData(STORAGE.compare, []);

    wrapper.innerHTML = `
        <div class="rideeasy-compare-controls">

            <div>
                <label for="compare-one">First vehicle</label>

                <select id="compare-one">
                    <option value="">Select vehicle</option>
                </select>
            </div>

            <div>
                <label for="compare-two">Second vehicle</label>

                <select id="compare-two">
                    <option value="">Select vehicle</option>
                </select>
            </div>

        </div>

        <p class="form-note">
            Choose two vehicles to compare their rental prices and categories.
        </p>

        <div class="rideeasy-compare-result" id="compare-result"></div>

        <div class="rideeasy-compare-actions">
            <button type="button" class="button" id="clear-compare">
                Clear comparison
            </button>
        </div>
    `;

    const first = document.getElementById("compare-one");
    const second = document.getElementById("compare-two");

    vehicles.forEach(vehicle => {

        [first, second].forEach(select => {

            const option = document.createElement("option");

            option.value = vehicle.name;

            option.textContent =
                vehicle.name +
                " — ₹" +
                vehicle.price.toLocaleString("en-IN") +
                "/day";

            select.appendChild(option);

        });

    });

    if (list[0]) first.value = list[0].name;

    if (list[1]) second.value = list[1].name;


    function updateCompare() {

        const one = findVehicle(first.value);
        const two = findVehicle(second.value);

        const compareResult = document.getElementById("compare-result");

        if (!one || !two) {

            compareResult.innerHTML =
                '<p class="rideeasy-empty">Select two different vehicles to see the comparison.</p>';

            return;
        }

        if (one.name === two.name) {

            compareResult.innerHTML =
                '<p class="rideeasy-empty">Please choose two different vehicles.</p>';

            return;
        }

        saveData(STORAGE.compare, [one, two]);

        compareResult.innerHTML = `

            <div class="compare-table-wrapper">

                <table class="compare-table">

                    <thead>

                        <tr>
                            <th>Details</th>
                            <th>${one.name}</th>
                            <th>${two.name}</th>
                        </tr>

                    </thead>

                    <tbody>

                        <tr>
                            <td>Category</td>
                            <td>${one.category}</td>
                            <td>${two.category}</td>
                        </tr>

                        <tr>
                            <td>Rental price / day</td>
                            <td>₹${one.price.toLocaleString("en-IN")}</td>
                            <td>₹${two.price.toLocaleString("en-IN")}</td>
                        </tr>

                        <tr>
                            <td>Estimated 3-day cost</td>
                            <td>₹${(one.price * 3).toLocaleString("en-IN")}</td>
                            <td>₹${(two.price * 3).toLocaleString("en-IN")}</td>
                        </tr>

                        <tr>
                            <td>Price difference</td>
                            <td colspan="2">
                                ₹${Math.abs(one.price - two.price).toLocaleString("en-IN")} per day
                            </td>
                        </tr>

                        <tr>

                            <td>Booking</td>

                            <td>
                                <a class="button small-button"
                                   href="${bookingLink(one)}"
                                   data-book-vehicle="${one.name}">
                                   Book this
                                </a>
                            </td>

                            <td>
                                <a class="button small-button"
                                   href="${bookingLink(two)}"
                                   data-book-vehicle="${two.name}">
                                   Book this
                                </a>
                            </td>

                        </tr>

                    </tbody>

                </table>

            </div>
        `;

        document.querySelectorAll("[data-book-vehicle]").forEach(link => {

            link.addEventListener("click", () => {

                rememberSelected(findVehicle(link.dataset.bookVehicle));

            });

        });

    }


    first.addEventListener("change", updateCompare);

    second.addEventListener("change", updateCompare);


    document.getElementById("clear-compare").addEventListener("click", () => {

        saveData(STORAGE.compare, []);

        first.value = "";
        second.value = "";

        updateCompare();

        showToast("Comparison cleared");

    });

    updateCompare();

}


/* =========================================
   BOOKING PAGE
========================================= */

function setupBookingPage() {

    const form = document.querySelector("[data-booking-form]");

    if (!form) return;

    const selected = getSelectedFromPage();

    const vehicleSelect = document.getElementById("vehicle");

    const summary = document.querySelector(".booking-summary");

    const pickup = document.getElementById("pickup");

    const returnDate = document.getElementById("returnDate");


    /* AUTOMATIC VEHICLE SELECTION */

    if (vehicleSelect) {

        if (selected) {

            const matchingOption = Array.from(vehicleSelect.options).find(option =>

                option.textContent.toLowerCase().startsWith(selected.name.toLowerCase())

            );

            if (matchingOption) {

                vehicleSelect.value = matchingOption.value;

            } else {

                const option = document.createElement("option");

                option.value = selected.name;
                option.textContent = selected.name;

                vehicleSelect.appendChild(option);

                vehicleSelect.value = selected.name;

            }

        }

    }


    /* UPDATE BOOKING SUMMARY */

    function updateSummary(vehicle) {

        if (!summary || !vehicle) return;

        const price = summary.querySelector(".summary-price");

        if (price) {

            price.textContent =
                vehicle.name +
                " — ₹" +
                vehicle.price.toLocaleString("en-IN") +
                " / day";

        }

        let totalLine = summary.querySelector(".rideeasy-summary-total");

        if (!totalLine) {

            totalLine = document.createElement("p");

            totalLine.className = "rideeasy-summary-total";

            summary.appendChild(totalLine);

        }

        if (
            pickup &&
            returnDate &&
            pickup.value &&
            returnDate.value &&
            returnDate.value >= pickup.value
        ) {

            const firstDay = new Date(pickup.value + "T00:00:00");

            const lastDay = new Date(returnDate.value + "T00:00:00");

            const numberOfDays =
                Math.ceil((lastDay - firstDay) / 86400000) + 1;

            totalLine.textContent =
                "Estimated total: ₹" +
                (vehicle.price * numberOfDays).toLocaleString("en-IN") +
                " for " +
                numberOfDays +
                " day(s)";

        } else {

            totalLine.textContent =
                "Select your dates to see the estimated total.";

        }

    }


    if (selected) {
        updateSummary(selected);
    }


    /* VEHICLE DROPDOWN CHANGE */

    if (vehicleSelect) {

        vehicleSelect.addEventListener("change", () => {

            const option = vehicleSelect.options[vehicleSelect.selectedIndex];

            if (!option || !option.value) return;

            const vehicleName = option.textContent.split(" - ₹")[0].trim();

            const chosen = findVehicle(vehicleName);

            if (chosen) {

                rememberSelected(chosen);

                updateSummary(chosen);

            }

        });

    }


    /* UPDATE TOTAL WHEN DATES CHANGE */

    if (pickup) {

        pickup.addEventListener("change", () => {

            const vehicle = findVehicle(vehicleSelect?.value) || selected;

            if (vehicle) updateSummary(vehicle);

        });

    }

    if (returnDate) {

        returnDate.addEventListener("change", () => {

            const vehicle = findVehicle(vehicleSelect?.value) || selected;

            if (vehicle) updateSummary(vehicle);

        });

    }


    /* AUTO-FILL LOGGED-IN USER */

    const user = getData(STORAGE.user, null);

    if (user) {

        const name = document.getElementById("customerName");

        const email = document.getElementById("customerEmail");

        if (name && !name.value) name.value = user.name || "";

        if (email && !email.value) email.value = user.email || "";

    }


    /* DATE VALIDATION */

    const today = new Date().toISOString().split("T")[0];

    if (pickup) pickup.min = today;

    if (returnDate) returnDate.min = today;

    if (pickup && returnDate) {

        pickup.addEventListener("change", () => {

            returnDate.min = pickup.value || today;

            if (returnDate.value && returnDate.value < pickup.value) {

                returnDate.value = "";

            }

        });

    }


    /* SUBMIT BOOKING */

    form.addEventListener("submit", event => {

        event.preventDefault();

        if (!vehicleSelect || !pickup || !returnDate) return;

        const chosenText =
            vehicleSelect.options[vehicleSelect.selectedIndex]?.textContent || "";

        const chosen =
            findVehicle(chosenText.split(" - ₹")[0].trim()) || selected;

        if (!chosen) {

            showModal(
                "Choose a vehicle",
                "Please select a vehicle before submitting your booking.",
                "Okay"
            );

            return;

        }


        /* CHECK DATES */

        if (!pickup.value || !returnDate.value) {

            showModal(
                "Check your dates",
                "Please select both pickup and return dates.",
                "Okay"
            );

            return;

        }

        const start = new Date(pickup.value + "T00:00:00");

        const end = new Date(returnDate.value + "T00:00:00");

        const days = Math.ceil((end - start) / 86400000) + 1;

        if (days < 1 || pickup.value < today) {

            showModal(
                "Check your dates",
                "Please select valid pickup and return dates.",
                "Okay"
            );

            return;

        }


        /* GENERATE BOOKING NUMBER */

        const booking = {

            id: "RE" +
                Date.now().toString().slice(-8) +
                Math.floor(100 + Math.random() * 900),

            name: document.getElementById("customerName").value.trim(),

            email: document.getElementById("customerEmail").value.trim(),

            vehicle: chosen.name,

            category: chosen.category,

            price: chosen.price,

            days: days,

            total: chosen.price * days,

            pickup: pickup.value,

            returnDate: returnDate.value,

            location: document.getElementById("pickupLocation").value.trim(),

            payment: document.getElementById("payment").value,

            status: "Confirmed",

            paymentStatus: "Pending",

            createdAt: new Date().toISOString()

        };


        /* SAVE BOOKING */

        const bookings = getData(STORAGE.bookings, []);

        bookings.unshift(booking);

        saveData(STORAGE.bookings, bookings);

        rememberSelected(chosen);


        /* CONFIRMATION POPUP */

        showModal(

            "Booking confirmed!",

            "Your booking ID is " +
            booking.id +
            ". Your " +
            chosen.name +
            " booking has been saved on this device.",

            "View my bookings",

            () => {

                window.location.href =
                    "bookings.html?new=" +
                    encodeURIComponent(booking.id);

            }

        );

    });

}


/* =========================================
   MY BOOKINGS PAGE
========================================= */

function renderBookingsPage() {

    const area = document.querySelector("[data-bookings-list]");

    if (!area) return;

    const bookings = getData(STORAGE.bookings, []);

    if (!bookings.length) {

        area.innerHTML = `
            <div class="rideeasy-empty">

                <h2>No bookings yet</h2>

                <p>Your confirmed bookings will appear here.</p>

                <a class="button" href="explore.html">
                    Explore vehicles
                </a>

            </div>
        `;

        return;

    }


    area.innerHTML = bookings.map(booking => `

        <article class="rideeasy-booking-card">

            <div class="rideeasy-booking-heading">

                <div>

                    <p class="eyebrow">${booking.id}</p>

                    <h2>${booking.vehicle}</h2>

                </div>

                <span class="rideeasy-status ${booking.status === "Cancelled" ? "cancelled" : ""}">
                    ${booking.status}
                </span>

            </div>


            <div class="booking-details">

                <div>
                    <span>Customer</span>
                    <strong>${booking.name}</strong>
                </div>

                <div>
                    <span>Rental price</span>
                    <strong>₹${Number(booking.price).toLocaleString("en-IN")} / day</strong>
                </div>

                <div>
                    <span>Duration</span>
                    <strong>${booking.days} day(s)</strong>
                </div>

                <div>
                    <span>Total amount</span>
                    <strong>₹${Number(booking.total).toLocaleString("en-IN")}</strong>
                </div>

                <div>
                    <span>Pickup date</span>
                    <strong>${formatDate(booking.pickup)}</strong>
                </div>

                <div>
                    <span>Return date</span>
                    <strong>${formatDate(booking.returnDate)}</strong>
                </div>

                <div>
                    <span>Pickup location</span>
                    <strong>${booking.location}</strong>
                </div>

                <div>
                    <span>Payment</span>
                    <strong>${booking.paymentStatus}</strong>
                </div>

            </div>


            <div class="rideeasy-booking-actions">

                <a class="text-link"
                   href="track-booking.html?id=${encodeURIComponent(booking.id)}">
                   Track booking →
                </a>

                ${booking.status !== "Cancelled" ? `

                    <button class="rideeasy-danger-button"
                            type="button"
                            data-cancel-booking="${booking.id}">
                        Cancel booking
                    </button>

                ` : ""}

            </div>

        </article>

    `).join("");


    /* CANCEL BOOKING */

    area.querySelectorAll("[data-cancel-booking]").forEach(button => {

        button.addEventListener("click", () => {

            showModal(

                "Cancel this booking?",

                "Are you sure you want to cancel booking " +
                button.dataset.cancelBooking +
                "?",

                "Yes, cancel",

                () => {

                    const current = getData(STORAGE.bookings, []);

                    const item = current.find(entry =>
                        entry.id === button.dataset.cancelBooking
                    );

                    if (item) {
                        item.status = "Cancelled";
                    }

                    saveData(STORAGE.bookings, current);

                    renderBookingsPage();

                    showToast("Booking cancelled");

                }

            );

        });

    });

}


/* FORMAT DATE */

function formatDate(value) {

    if (!value) return "—";

    return new Date(value + "T00:00:00").toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* =========================================
   TRACK BOOKING PAGE
========================================= */

function setupTrackingPage() {

    const form = document.querySelector("[data-track-form]");

    const result = document.querySelector("[data-track-result]");

    const input = document.getElementById("tracking-number");


    if (!form || !result || !input) return;


    /* READ BOOKING ID FROM URL */

    const params = new URLSearchParams(window.location.search);

    if (params.get("id")) {

        input.value = params.get("id");

    }


    /* SEARCH BOOKING */

    function searchBooking(id) {

        const enteredID = String(id).trim().toUpperCase();

        if (!enteredID) {

            result.innerHTML =
                '<p class="rideeasy-empty">Please enter your booking number.</p>';

            return;

        }


        const bookings = getData(STORAGE.bookings, []);

        const booking = bookings.find(item =>

            String(item.id).trim().toUpperCase() === enteredID

        );


        /* BOOKING NOT FOUND */

        if (!booking) {

            result.innerHTML = `

                <div class="rideeasy-empty">

                    <h3>Booking not found</h3>

                    <p>Please check your booking number.</p>

                    <p>
                        Make sure you are using the same browser and website
                        where you made your booking.
                    </p>

                </div>

            `;

            return;

        }


        /* SHOW BOOKING DETAILS */

        result.innerHTML = `

            <div class="rideeasy-booking-card">

                <p class="eyebrow">
                    BOOKING NUMBER: ${booking.id}
                </p>

                <h2>${booking.vehicle}</h2>

                <p>
                    <strong>Booking Status:</strong>

                    <span class="rideeasy-status ${booking.status === "Cancelled" ? "cancelled" : ""}">
                        ${booking.status}
                    </span>
                </p>

                <p>
                    <strong>Customer:</strong>
                    ${booking.name}
                </p>

                <p>
                    <strong>Pickup Date:</strong>
                    ${formatDate(booking.pickup)}
                </p>

                <p>
                    <strong>Return Date:</strong>
                    ${formatDate(booking.returnDate)}
                </p>

                <p>
                    <strong>Pickup Location:</strong>
                    ${booking.location}
                </p>

                <p>
                    <strong>Duration:</strong>
                    ${booking.days} day(s)
                </p>

                <p>
                    <strong>Total Amount:</strong>
                    ₹${Number(booking.total).toLocaleString("en-IN")}
                </p>

                <p>
                    <strong>Payment:</strong>
                    ${booking.paymentStatus}
                </p>

                <a class="text-link" href="bookings.html">
                    View all bookings →
                </a>

            </div>

        `;

    }


    /* TRACK BUTTON */

    form.addEventListener("submit", event => {

        event.preventDefault();

        searchBooking(input.value);

    });


    /* AUTOMATIC SEARCH WHEN ID IS IN URL */

    if (input.value) {

        searchBooking(input.value);

    }

}


/* =========================================
   LOGIN AND REGISTER
========================================= */

function setupAccountForms() {


    /* REGISTER FORM */

    const registerForm = document.querySelector("[data-register-form]");

    if (registerForm) {

        registerForm.addEventListener("submit", event => {

            event.preventDefault();

            const user = {

                name: document.getElementById("name").value.trim(),

                email: document.getElementById("email").value.trim().toLowerCase(),

                phone: document.getElementById("phone").value.trim(),

                password: document.getElementById("password").value

            };


            let users = getData(STORAGE.users, []);


            if (users.some(item => item.email === user.email)) {

                showModal(

                    "Account already exists",

                    "Please login using this email address.",

                    "Go to login",

                    () => {
                        window.location.href = "login.html";
                    }

                );

                return;

            }


            users.push(user);

            saveData(STORAGE.users, users);

            saveData(STORAGE.user, {

                name: user.name,

                email: user.email,

                phone: user.phone

            });


            showModal(

                "Account created",

                "Your demo account has been saved in this browser.",

                "Continue",

                () => {
                    window.location.href = "index.html";
                }

            );

        });

    }


    /* LOGIN FORM */

    const loginForm = document.querySelector("[data-login-form]");

    if (loginForm) {

        loginForm.addEventListener("submit", event => {

            event.preventDefault();

            const email = document.getElementById("email").value.trim().toLowerCase();

            const password = document.getElementById("password").value;


            const user = getData(STORAGE.users, []).find(item =>

                item.email === email && item.password === password

            );


            if (!user) {

                showModal(

                    "Login not successful",

                    "Email or password is incorrect. Create an account first if you are new.",

                    "Okay"

                );

                return;

            }


            saveData(STORAGE.user, {

                name: user.name,

                email: user.email,

                phone: user.phone

            });


            showModal(

                "Welcome back!",

                "You are now signed in as " + user.name + ".",

                "Continue",

                () => {
                    window.location.href = "index.html";
                }

            );

        });

    }


    /* ACCOUNT NAVIGATION */

    const currentUser = getData(STORAGE.user, null);


    document.querySelectorAll(
        'a[href="login.html"].nav-button, a[href="login.html"].button'
    ).forEach(link => {

        if (currentUser) {

            link.textContent = "Hi, " + currentUser.name.split(" ")[0];

            link.href = "#";

            link.addEventListener("click", event => {

                event.preventDefault();

                showModal(

                    "Your account",

                    currentUser.name + " · " + currentUser.email,

                    "Logout",

                    () => {

                        localStorage.removeItem(STORAGE.user);

                        showToast("You have logged out");

                        window.location.reload();

                    }

                );

            });

        }

    });

}


/* =========================================
   PERSONAL ACTIVITY SECTION
   FAVOURITES AND RECENTLY VIEWED
========================================= */

function renderPersonalShelf() {

    const main = document.querySelector("body > main");

    if (!main || document.querySelector("[data-personal-shelf]")) return;


    const favourites = getData(STORAGE.favourites, []);

    const recent = getData(STORAGE.recent, []);


    if (!favourites.length && !recent.length) return;


    const shelf = document.createElement("section");

    shelf.className = "section";

    shelf.setAttribute("data-personal-shelf", "");


    let html = `

        <div class="section-heading">

            <div>

                <p class="eyebrow">YOUR RIDEEASY ACTIVITY</p>

                <h2>Pick up where you left off.</h2>

            </div>

        </div>

    `;


    /* FAVOURITES */

    if (favourites.length) {

        html += '<h3>Saved favourites</h3>';

        html += '<div class="rideeasy-shelf-links">';


        html += favourites.map(name => {

            const item = findVehicle(name);

            return item ? `

                <a class="rideeasy-shelf-link" href="${bookingLink(item)}">

                    ${item.name}

                    <span>
                        ₹${item.price.toLocaleString("en-IN")} / day
                    </span>

                </a>

            ` : "";

        }).join("");


        html += '</div>';

    }


    /* RECENTLY VIEWED */

    if (recent.length) {

        html += '<h3 style="margin-top:24px">Recently viewed</h3>';

        html += '<div class="rideeasy-shelf-links">';


        html += recent.map(name => {

            const item = findVehicle(name);

            return item ? `

                <a class="rideeasy-shelf-link" href="${bookingLink(item)}">

                    ${item.name}

                    <span>
                        ₹${item.price.toLocaleString("en-IN")} / day
                    </span>

                </a>

            ` : "";

        }).join("");


        html += '</div>';

    }


    shelf.innerHTML = html;

    main.appendChild(shelf);

}


/* =========================================
   START ALL FEATURES
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    setupVehicleCards();

    renderComparePage();

    setupBookingPage();

    renderBookingsPage();

    setupTrackingPage();

    setupAccountForms();

    renderPersonalShelf();

});
