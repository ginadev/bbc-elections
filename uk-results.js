const { createApp } = Vue;

createApp({
  data() {
    return {
      results: [],
      loading: true, 
      error: null, 
    };
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
        console.log(data);
        this.results = data.results
          .filter((item) => item.seats > 0)
          .map((item) => ({
            partyName: item.partyName || 'Unknown',
            seats: item.seats || 0,
            votes: item.votes || 0,
            share: item.share || 0,
          }))
          .sort((a, b) => b.share - a.share);
        this.loading = false;
      })
      .catch((error) => {
        this.error = error.message;
        this.loading = false;
      });
  },
}).mount('#uk-results');
