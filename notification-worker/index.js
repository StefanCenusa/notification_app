var mongoose = require('mongoose');
var Twitter = require('twitter');
var async = require('async');
var express = require('express');
var cors = require('cors');


var tweetSchema = mongoose.Schema({
    name: String,
    text: String,
    tweet_id: String,
    created_at: {type: Date, default: Date.now()}
});

var Tweet = mongoose.model('Tweet', tweetSchema);

var twitterUser = new Twitter({
    consumer_key: "V7UPCoR6CoQ7XAF9jPWQrApZC",
    consumer_secret: "lmWJdhPZu068nQy9XX7DyDB7Hz6ltyCnKPVFhnknu6juNwp2he",
    access_token_key: "318976549-xEpaf4Bgan330lPSk6gzNgT2GT8FUkXF8tzMlBJR",
    access_token_secret: "8wbtC4tziZ3zsTCRHMzvTQpFny0LRC7fRCXlBx7qBY8nN"
});

var app = express();
app.use(cors());
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var client_sockets = [];

async.waterfall([
    function (cb) {
        mongoose.connect('mongodb://notifications-mongo-01:.tBxUC51SZYQ3XfOsrYMi5TQE.JETxYd2nFvqqwOGtY-@ds028799.mlab.com:28799/notifications-mongo-01');

        var db = mongoose.connection;
        db.on('error', console.error.bind(console, 'Error connecting to MongoDB'));
        db.once('open', function callback() {
            console.log('MongoDB connection open');
            cb();
        });
    },
    function (cb) {
        twitterUser.stream('statuses/filter', {track: 'nodejs'}, function (stream) {
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

                client_sockets.forEach(function(socket){
                    socket.emit('new_tweet', tweet);
                });
            });
        });

        server.listen(3000, function () {
            console.log('Server started');
            cb();
        });
    }
], function () {
    console.log("Waiting for client");
    io.on('connection', function (socket) {
        client_sockets.push(socket);
        console.log("Client connected");

        socket.on('disconnect', function() {
            console.log('Got disconnect!');

            var i = client_sockets.indexOf(socket);
            client_sockets.splice(i, 1);
        });
    });
});






