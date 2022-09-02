window.global = window;
const {Server, Client} = require('mock-socket.io');

const io = new Server();
let sock = null;

function onHandler(request, cb) {
  cb(getResponse(request));
}

io.on('connect', socket => {
  const methods = [
    'get',
    'post',
    'put',
    'delete',
    'head',
    'patch',
    'options'
  ];
  sock = socket;
  sock.on('emit', data => {
    socket.emit('emission-response', data);
  });
  sock.on('ping', (pong, cb) => {
    cb({pong})
  });
  for (const method of methods) {
    socket.on(method, onHandler);
  }
});

function getResponse(request) {
  const {method, data, params, url} = request;
  switch (url) {
    case 'success':
      return {statusCode: 200, body: {method, data: data || params}};
    case 'error':
      return {statusCode: 500, body: 'ERROR'};
    case 'json-error':
      return '{json: err}';
    case 'empty':
      return {};
    default:
      return {statusCode: 404};
  }
}

function getSocket() {
  return sock;
}

exports.getSocket = getSocket;
exports.MockClient = Client;
exports.MockServer = io;
