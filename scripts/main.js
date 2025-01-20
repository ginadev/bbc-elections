const API_BASE_URL = "https://jse-assignment.uk/UKGeneral";
const API_KEY = "0cb064e3487398bf016ceb719e865ad8c229d25575bb3bab";


const PARTY_COLOURS = new Map([
  ["LAB", "#E91E0D"],
  ["CON", "#0675C9"],
  ["LD", "#FF9A01"],
  ["SNP", "#FFD02C"],
  ["SF", "#24AA82"],
  ["IND", "#FC86C2"],
  ["REF", "#0DD1E0"],
  ["DUP", "#C9235E"],
  ["GRN", "#5FB25F"],
  ["PC", "#0FE594"],
  ["SDLP", "#224922"],
  ["APNI", "#D6B429"],
  ["UUP", "#3B75A8"],
  ["TUV", "#6DCAD2"],
  ["WPB", "#529ACC"],
  ["YP", "#00B8FD"],
  ["ALB", "#287599"],
  ["PBP", "#E8254F"],
  ["AONT", "#ECAE8E"],
  ["FALLBACK", "#BABABA"]
]);

const constituencySelect = document.getElementById('constituency-select');
const resultsContainer = document.getElementById('results-container');
const constituencyNameEl = document.getElementById('constituency-name');
const turnoutEl = document.getElementById('turnout');
const resultsTableBody = document.getElementById('results-table-body');
const resultsChartEl = document.getElementById('results-chart');
const constituencySearch = document.getElementById('constituency-search');
const regionSelect = document.getElementById('region-select');
let resultsChart;
let constituenciesList = [];
let regionData;


async function loadRegionJSON() {
  try {
    const response = await fetch('https://raw.githubusercontent.com/ginadev/bbc-elections/refs/heads/master/data/constituencyToRegion.json'); 
    regionData = await response.json();
  } catch (error) {
    console.error("Error loading JSON data:", error);
  }
}

async function populateRegionDropdown() {
  await loadRegionJSON(); 

  if (!regionData) return;
  const regions = [...new Set(regionData.map(item => item.Region))].sort();

  regionSelect.innerHTML = '<option value="">Select Region</option>';

  regions.forEach(region => {
    const option = document.createElement('option');
    option.value = region;
    option.textContent = region;
    regionSelect.appendChild(option);
  });
}



async function fetchConstituencies() {
    try {
      const response = await fetch(`${API_BASE_URL}/constituencies`, {
        headers: { "x-api-key": API_KEY },
      });
      const constituencies = await response.json();
  
      constituencySelect.innerHTML = '<option id="first-constituency" value="">Select Constituency</option>';
      constituencies.forEach(({ gssId, name }) => {
        const option = document.createElement('option');
        option.value = gssId;
        option.textContent = name;
        constituencySelect.appendChild(option);
      });
  
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
      listContainer.setAttribute('class', 'autocomplete-items absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg divide-y');
      this.parentNode.appendChild(listContainer);
  
      list
        .filter(({ name }) => name.toLowerCase().includes(val.toLowerCase()))
        .forEach(({ gssId, name }) => {
          const item = document.createElement('div');
          item.classList.add('cursor-pointer', 'hover:underline', 'p-2')
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
      constituencySelect.value = '';
      regionSelect.value = ''; 
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
    .map(({ partyCode, candidateName, partyName, votes, share }) => ({
      partyCode,
      partyName,
      candidateName,
      votes,
      share: Math.round(share), 
    }))
    .sort((a, b) => b.share - a.share); 

    const winner = sortedResults[0];
  
  resultsTableBody.innerHTML = '';
  sortedResults.forEach(({partyCode, candidateName, partyName, votes, share }) => {
    const row = document.createElement('tr');
    row.className = 'grid-item divide-x';
    if (partyName === winner.partyName && candidateName === winner.candidateName) {
      row.classList.add('font-bold'); 
    }
    row.innerHTML = `
      <td class="py-2">${partyName}</td>
      <td class="py-2">${candidateName || ''}</td>
      <td class="py-2">${votes}</td>
       <td class="py-2">
    <div class="flex items-center">
      <div class="relative w-full h-6 rounded overflow-hidden mr-2">
        <div 
          class="progress-bar absolute top-0 left-0 h-6 rounded" 
          style="width: 0%; background-color: ${PARTY_COLOURS.get(partyCode) || PARTY_COLOURS.get('FALLBACK')};"
          title="${share}%">
        </div>
      </div>
      <span class="text-xs">${share}%</span>
    </div>
  </td>
    `;
    resultsTableBody.appendChild(row);
    setTimeout(() => {
      const progressBar = row.querySelector('.progress-bar');
      progressBar.style.transition = 'width 2s ease';
      progressBar.style.width = `${share}%`;
    }, 10);
  });
  resultsContainer.classList.remove('hidden');
  resultsContainer.style.transition = 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out';
  resultsContainer.style.opacity = '0';
  resultsContainer.style.transform = 'scale(0.9)';

  setTimeout(() => {
    resultsContainer.style.opacity = '1';
    resultsContainer.style.transform = 'scale(1)';
  }, 100);
  
}

constituencySelect.addEventListener('change', (e) => {
  resetContainer();
  constituencySearch.value = ''; 
  const gssId = e.target.value;
  if (gssId) {
    fetchConstituencyResults(gssId);
  } else {
    resultsContainer.classList.add('hidden');
  }
});

function filterConstituencies(selectElement) {
  constituencySearch.value = '';
  constituencySelect.value = '';
  
  const selectedRegion = selectElement.value;
  const constituencies = constituencySelect.querySelectorAll('option');
  const firstConstituency = document.getElementById('first-constituency');
  if (firstConstituency) {
    firstConstituency.textContent = `${selectedRegion} Constituencies`;
    firstConstituency.value = ''; // Ensure it doesn't act as a selectable value
  }

  constituencies.forEach(option => {
    const constituencyName = option.textContent;
    const isInRegion = regionData.some(item => item.Constituency === constituencyName && item.Region === selectedRegion);
    if (!isInRegion) {
      option.classList.add('hidden');
    } else {
      option.classList.remove('hidden');
    }
  });
}

function resetContainer(){
  resultsContainer.classList.add('hidden');
  resultsContainer.style.opacity = '0';
  resultsContainer.style.transform = 'scale(0.9)';
}

function clearResults(){
  regionSelect.value='';
  constituencySelect.value = '';
  constituencySearch.value = '';
  resetContainer();
  const constituencies = constituencySelect.querySelectorAll('option');
  constituencies.forEach(option => {
    option.classList.remove('hidden'); 
  });
}

populateRegionDropdown();
fetchConstituencies().then(() => autocomplete(constituencySearch, constituenciesList));
