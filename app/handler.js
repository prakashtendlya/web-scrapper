'use strict';
const cheerio = require("cheerio");
const axios = require("axios");
const helper = require("./service/helper");

// success response
const success = (body) =>  {
  return buildResponse(200, body);
}

// failure response
const failure = (statusCode, body) =>  {
  body = {message: body} 
  return buildResponse(statusCode, body);
}

// response builder
const buildResponse = (statusCode, body) =>  {
  return {
    statusCode: statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  };
}


/**
 * scrape handler
 * param event.body.url - mandatory - string
 * param event.body.options - optional - array of string {additional html tags}
 */
const scrape = async (event, context, callback) => {
  console.log(event)
  try {
    let options = null;

    const params = JSON.parse(event.body);

    if(event && event.body && (params.url == "" || params.url == undefined) ) return failure(400, "Bad Request");

    console.log(params.url)

    //  query to check if you url exist & send response
    const res = await helper.query(params.url);
    if(res.length != 0)  return success(res[0].data);

    if(params.options) options = params.options;
    
    const scrapedData = await axios.get(params.url).then(response => {


      const $ = cheerio.load(response.data)

      // scrape og: data
      const ogData = helper.scrapeOgData($);
      // scrape reg data
      const regData = helper.scrapeRegData($,options);
      
      return {...regData, ...ogData};
    }).catch(error => {
      error = JSON.stringify(error)
      console.log(error);
      //  Invalid Page/URL
      callback(null, failure(error.code || 400, error.status || "Invalid Page/URL"));
      
    });
    
    // persist data to dynamodb table
    const result = await helper.create(scrapedData,params.url);

    const payload = {...scrapedData, ...result};

    // success response
    callback(null, success(payload));

  } catch (error) {
    console.log(JSON.stringify(error))
    return failure(500, "Something went wrong!");
  }
  
};

module.exports = { success, failure, buildResponse, scrape}
