const baseURL = "http://localhost:3000";
const userloginlink = baseURL + "/auth/login";
// request headers
const reqheader = {
	"Content-Type": "application/json",
};

$(document).ready(function () {
	// Wait until document is fully parsed
	$('#userloginForm').on('submit', function (e) {
		e.preventDefault();
		const userID = $('#userloginID').val();
		const password = $('#userloginPass').val();

		const data = { userID, password };
		console.log(data);

		// posting the login request to server
		axios
			.post(userloginlink, data, { headers: reqheader })
			.then((response) => {
				console.log(response);
				const { jwt } = response.data;
				localStorage.setItem("taxiPool-token", jwt);
				window.location.href = "./user.html";
			})
			// catch any errors
			.catch((err) => {
				// check for message from server side
				if (err.response) {
					alert(err.response.data.message);
				} else {
					alert("Username/Password don't match");
				}
			})
			.then(() => {
				$('#userloginID').val('');
				$('#userloginPass').val('');
			});
	});

	$('#adminloginForm').on('submit', function (e) {
		e.preventDefault();
		const userID = $('#adminloginID').val();
		const password = $('#adminloginPass').val();

		const data = { userID, password };

		// posting the login request to server
		axios
			.post(userloginlink, data, { headers: reqheader })
			.then((response) => {
				console.log(response);

				// user has admin previlages
				if (response.data.user.isAdmin === true) {
					localStorage.setItem("taxiPool-token", response.data.jwt);
					window.location.href = "./admin.html";
				} else {
					// user lacks admin previlages
					alert("Try logging in as a user");
				}
			})
			//catching other errors
			.catch((err) => {
				// check for message from server side
				if (err.response) {
					alert(err.response.data.message);
				} else {
					alert("Username/Password don't match");
				}
			})
			.then(() => {
				$('#adminloginID').val('');
				$('#adminloginPass').val('');
			})

	});
})
