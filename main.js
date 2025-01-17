const API_BASE_URL = "https://jse-assignment.uk/UKGeneral";
const API_KEY = "0cb064e3487398bf016ceb719e865ad8c229d25575bb3bab";

// Select elements
const constituencySelect = document.getElementById('constituency-select');
const resultsContainer = document.getElementById('results-container');
const constituencyNameEl = document.getElementById('constituency-name');
const winningCandidateEl = document.getElementById('winning-candidate');
const winningPartyEl = document.getElementById('winning-party');
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

// Fetch results for a selected constituency
async function fetchConstituencyResults(gssId) {
  try {
    const response = await fetch(`${API_BASE_URL}/results/${gssId}`, {
      headers: { "x-api-key": API_KEY },
    });
    const results = await response.json();

    displayResults(results);
  } catch (error) {
    console.error("Error fetching constituency results:", error);
    alert("Failed to load constituency results.");
  }
}

// Display results in the table and chart
function displayResults(data) {
  const { name, winningCandidate, winningParty, results } = data;

  constituencyNameEl.textContent = name;
  winningCandidateEl.textContent = winningCandidate;
  winningPartyEl.textContent = winningParty;

  // Update the table
  resultsTableBody.innerHTML = '';
  results.forEach(({ party, votes, percentage }) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${party}</td>
      <td>${votes}</td>
      <td>${percentage}%</td>
    `;
    resultsTableBody.appendChild(row);
  });

  // Update the chart
  const parties = results.map(r => r.party);
  const votes = results.map(r => r.votes);
  if (resultsChart) {
    resultsChart.destroy();
  }
  resultsChart = new Chart(resultsChartEl, {
    type: 'bar',
    data: {
      labels: parties,
      datasets: [
        {
          label: 'Votes',
          data: votes,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
    },
  });

  resultsContainer.classList.remove('hidden');
}

// Event listener for constituency selection
constituencySelect.addEventListener('change', (e) => {
  const gssId = e.target.value;
  if (gssId) {
    fetchConstituencyResults(gssId);
  } else {
    resultsContainer.classList.add('hidden');
  }
});

// Initialize the app
fetchConstituencies();
