const axios = require('axios');
const lodash = require('lodash');
const { isValidField } = require('./helper');
const { getMongoConnection } = require('./connect');
var url = "mongodb://localhost:27017/";
// set url as constant
(async () => {
    const mongoconn = await getMongoConnection(url);
    const { connStatus, client } = mongoconn;
    const database = client.db("alljobs");
    try {
        if (connStatus) {
            console.log('DATABASE CONNECTION SUCCESSFULL');
            var options = {
                allowDiskUse: false
            };
            
            var pipeline = [
                {
                    "$project": {
                        "coordinates": {
                            "$concat": [
                                "$latitude",
                                " , ",
                                "$longitude"
                            ]
                        },
                        "LocationInfo": "$Location"
                    }
                }, 
                {
                    "$out": {
                        "db": "alljobs",
                        "coll": "aggregate_postalcodes"
                    }
                }
            ];
            

            await database.collection("postalcodes").aggregate(pipeline, options).toArray;
            
                  
        }
        else {
            console.log("error while connecting to db")
        }
    }
    catch (e) {
        console.log(e)
    }
})();
