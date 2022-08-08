

const AWS = require("aws-sdk");
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const { v1: uuidv1 } = require('uuid');

//  default options img is mandatory in response
const defaultOptions = () => {
    const fields = ["title","description"];
    return fields;
}


//  regex for og tags and image urls
const regex = () => {
    const patterns = { "og": /^og:[a-z]/, "img": /^https?:\/\/.+\.(jpg|jpeg|png|webp|avif|gif|svg)/ }
    return patterns;
}


//  scrapper function for og data     - returns all og params
const scrapeOgData = ($) => {
    console.log("scrapeOgData");

    let ogObject = {};
    $('meta').each((index, meta) => {
        if (!meta.attribs || (!meta.attribs.property && !meta.attribs.name)) return;

        const property = meta.attribs.property || meta.attribs.name;
        const content = meta.attribs.content || meta.attribs.value;
        const ogRegex = regex().og;
        if(ogRegex.test(property)) {
            ogObject[property] = content;
        }
    });

    console.log("ogObject", ogObject, typeof(ogObject))  
    return ogObject;

}


//  scrapper function for regular data  - returns title description img data as default
const scrapeRegData = ($, options) => {
    console.log("scrapeRegData");

    let regData = {}
    if(options == null) options = defaultOptions();

    const imageObjects = $('img');
    const images = [];
    options.forEach(option => {
        console.log(option);
        regData[option] = $(option).text();

    });

    imageObjects.each((index, element) => {
        let image = $(element).attr('src');
        const imgRegex = regex().img;
        const url = "https:" + String(image).replace("https:","");
        
        if(imgRegex.test(url)) images.push(url);
    });

    const res = { ...regData, images: images};
    console.log("res", res, typeof(res))   
    return res;
}



// queries table using gsi - url -returns data
const query = async key => {
    console.log("query");
  const params = { 
    TableName: process.env.SCRAPE_DATA,
    IndexName: process.env.URL_INDEX,
    KeyConditionExpression: '#u = :u',
    ExpressionAttributeValues: { ':u': key
    },
    ExpressionAttributeNames: { "#u": "url" } 
   };

    try {
    const data = await dynamoDb.query(params).promise();
    if(data.Items.length == 0) {
        return data.Items;
    } else {
        return data.Items;
    }

    } catch (e) {
    console.log(e)
    return {
        statusCode: 500
    };
    }
};



//  creates new scrape data in database
const create = async (data,url) => {
    console.log("create");
    try {
        console.log(data)
        const id = uuidv1();
        const TableName = process.env.SCRAPE_DATA;
        const params = {
        TableName,
        Item: {
            id,
            url,
            data
            },
        ConditionExpression: "attribute_not_exists(id)"         
        };

        await dynamoDb.put(params).promise();

        return { dataStatus: 'data saved in database' };
    } catch (e) {
      console.log(e);
      return { dataStatus: 'failed to save in database' };
    }
  };

module.exports = {defaultOptions, regex, scrapeOgData, scrapeRegData, query, create};