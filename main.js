const API_BASE_URL = "https://jse-assignment.uk/UKGeneral";
const API_KEY = "0cb064e3487398bf016ceb719e865ad8c229d25575bb3bab";

// Select elements
const constituencySelect = document.getElementById('constituency-select');
const resultsContainer = document.getElementById('results-container');
const constituencyNameEl = document.getElementById('constituency-name');
const winningCandidateEl = document.getElementById('winning-candidate');
const winningPartyEl = document.getElementById('winning-party');
const turnoutEl = document.getElementById('turnout');
const resultsTableBody = document.getElementById('results-table-body');
const resultsChartEl = document.getElementById('results-chart');
let resultsChart;

// Fetch constituencies and populate the dropdown
async function fetchConstituencies() {
  try {
    const response = await fetch(`${API_BASE_URL}/constituencies`, {
      headers: { "x-api-key": API_KEY },
    });
    const constituencies = await response.json();
    constituencySelect.innerHTML = '<option value="">Select Constituency</option>';
    constituencies.forEach(({ gssId, name }) => {
      const option = document.createElement('option');
      option.value = gssId;
      option.textContent = name;
      constituencySelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error fetching constituencies:", error);
    alert("Failed to load constituencies.");
  }
}

async function fetchConstituencyResults(gssId) {
  try {
    const response = await fetch(`${API_BASE_URL}/results/${gssId}`, {
      headers: { "x-api-key": API_KEY },
    });
    const results = await response.json();
    console.log(results);
    displayResults(results);
  } catch (error) {
    console.error("Error fetching constituency results:", error);
    alert("Failed to load constituency results.");
  }
}


function displayResults(data) {
  const { name, winningCandidate, winningParty, results, turnout } = data;

  constituencyNameEl.textContent = name;
  winningCandidateEl.textContent = winningCandidate;
  winningPartyEl.textContent = winningParty;
  turnoutEl.textContent = turnout;

  resultsTableBody.innerHTML = '';
  results.forEach(({ partyName, votes, share }) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${partyName}</td>
      <td>${votes}</td>
      <td>${share}%</td>
    `;
    resultsTableBody.appendChild(row);
  });

  resultsContainer.classList.remove('hidden');
}

constituencySelect.addEventListener('change', (e) => {
  const gssId = e.target.value;
  if (gssId) {
    console.log(gssId);
    fetchConstituencyResults(gssId);
  } else {
    resultsContainer.classList.add('hidden');
  }
});


fetchConstituencies();
