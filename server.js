const http = require('http');
const express = require('express');
const { urlencoded } = require('body-parser');
const fetch = require("node-fetch");
const request = require('request');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const app = express();
const accountSid = 'ACf096071737745ffbd1882f385055bad1';
const authToken = '90e9d5f5d15179310cc7943c9b482690';
const client = require('twilio')(accountSid, authToken);

app.use(urlencoded({ extended: false }));


app.post('/sms', (req, res) => {
  const twiml = new MessagingResponse();
  // Access the message body and the number it was sent from.
  console.log(`Incoming message from ${req.body.From}: ${req.body.Body}`);
  var reply = req.body.Body;
  var person = req.body.From;
  var locations = reply.split("-");
  var origin = locations[0];
  var destination = locations[1];
  var arrayOfInstr=[];
  var replyString = "";
  console.log(locations);
  if (locations.length == 1){
  	client.messages
  		.create({
     		body: "Welcome to Sender. Please send us your current address and where you would like to go as follows: Origin-Destination ie. 19 Apple Road, Toronto-14 Banana Road, Brantford",
     		from: '+16474964403',
     		to: person
   		})
  		.then(message => console.log(message.sid));

  } else {
  	request('https://maps.googleapis.com/maps/api/directions/json?origin=' + origin + '&destination=' + destination + '?traffic_model=pessimistic&key=AIzaSyBvr18lDqbAS_45otDdvg8krTlM2f2O1Rg', { json: true }, (err, res, body) => {
  		if (err) { 
  			return console.log(err);
  		}

  		var instructions = body.routes[0].legs[0].steps;

  		for (var i=0;i<instructions.length;i++){
  			var specificIntruction = (instructions[i].html_instructions);
  			specificIntruction = specificIntruction.replace(/<\/?[^>]+>/g, "");
  			arrayOfInstr.push(specificIntruction);
  		}

  		for (var y = 0; y<arrayOfInstr.length; y++){
  			replyString = replyString+"\n" + "\n" +arrayOfInstr[y];
  		}
  		console.log(replyString);

			client.messages
  				.create({
     				body: replyString+ "\n" + "\n" + "\n" + "Thanks for using Sender, we hope you have a safe trip!",
     				from: '+16474964403',
     				to: person
   				})
  				.then(message => console.log(message.sid));
	});
  }

  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
});



http.createServer(app).listen(1337, () => {
  console.log('Express server listening on port 1337');
});