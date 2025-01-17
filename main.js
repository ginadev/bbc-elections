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
const constituencySearch = document.getElementById('constituency-search');
let resultsChart;
let constituenciesList = [];

async function fetchConstituencies() {
    try {
      const response = await fetch(`${API_BASE_URL}/constituencies`, {
        headers: { "x-api-key": API_KEY },
      });
      const constituencies = await response.json();
  
      // Populate dropdown menu
      constituencySelect.innerHTML = '<option value="">Select Constituency</option>';
      constituencies.forEach(({ gssId, name }) => {
        const option = document.createElement('option');
        option.value = gssId;
        option.textContent = name;
        constituencySelect.appendChild(option);
      });
  
      // Save the list for autocomplete
      constituenciesList = constituencies.map(({ gssId, name }) => ({ gssId, name }));
  
    } catch (error) {
      console.error("Error fetching constituencies:", error);
      alert("Failed to load constituencies.");
    }
  }

  const autocomplete = (input, list) => {
    let currentFocus;
  
    input.addEventListener('input', function () {
      const val = this.value;
      closeAllLists();
      if (!val) return false;
  
      currentFocus = -1;
      const listContainer = document.createElement('div');
      listContainer.setAttribute('id', `${this.id}-autocomplete-list`);
      listContainer.setAttribute('class', 'autocomplete-items');
      this.parentNode.appendChild(listContainer);
  
      list
        .filter(({ name }) => name.toLowerCase().includes(val.toLowerCase()))
        .forEach(({ gssId, name }) => {
          const item = document.createElement('div');
          item.innerHTML = `<strong>${name.substr(0, val.length)}</strong>${name.substr(val.length)}`;
          item.dataset.gssId = gssId;
          item.innerHTML += `<input type="hidden" value="${name}">`;
  
          item.addEventListener('click', function () {
            input.value = name;
            closeAllLists();
            fetchConstituencyResults(gssId);
          });
  
          listContainer.appendChild(item);
        });
    });
  
    input.addEventListener('keydown', function (e) {
      const listItems = document.querySelectorAll(`#${this.id}-autocomplete-list div`);
      if (e.keyCode === 40) {
        currentFocus++;
        addActive(listItems);
      } else if (e.keyCode === 38) {
        currentFocus--;
        addActive(listItems);
      } else if (e.keyCode === 13) {
        e.preventDefault();
        if (currentFocus > -1) listItems[currentFocus].click();
      }
    });

    function addActive(items) {
        if (!items) return false;
        removeActive(items);
        if (currentFocus >= items.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = items.length - 1;
        items[currentFocus].classList.add('autocomplete-active');
      }
    
      function removeActive(items) {
        items.forEach((item) => item.classList.remove('autocomplete-active'));
      }
    
      function closeAllLists(elmnt) {
        const items = document.querySelectorAll('.autocomplete-items');
        items.forEach((item) => {
          if (elmnt !== item && elmnt !== input) item.remove();
        });
      }
    
      document.addEventListener('click', function (e) {
        closeAllLists(e.target);
      });
    };

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


function displayResults(data) {
  const { name, results, turnout } = data;

  constituencyNameEl.textContent = name;
  turnoutEl.textContent = turnout;

  const sortedResults = results
    .map(({ candidateName, partyName, votes, share }) => ({
      partyName,
      candidateName,
      votes,
      share: Math.round(share), 
    }))
    .sort((a, b) => b.share - a.share); 

    const winner = sortedResults[0];
  winningCandidateEl.textContent = winner.candidateName;
  winningPartyEl.textContent = winner.partyName;
  
  resultsTableBody.innerHTML = '';
  sortedResults.forEach(({candidateName, partyName, votes, share }) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${partyName}</td>
      <td>${candidateName || ''}</td>
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
    fetchConstituencyResults(gssId);
  } else {
    resultsContainer.classList.add('hidden');
  }
});


fetchConstituencies().then(() => autocomplete(constituencySearch, constituenciesList));
