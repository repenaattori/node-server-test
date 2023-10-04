const { default: axios } = require('axios');

require('dotenv').config();

test();
function test(){
    axios.get( 'https://api.themoviedb.org/3/movie/popular?page=1', {params:{api_key: process.env.MOVIE_API_KEY}} )
        .then(resp => console.log(resp.data.results[0].overview))
        .catch(error=> console.log(error.message))
}