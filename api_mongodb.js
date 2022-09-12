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
            //items = await database.collection("postalcodes").find({}).project({"_id":0,"postcode":1}).toArray()
            items = await database.collection("postalcodes").find({"status":{"$exists":false}}).toArray()
            //console.log(items)
            var post_codes = lodash.map(items, 'postcode')
            console.log(post_codes)
            for (let i of post_codes) {
                let URL = `https://api.postcodes.io/postcodes/${i}`;
                //console.log(URL)
                await axios.get(URL)
                    .then(async function (response) {
                        console.log("response.status:",response.status)
                        //console.log(response.data)
                        // process.exit()
                        if (response.status === 200) {

                            let value = response.data
                            //console.log(s)
                            let locationinfo = {}
                            locationinfo['state'] = await isValidField(value.result.admin_country)
                            locationinfo['country'] = await isValidField(value.result.country)
                            locationinfo['ZipCode'] = await isValidField(value.result.postcode)
                            locationinfo['StageAbbr'] = await isValidField(value.result.outcode)
                            locationinfo['CountryAbbr'] = await isValidField(value.result.country)
                            locationinfo['latitude'] = await isValidField(value.result.latitude)
                            locationinfo['longitude'] = await isValidField(value.result.longitude)
                            //console.log(state,country,ZipCode,StageAbbr,CountryAbbr,latitude,longitude)
                            var myquery = { postcode: i };
                            var newvalues = { $set: { Location: locationinfo, status: 200 } }
                            await database.collection("postalcodes").updateOne(myquery, newvalues)
                            console.log("updated")

                        }
                        else {
                            var myquery = { postcode: i };
                            await database.collection("postalcodes").updateOne(myquery,{"$set": { status: 404 }})
                        }

                    })
                    .catch(async function (error) {
                        console.log("Inside of catch block")
                        // handle error
                        var myquery = { postcode: i };
                        await database.collection("postalcodes").updateOne(myquery,{"$set": { status: 404 }})
                        console.log(error);
                    })
                    .then(function () {
                        // always executed
                    });
                }
            }
        else {
            console.log("error while connecting to db")
        }
    }
    catch (e) {
        console.log(e)
    }
})();
