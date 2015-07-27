var express = require('express');
var app = express();
app.use(express.bodyParser());
var nohm = require('nohm').Nohm;

if (process.env.REDISTOGO_URL) {
  // inside if statement
  var rtg   = require("url").parse(process.env.REDISTOGO_URL);
  var redis = require("redis").createClient(rtg.port, rtg.hostname);

  redis.auth(rtg.auth.split(":")[1]);
} else {
  var redis = require("redis").createClient();
}

nohm.setClient(redis);

var port = process.env.PORT || 3000;
//the actual seerver would have 
// the decription of the stream seperated
// a stream then can have multiple links
//but we are  just creating a throw away sample now
var StreamLink = nohm.model('StreamLink', {
    properties: {
	name: {
        type: 'string',
    },
    url: {
        type: 'string',
    },
    streamType:{
        type:'string',
    },
    genre:{
        type:'string',
    },
    country: {
        type: 'string',
    },
    city: {
	   type: 'string',
	}
  }
});

var listSreamLinks = function (req, res) {
    StreamLink.find(function (err, ids) {
    var streamLinks = [];
    var len = ids.length;
    var count = 0;
    if(ids.length === 0) {
      res.send([]);

    } else {
      ids.forEach(function (id) {
        var streamLink = new StreamLink();
        streamLink.load(id, function (err, props) {
          streamLinks.push({id: this.id, url: props.url, streamType: props.streamType, genre: props.genre,genre: props.country,city:props.city,lastUpdated:props.lastUpdated});
          if (++count === len) {
            res.send(streamLinks);
          }
        });
      });
    }
  });
}

var streamLinkDetails = function (req, res) {
  StreamLink.load(req.params.id, function (err, properties) {
    if(err) {
      res.send(404);
    } else {
      res.send(properties);
    }
  });
};

var deleteStreamLink = function (req, res) {
  var user = new StreamLink();
  user.id = req.params.id;
  user.remove(function (err) {
    res.send(204);
  });
}

var createStreamLink()= function (req, res) {
  var user = new StreamLink();
  user.p(req.body);
  user.save(function (err) {
    res.send(user.allProperties(true));
  });
}

var updateStreamLink = function (req, res) {
  var user = new StreamLink();
  user.id = req.params.id;
  user.p(req.body);
  user.save(function (err) {
    res.send(user.allProperties(true));
  });
}
app.all('*', function(req, res, next){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Content-Type", "application/json");
  next();
});
app.get('/users', listUsers);
app.get('/users/:id', userDetails);
app.del('/users/:id', deleteUser);
app.post('/users', createUser);
app.put('/users/:id', updateUser);

app.listen(port);
