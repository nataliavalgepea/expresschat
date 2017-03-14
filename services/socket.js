var connectedClients = [];

// Store socketId in the list of connected clients
exports.registerClient = function (socketId) {
    var client = this.getClientBySocketId(socketId);
    if (!client) {
        connectedClients.push({socket: socketId, userId: null});
    }
};

// Find the client by socketId and remove it from the list of connected clients
exports.deRegisterClient = function (socketId) {
    for (var i = 0, len = connectedClients.length; i < len; ++i) {
        var c = connectedClients[i];
        
        if (c.socket == socketId) {
            connectedClients.splice(i, 1);
            break;
        }
    }
};

// Assign userId to its socket
exports.associateUserWithClient = function (socketId, userId) {
    var client =  this.getClientBySocketId(socketId);
    client.userId = userId;
};

// Find the client by its socketId
exports.getClientBySocketId = function (socketId) {
    return connectedClients.filter(function (i) {
        return i.socket == socketId;
    })[0];
};

// Find the client by its userId
exports.getClientByUserId = function (userId) {
  return connectedClients.filter(function (i) {
      return i.userId == userId;
  })[0];
};