document.addEventListener('DOMContentLoaded', () => {
    let elements = []
    let container = document.querySelector('#container')
    // Add each row to the array
    container.querySelectorAll('.row').forEach(el => elements.push(el))
    // Clear the container
    container.innerHTML = ''
    // Sort the array from highest to lowest
    elements.sort((a, b) => b.querySelector('.score').textContent - a.querySelector('.score').textContent)
    // Put the elements back into the container
    elements.forEach(e => container.appendChild(e))
  })



  //account leaderboard system

  function load() {
	const name = localStorage.getItem('playername');
	document.getElementById('name').value = name;
}

function playAsGuest() {
	const name = document.getElementById('name').value;
	if(!name) return alert('Please enter your name!');
	
	localStorage.setItem('playername', name);
	location.href = '/~/project/Space_Race/space_race'
}

// Using `async` so that we can wait for the server sign the player up
async function createAccount() {
	
	// Check to see if the player entered a name and password
	const username = document.getElementById('name').value;
	const password = document.getElementById('password').value;
	if(!username) return alert('Please enter a name!');
	if(!password) return alert('Please enter a password!');
	
	// Using `fetch` ask the server to sign the player up, using the Qoom API
	const path = '/~/Space_Race/signup';
	const method = 'POST';
	const headers = { 'Content-Type': 'application/json' }
	const body = JSON.stringify({ username, password });
	const redirect = 'error';
	
	try {
		await fetch(path, { method, headers, body, redirect });
		
		// Saving the name in local storage
		playername = username;
		localStorage.setItem('playername', playername);
		
		// Redirecting the player the game page
		location.href = '/~/Space_Race/space_race'
	} catch(ex) {
		// If `fetch` throws an exception, alert the player that the name they chose is already taken:
		alert('Name already taken, please choose another one.')
	}
}

async function login() {
	const username = document.getElementById('name').value;
	const password = document.getElementById('password').value;
	if(!username) return alert('Please enter a name!');
	if(!password) return alert('Please enter a password!');
	
	// Notice the path here, points to `login`
	const path = '/~/Space_Race/login';
	const method = 'POST';
	const headers = { 'Content-Type': 'application/json' }
	const body = JSON.stringify({ username, password });
	const redirect = 'error';
	
	try {
		const resp = await fetch(path, { method, headers, body, redirect });
		const ans = await resp.json();
		if(ans.error) return alert(ans.error);
		
		playername = username;
		localStorage.setItem('playername', playername);
		location.href = '/~/Space_Race/space_race'
	} catch(ex) {
		alert('Cannot log in, check your name and password')
	}
}

async function logout() {
	
	// Using `fetch` to logout.
	const path = '/~/Space_Race/logout';
	const method = 'POST';
	
	await fetch(path, { method })
	
	// Reloading the page
	location.reload();

}

// Using `async` so that we can wait for the server to record the score
async function sendScore(score) {
	// If the user is not logged in, exit the function so the score does not get saved
	if(!isLoggedIn) return;
	
	// Send the score and name to the  `/~/Space_Race/open/leaders` API
	const path = '/~/Space_Race/open/leaders';
	const method = 'POST';
	const headers = { 'Content-Type': 'application/json' }
	const name = playername;
	const body = JSON.stringify({ name, score });
	
	await fetch(path, { method, headers, body });
}

async function getLeaders() {

	// Call the `/~/Space_Race/open/leaders?all=true` to get all the leaders from the database
	const path = '/~/Space_Race/open/leaders?all=true';
	const method = 'GET'
	const resp = await fetch(path, { method });
	const leaders = await resp.json();
	 
	// Show `No Leaders` if there are not any yet
	const $leaders = document.getElementById('leaders');
	if(!leaders.length) {
		$leaders.innerHTML = 'No Leaders';
		return;
	}
	
	// Otherwise show the top ten leaders with valid scores, sorted with the highest on top
	$leaders.innerHTML = leaders
		.filter(leader => parseInt(leader.data.score) >= 0) 
		.sort((a, b) => parseInt(b.data.score) > parseInt(a.data.score) ? 1 : -1)
		.filter((leader, i) => i < 10)
		.map((leader, i) => `
			<div>${i + 1}. ${leader.data.name} ${leader.data.score}</div>
		`)
		.join('\n')
	
}

