const Twitter = require('twitter');
require('dotenv').config();

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const schedule = require('node-schedule');

const client = new Twitter({
    consumer_key: process.env.consumerKey,
    consumer_secret: process.env.consumerSecret,
    access_token_key: process.env.accessTokenKey,
    access_token_secret: process.env.accessTokenSecret
});

const job = schedule.scheduleJob("0 30 13 * * *", function start(){ run(); });

async function run() {
    const events = await fetch(`https://byabbe.se/on-this-day/12/30/events.json`).then(data => data.json());

    var eventNo = Math.floor(Math.random() * events.events.length);
    while (events.events[eventNo].length >= 245) { var eventNo = Math.floor(Math.random() * events.events.length); }

    function post(callback){
        var message = `#OnThisDay ${events.date}, ${events.events[eventNo].year}: ${events.events[eventNo].description}`;

        client.post('statuses/update', { status: message, stringify_ids: true }, (err, tweet, res) => {
            if (err) return console.error(err);
            callback(tweet.id_str);
        });
    }
    
    post((lastTweetId) => {
        console.log(lastTweetId);
        var message = `📖 Read More: ${events.events[eventNo].wikipedia[0].wikipedia}`;
        client.post('statuses/update', { status: message, in_reply_to_status_id: lastTweetId }, (err, tweet, res) => {
            if (err) return console.error(err);
        });
        
    });
    
    function buildTweet(message, first){
        return `${first ? `` : ``} ${message}`;
    }
};