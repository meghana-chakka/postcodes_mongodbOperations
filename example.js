const axios = require('axios');
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
            const arr = ['AB11 5QN', 'AB10 6RN']
            for (let i of arr) {
                let URL = `https://api.postcodes.io/postcodes/${i}`;
                axios.get(URL)
                    .then(async function (response) {
                        if (response.status === 200) {
                            let value = response.data
                            //console.log(s)
                            locationinfo = {}
                            locationinfo['state'] = await isValidField(value.result.admin_country)
                            locationinfo['country'] = await isValidField(value.result.country)
                            locationinfo['ZipCode'] = await isValidField(value.result.postcode)
                            locationinfo['StageAbbr'] = await isValidField(value.result.outcode)
                            locationinfo['CountryAbbr'] = await isValidField(value.result.country)
                            locationinfo['latitude'] = await isValidField(value.result.latitude)
                            locationinfo['longitude'] = await isValidField(value.result.longitude)
                            //console.log(state,country,ZipCode,StageAbbr,CountryAbbr,latitude,longitude)
                            var myquery = { postcode: i };
                            var newvalues = { $set: { Location: locationinfo } }


                            await database.collection("postalcodes").updateOne(myquery, newvalues)

                        }


                    })
                    .catch(function (error) {
                        // handle error
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
