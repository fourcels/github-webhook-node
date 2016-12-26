var http = require('http')
var path = require('path')
var fs   = require('fs')

if (!fs.existsSync('./config.json')) {
  console.log('Please create a config.json');
  return;
}

var { exec } = require('child_process')
var createHandler = require('github-webhook-handler')
var config  = require('./config.json')
var handler = createHandler(config)

http.createServer(function (req, res) {
  handler(req, res, function (err) {
    res.statusCode = 404
    res.end('no such location')
  })
}).listen(7777)
console.log('listen server on 7777');

handler.on('error', function (err) {
  console.error('Error:', err.message)
})

handler.on('push', function (event) {
  console.log('Received a push event for %s to %s',
    event.payload.repository.name,
    event.payload.ref)

  var script =  `scripts/${event.payload.repository.name}`
  if (fs.existsSync(script)) {
    exec(`sh ${script}`, (err, stdout, stderr) => {
      if (err) {
        throw err;
      }
      console.log(stdout);
      console.log(stderr);
    })
  }

})

handler.on('issues', function (event) {
  console.log('Received an issue event for %s action=%s: #%d %s',
    event.payload.repository.name,
    event.payload.action,
    event.payload.issue.number,
    event.payload.issue.title)
})
