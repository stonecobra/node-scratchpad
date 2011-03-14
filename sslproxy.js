//simple ssl proxy that copies the request over to the http server.

//our 'imports', for you java fans out there
var connect = require('connect')
    ,fs = require('fs')
    ,http = require('http')
    ,https = require('https');

//the certs that need to be given to the ssl side, ca is optional
var ssl_options = {
  ca:   fs.readFileSync(__dirname + '/lib/certs/ssl.ca')
 ,key:  fs.readFileSync(__dirname + '/lib/certs/ssl.key')
 ,cert: fs.readFileSync(__dirname + '/lib/certs/ssl.cert')
};

//create a standard http server, serving static files
var server = connect.createServer(

  connect.logger() 

  //just create a 'www' directory containing an index.html for the default to work
  ,connect.static(__dirname + '/www') //staticProvider for older versions of connect

 ).listen(80);


//send and receive the same info, just on SSL
var ssl = https.createServer(ssl_options, function(request, response) {

  var proxy = http.createClient(80, request.headers['host']);

  var proxy_request = proxy.request(request.method, request.url, request.headers);

  proxy_request.addListener('response', function (proxy_response) {
      proxy_response.addListener('data', function(chunk) {
        response.write(chunk, 'binary');
  });

  proxy_response.addListener('end', function() {
        response.end();
      });
    response.writeHead(proxy_response.statusCode, proxy_response.headers);
  });

  request.addListener('data', function(chunk) {
      proxy_request.write(chunk, 'binary');
  });

  request.addListener('end', function() {
      proxy_request.end();
  });

 }).listen(443);
