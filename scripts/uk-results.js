const { createApp } = Vue;

const UK_PARTY_COLOURS = {
  "LAB": { background: "#E91E0D", text: "#FFFFFF", lightBackground : "#FAABA5" },
  "CON": { background: "#0675C9", text: "#FFFFFF", lightBackground : "#A6C8EA" },
  "LD": { background: "#FF9A01", text: "#000000", lightBackground : "#FFD7AA" },
  "SNP": { background: "#FFD02C", text: "#000000", lightBackground : "#FFECB3" },
  "SF": { background: "#24AA82", text: "#000000", lightBackground : "#B1DDCD" },
  "IND": { background: "#FC86C2", text: "#000000"},
  "REF": { background: "#0DD1E0", text: "#000000" },
  "DUP": { background: "#C9235E", text: "#000000" },
  "GRN": { background: "#5FB25F", text: "#000000", lightBackground : "#95b895" },
  "PC": { background: "#0FE594", text: "#000000", lightBackground : "#a1f7d6" },
  "SDLP": { background: "#224922", text: "#000000" },
  "APNI": { background: "#D6B429", text: "#000000" },
  "UUP": { background: "#3B75A8", text: "#000000" },
  "TUV": { background: "#6DCAD2", text: "#000000" },
  "WPB": { background: "#529ACC", text: "#000000" },
  "YP": { background: "#00B8FD", text: "#000000" },
  "ALB": { background: "#287599", text: "#000000" },
  "PBP": { background: "#E8254F", text: "#000000" },
  "AONT": { background: "#ECAE8E", text: "#000000" },
  "FALLBACK": { background: "#BABABA", text: "#000000", lightBackground : "#e8e6e6" }
};

const highchartsApp = createApp({
  data() {
    return {
      results: [],
      loading: true,
      error: null,
    };
  },
  computed: {
    getPartyColour() {
      return (partyCode) => UK_PARTY_COLOURS[partyCode]?.background || UK_PARTY_COLOURS["FALLBACK"].background;
    },
  },
  methods: {
    renderChart() {
      Highcharts.chart('uk-highcharts', {
        chart: { 
          type: 'column',
          
        },
        title: { 
          text: '' 
        },
        xAxis: { 
          categories: this.results.map(item => item.partyName),
          visible: false,
          startOnTick: false,
          endOnTick: false,
          minPadding: 0, 
          maxPadding: 0, 
        },
        yAxis: { 
          title: { text: '' }, 
          labels: { enabled: false }, 
          gridLineWidth: 0, 
          visible: false, 
        },
        legend: { 
          enabled: false 
        },
        plotOptions: {
          column: {
            borderWidth: 0,
            pointPadding: 0, 
            groupPadding: 0,
        
          }
        },
        tooltip: {
          backgroundColor: '#ffffff',
          borderColor: '#000000', 
          borderRadius: 5, 
          borderWidth: 0, 
          shadow: false, 
          style: {
            color: '#333333', 
            fontSize: '13px', 
          }
        },
        series: [{
          name: 'Seats',
          data: this.results.map(item => item.seats),
          colorByPoint: true,
          colors: this.results.map(item => this.getPartyColour(item.partyCode)),
        }],
        credits: {
          enabled: false 
        },
      });
    },
    
  },
  mounted() {
    fetch('https://jse-assignment.uk/UKGeneral/results/', {
      headers: { 'x-api-key': '0cb064e3487398bf016ceb719e865ad8c229d25575bb3bab',},
    })
      .then(response => response.ok ? response.json() : Promise.reject('Failed to fetch'))
      .then(data => {
        this.results = data.results
          .filter(item => item.seats > 0)
          .map(item => ({ partyCode: item.partyCode || 'Unknown', partyName: item.partyName || 'Unknown', seats: item.seats || 0 }))
          .sort((a, b) => b.seats - a.seats);
        this.loading = false;
        this.renderChart();
      })
      .catch(error => {
        this.error = error;
        this.loading = false;
      });
  },
}).mount('#uk-highcharts');

const resultsTableApp = createApp({
  data() {
    return {
      results: [],
      loading: true, 
      error: null, 
      hasLoaded: false,
    };
  },
  computed: {
    getPartyColour() {
      return (partyCode) => {
        const colours = UK_PARTY_COLOURS[partyCode] || UK_PARTY_COLOURS["FALLBACK"];
        return colours;
      };
    }
  },
  mounted() {
    fetch('https://jse-assignment.uk/UKGeneral/results/', {
      headers: {
        'x-api-key': '0cb064e3487398bf016ceb719e865ad8c229d25575bb3bab',
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch UK election results.');
        }
        return response.json();
      })
      .then((data) => {
        this.results = data.results
          .filter((item) => item.seats > 0)
          .map((item) => ({
            partyCode: item.partyCode || 'Unknown',
            seats: item.seats || 0,
          }))
          .sort((a, b) => b.seats - a.seats);
        this.loading = false;
        setTimeout(() => {
          this.hasLoaded = true;
        }, 400); 
      })
      .catch((error) => {
        this.error = error.message;
        this.loading = false;
      });
  }
}).mount('#uk-results');
