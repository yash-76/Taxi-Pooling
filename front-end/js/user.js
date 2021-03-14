// Declaring the variables
const baseURL = "http://localhost:3000";
const getusertriplink = baseURL + "/ride/trip/me/project";
const createTripLink = baseURL + "/ride/trip";
const aboutmelink = baseURL + "/auth/me";
const cancelTripLink = baseURL + "/ride/trip"
const getlocationlink = baseURL + "/ride/location";

// request headers
const reqHeaders = {
	"Content-Type": "application/json",
	"Authorization": "bearer ",
};

function cancelTrip(Esource) {
	const tripID = $(Esource).attr('tripID');
	const tripTxt = $(Esource).attr('tripTxt')

	const confirmPrompt = confirm(`Are you sure you want to cancel \n ${tripTxt}`);

	if(confirmPrompt === false){
		return;
	}

	// Request form data
	const data = { tripID };

	// console.log(data, { headers: reqHeaders })
	// Post the request to server
	// axios
	// 	.delete(cancelTripLink, data, { headers: reqHeaders })
	axios({
		method: 'delete',
		url: cancelTripLink,
		headers: reqHeaders,
		data: data
	})
		.then((response) => {
			alert("Cancel Successful");
			location.reload();
		})
		.catch((error) => {
			// check for message from server side
			if (error.response) {
				alert("Cancelling wasnt possible because\n" + error.response.data.message);
			} else {
				alert("Cancelling wasnt possible because\n" + error.message);
			}
		});
}

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
			const { userID, isAdmin } = response.data;
			if (isAdmin === false) {
				$('#adminDashLink').hide();
			}
			$('#loggedUserID').text(userID);
			getSetData();
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
			.get(getusertriplink, { headers: reqHeaders })
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
			let cancelBtn = `
			<a class="btn btn-danger" tripID=${trip._id} tripTxt="Trip on ${trip.date} from ${trip.source} to ${trip.dest}" onclick="cancelTrip(this)" role="button">Cancel</a>
			`

			let tableRow = `
				<tr>
					<th scope="row">${index}</th>
					<td>${trip.date}</td>
					<td>${trip.source}</td>
					<td>${trip.dest}</td>
					<td>${trip.numOfPassengers}</td>
					<td>${trip.vehicle.name}</td>
					<td>${trip.vehicle.poolers.join(", ")}</td>
					<td>${cancelBtn}</td>
				</tr>\n
				`
			tableContents += tableRow;
		});

		if (tableContents == "") {
			tableContents = `
			<tr>
				<th scope="row">0</th>
				<td colspan="7">
					Looks like you have no Bookings.
				</td>
			</tr>
			`
		}

		$('#bookingContents').html(tableContents);
	}

	function updateLocationsTable() {
		axios
			.get(getlocationlink, { headers: reqHeaders })
			.then((res) => {
				const locationList = res.data.sort();
				console.log(res.data);
				let listContents = `<option value="" selected>Choose...</option>\n`;

				locationList.forEach((city, index) => {
					let sOption = `<option value="${city}" >${city}</option>\n`
					listContents += sOption;
				});

				$('#bookDest').html(listContents);
				$('#bookSource').html(listContents);
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

	// book trip
	$('#booktripForm').on("submit", (e) => {
		e.preventDefault();

		const source = $('#bookSource').val();
		const dest = $('#bookDest').val();
		const numOfPassengers = $('#bookPassengers').val();
		const date = $('#bookDate').val();
		var now = new Date();
		now.setHours(0, 0, 0, 0);

		if (source === dest) {
			alert("You should probably try to walk");
			$("#bookSource").val("");
			$("#bookDest").val("");
			$("#bookPassengers").val("");
			$("#bookDate").val("");
		} else if (numOfPassengers < 1) {
			alert("Please book rides for people, air can travel freely");
			$("#bookSource").val("");
			$("#bookDest").val("");
			$("#bookPassengers").val("");
			$("#bookDate").val("");
		} else if (Date.parse(date) < now) {
			alert("Time travel services not open as of now. Please try again later");
			$("#bookSource").val("");
			$("#bookDest").val("");
			$("#bookPassengers").val("");
			$("#bookDate").val("");
		} else {
			// Request form data
			const data = { source, dest, numOfPassengers, date };

			// Post the request to server
			axios
				.post(createTripLink, data, {
					headers: reqHeaders,
				})
				.then((response) => {
					alert("Booking Successful");
					getSetData();
				})
				.catch((error) => {
					// check for message from server side
					if (error.response) {
						alert(
							"Booking wasnt possible because\n" + error.response.data.message
						);
					} else {
						alert("Booking wasnt possible because\n" + error.message);
					}
				})
				.then(() => {
					$('#bookSource').val('');
					$('#bookDest').val('');
					$('#bookPassengers').val('');
					$('#bookDate').val('');
				})
		}
	});
});
