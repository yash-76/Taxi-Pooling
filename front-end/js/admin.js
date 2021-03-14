// Declaring the variables
const baseURL = "http://localhost:3000";
const aboutmelink = baseURL + "/auth/me";
const addvehiclelink = baseURL + "/ride/vehicle";
const getvehiclelink = baseURL + "/ride/vehicle/project";
const getadminTriplink = baseURL + "/ride/trip/project"; // admin view for trip, all trips
const adduserlink = baseURL + "/auth/register";
const addroutelink = baseURL + "/ride/roads";
const getroutelink = baseURL + "/ride/roads";
const addlocationlink = baseURL + "/ride/location";
const getlocationlink = baseURL + "/ride/location";

// request headers
const reqHeaders = {
	"Content-Type": "application/json",
	"Authorization": "bearer ",
};

// TODO: table refresh button

// Setting up table and jwt token when the page loads
$(document).ready(function () {
	if (localStorage.getItem("taxiPool-token") === null) {
		window.location.href = "./login.html";
	}
	reqHeaders.Authorization += localStorage.getItem("taxiPool-token");
	axios
		.post(aboutmelink, {}, { headers: reqHeaders })
		.then((response) => {
			console.log(response);
			if(response.data.isAdmin === false) {
				alert("Normal User : Redirecting to User Dashboard");
				window.location.href = "./user.html"
			}
			const userID = response.data.userID
			$('#loggedUserID').text(userID);
			getSetData();
			updateVehicleTable();
			updateRoutesTable();
			updateLocationsTable();
		})
		.catch((err) => {
			console.log(err);
			alert("Can't find login data");
			window.location.href = "./login.html";
		});

	// Getting the data from api call and passing it to setter function
	function getSetData() {
		axios
			.get(getadminTriplink, { headers: reqHeaders })
			.then((res) => {
				console.log(res.data);
				setData(res.data);
			})
			.catch((err) => {
				console.log(err);
			});
	}

	// Set the passed data into targeted table
	function setData(data) {
		data.sort(function (a, b) {
			return new Date(a.date) - new Date(b.date);
		});
		let tableContents = "";
		data.forEach((trip, index) => {
			let tableRow = `
				<tr>
					<th scope="row">${index}</th>
					<td>${trip.date}</td>
					<td>${trip.userID}</td>
					<td>${trip.source}</td>
					<td>${trip.dest}</td>
					<td>${trip.numOfPassengers}</td>
					<td>${trip.vehicle.name}</td>
					<td>${trip.vehicle.poolers.join(", ")}</td>
				</tr>\n
				`
			tableContents += tableRow;
		});

		if (tableContents == "") {
			tableContents = `
			<tr>
				<th scope="row">0</th>
				<td colspan="7">
					Looks like there are no Bookings.
				</td>
			</tr>
			`
		}

		$('#bookingContents').html(tableContents);
	}

	function updateVehicleTable() {
		axios
			.get(getvehiclelink, { headers: reqHeaders })
			.then((res) => {
				console.log("Vehicles: ", res.data);
				let tableContents = "";
				res.data.forEach((vehicle, index) => {
					let { name, maxCapacity, freeSeats, poolers, isAssigned } = vehicle;
					if(isAssigned === false) freeSeats = maxCapacity;
					let tableRow = `
						<tr>
							<th scope="row">${index}</th>
							<td>${name}</td>
							<td>${isAssigned}</td>
							<td>${maxCapacity - freeSeats} / ${maxCapacity}</td>
							<td>${isAssigned ? freeSeats : maxCapacity}</td>
							<td>${isAssigned ? poolers.join(", ") : "N/A"}</td>
						</tr>\n
					`
					tableContents += tableRow;
				});

				if (tableContents == "") {
					tableContents = `
						<tr>
							<th scope="row">0</th>
							<td colspan="5">
								Looks like there are no Vehicles.
							</td>
						</tr>
					`
				}

				$('#vehicleContents').html(tableContents);
			})
			.catch((err) => {
				console.log(err);
			});
	}

	function updateRoutesTable() {
		axios
			.get(getroutelink, { headers: reqHeaders })
			.then((res) => {
				console.log("Routes: ", res.data);
				let tableContents = "";
				if (res.data.length === 0) {
					tableContents = `
						<tr>
							<th scope="row">0</th>
							<td colspan="2">
								Looks like there are no Routes.
							</td>
						</tr>
					`
				}
				let listContents = `<option value="" selected>Choose...</option>\n`;
				res.data.forEach((route, index) => {
					const { name, locations } = route;
					let tableRow = `
						<tr>
							<th scope="row">${index}</th>
							<td>${name}</td>
							<td class="text-capitalize">${locations.join(", ")}</td>
						</tr>\n
					`
					let sOption = `<option value="${name}" >${name}</option>\n`
					tableContents += tableRow;
					listContents += sOption;
				});

				$('#routeContents').html(tableContents);
				$('#locationRoute').html(listContents);
			})
			.catch((err) => {
				console.log(err);
			});
	}

	function updateLocationsTable() {
		axios
			.get(getlocationlink, { headers: reqHeaders })
			.then((res) => {
				const locationList = res.data.sort();
				console.log("Locations: ", res.data);
				let tableContents = "";
				locationList.forEach((city, index) => {
					let tableRow = `
						<tr>
							<th scope="row">${index}</th>
							<td class="text-capitalize">${city}</td>
						</tr>\n
					`
					tableContents += tableRow;
				});

				if (tableContents == "") {
					tableContents = `
						<tr>
							<th scope="row">0</th>
							<td colspan="1">
								Looks like there are no Locations.
							</td>
						</tr>
					`
				}

				$('#locationContents').html(tableContents);
			})
			.catch((err) => {
				console.log(err);
			});
	}

	// logout button
	$('#logoutBtn').on('click', (e) => {
		e.preventDefault();
		console.log("logging out");
		localStorage.removeItem("taxiPool-token");
		window.location.href = "login.html";
	})

	// add user
	$('#adduserForm').on("submit", (e) => {
		e.preventDefault();

		const userID = $('#adduserID').val();
		const password = $('#adduserPass').val();
		const confirmPassword = $('#adduserConfirm').val();

		// Request form data
		const data = { userID, password, confirmPassword };

		// Post the request to server
		axios
			.post(adduserlink, data, {
				headers: reqHeaders,
			})
			.then((response) => {
				alert("Added User");
			})
			.catch((error) => {
				console.log(error);
				if (error.response) {
					alert("Booking wasnt possible because\n" + error.response.data.message);
				} else {
					alert("Booking wasnt possible because\n" + error.message);
				}
			})
			.then(() => {
				$('#adduserID').val('');
				$('#adduserPass').val('');
				$('#adduserConfirm').val('');
			})
	});

	// add location
	$('#addlocationForm').on("submit", (e) => {
		e.preventDefault();

		const name = $('#locationName').val();
		const roadName = $('#locationRoute').val();

		// Request form data
		const data = { name, roadName };

		// Post the request to server
		axios
			.post(addlocationlink, data, {
				headers: reqHeaders,
			})
			.then((response) => {
				alert("Added location " + data.name);
				updateRoutesTable();
				updateLocationsTable();
			})
			.catch((error) => {
				console.log(error);
				if (error.response) {
					alert("Error adding location\n" + error.response.data.message);
				} else {
					alert("Error adding location\n" + error.message);
				}
			})
			.then(() => {
				$('#locationRoute').val('');
				$('#locationName').val('');
			})
	});

	// add vehicle
	$('#addvehicleForm').on("submit", (e) => {
		e.preventDefault();

		const name = $('#vehicleName').val();
		const maxCapacity = $('#maxCapacity').val();

		// Request form data
		const data = { name, maxCapacity };

		// Post the request to server
		axios
			.post(addvehiclelink, data, {
				headers: reqHeaders,
			})
			.then((response) => {
				alert("Added vehicle " + data.name);
				updateVehicleTable();
			})
			.catch((error) => {
				console.log(error);
				if (error.response) {
					alert("Error adding vehicle\n" + error.response.data.message);
				} else {
					alert("Error adding vehicle\n" + error.message);
				}
			})
			.then(() => {
				$('#vehicleName').val('');
				$('#maxCapacity').val('');
			})
	});

	// add route
	$('#addrouteForm').on("submit", (e) => {
		e.preventDefault();

		const name = $('#routeName').val();

		// Request form data
		const data = { name };

		// Post the request to server
		axios
			.post(addroutelink, data, {
				headers: reqHeaders,
			})
			.then((response) => {
				alert("Added route " + data.name);
				updateRoutesTable();
			})
			.catch((error) => {
				console.log(error);
				if (error.response) {
					alert("Error adding route\n" + error.response.data.message);
				} else {
					alert("Error adding route\n" + error.message);
				}
			})
			.then(() => {
				$('#routeName').val('');
			})
	});
})
