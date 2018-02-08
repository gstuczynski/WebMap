const knex = require('knex');
const express = require('express');
const app = express();
var path = require('path');
app.use(express.static(path.join(__dirname, 'public')));


const db = knex({
  dialect: 'postgres',
  connection: {
    host : '127.0.0.1',
    user : 'docker',
    password : 'docker',
    database : 'gis'  }
});

app.get('/data', (req, res) => {
    db.select(knex.raw('ST_AsGeoJSON(??) AS geom', ['test.geom']))
        .from('test')
        .asCallback(function(err, rows) {
            if (err) {
                res.send(JSON.stringify({'error': err}));
            } else {
                res.send(postGISQueryToFeatureCollection(rows)[0]);
            }
        });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/static/index.html'));
});

var postGISQueryToFeatureCollection = function(queryResult) {    
    var i = 0,
        length = queryResult.length,
        prop = null,
        geojson = [] 
        console.log(length)
  
    for(i = 0; i < length; i++) { 
      var feature = {
        "type": "Feature",
        "geometry": JSON.parse(queryResult[i].geom)
      };
      for(prop in queryResult[i]) {
        if (prop !== "geom" && queryResult[i].hasOwnProperty(prop)) {
          feature[prop] = queryResult[i][prop];
        }
      }
      geojson.push(feature);
    }
    return geojson;
  }

app.listen(3000);
