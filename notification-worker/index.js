var mongoose = require('mongoose');
var Twitter = require('twitter');

var http = require('http');

mongoose.connect('mongodb://notifications-mongo-01:.tBxUC51SZYQ3XfOsrYMi5TQE.JETxYd2nFvqqwOGtY-@ds028799.mlab.com:28799/notifications-mongo-01');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error connecting to MongoDB'));
db.once('open', function callback() {
    console.log('MongoDB connection open');
});

var tweetSchema = mongoose.Schema({
    name: String,
    text: String,
    tweet_id: String,
    created_at: {type: Date, default: Date.now()}
});

var Tweet = mongoose.model('Tweet', tweetSchema);

var twitter = new Twitter({
    consumer_key: "V7UPCoR6CoQ7XAF9jPWQrApZC",
    consumer_secret: "lmWJdhPZu068nQy9XX7DyDB7Hz6ltyCnKPVFhnknu6juNwp2he",
    access_token_key: "318976549-xEpaf4Bgan330lPSk6gzNgT2GT8FUkXF8tzMlBJR",
    access_token_secret: "8wbtC4tziZ3zsTCRHMzvTQpFny0LRC7fRCXlBx7qBY8nN"
});


twitter.stream('statuses/filter', {track: 'nodejs'}, function (stream) {
    stream.on('data', function (data) {

        var screen_name = data.user ? data.user.screen_name : "Unknown";
        console.log(data.id + ": " + screen_name + ": " + data.text);

        var tweet = new Tweet({
            name: screen_name,
            text: data.text,
            tweet_id: data.id
        });
        tweet.save(function (err, tweet) {
            if (err) {
                console.log(err);
            } else {
                console.log("Tweet saved!");
            }
        });
    });
});
