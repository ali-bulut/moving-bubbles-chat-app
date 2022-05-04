const ColorHelper = require("../helpers/ColorHelper");

/**
 * This class will contain a set of functions that are related with socket operations
 */
class SocketService {
  /**
   * This helper function creates a list of events
   */
  static createEvents = (socket) => {
    // { "<some_connection_id>": { ... }, "<some_other_connection_id>": { ... } }
    const users = {};

    socket.on("connection", (connection) => {
      SocketService.createNewUserEvent(connection, users);

      SocketService.createDisconnectUserEvent(connection, users);

      SocketService.createMoveUserEvent(connection, users);

      SocketService.createNewMessageEvent(connection, users);
    });
  };

  static createNewUserEvent = (connection, users) => {
    connection.on("newUser", ({ username }) => {
      const userData = {
        id: connection.id, // socket connection unique id
        position: {
          x: 0, // 0 as initial
          y: 0, // 0 as initial
        },
        color: ColorHelper.randomizeColor(), // setting random color for newly connected user
        username,
      };

      users[connection.id] = userData;

      // to send userData to other connections(users) under 'newUser' event
      connection.broadcast.emit("newUser", userData);

      // to send list of active users to newly connected user
      connection.emit("activeUsers", users);
    });
  };

  static createDisconnectUserEvent = (connection, users) => {
    connection.on("disconnect", () => {
      // to send disconnected user data to other connections under 'disconnectUser' event
      connection.broadcast.emit("disconnectUser", users[connection.id]);

      // to remove disconnected user from users list
      delete users[connection.id];
    });
  };

  static createMoveUserEvent = (connection, users) => {
    connection.on("move", ({ x, y }) => {
      try {
        // updating x and y coordinates by using data coming from client
        users[connection.id].position.x = x;
        users[connection.id].position.y = y;

        // to send updated coordinate data to sender along with connection(user) id
        connection.emit("userMoved", {
          id: connection.id,
          x,
          y,
        });

        // to send updated coordinate data to other connections along with connection(user) id
        connection.broadcast.emit("userMoved", {
          id: connection.id,
          x,
          y,
        });
      } catch (err) {
        console.log(err);
      }
    });
  };

  static createNewMessageEvent = (connection, users) => {
    connection.on("newMessage", (message) => {
      // adding connection(user) id to message data
      const messageData = {
        id: connection.id,
        username: users[connection.id].username,
        ...message,
      };

      // sending new message data to all connections
      connection.emit("newMessage", messageData);
      connection.broadcast.emit("newMessage", messageData);
    });
  };
}

module.exports = SocketService;
