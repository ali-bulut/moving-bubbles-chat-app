import { useEffect, useState } from "react";
import socketIO from "socket.io-client";

const socket = socketIO(process.env.REACT_APP_SOCKET_URL);

function App() {
  const [users, setUsers] = useState({});
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const username = window.prompt("Please enter your name", "");
    socket.emit("newUser", { username });
  }, []);

  socket.on("activeUsers", (data) => {
    setUsers({ ...data });
  });

  socket.on("newUser", (user) => {
    // saving new user to state
    const allUsers = { ...users };
    allUsers[user.id] = { ...user };
    setUsers({ ...allUsers });

    // creating a message state
    const messageData = {
      type: {
        code: 0, // 0 => info - messages that created by system, 1 => user messages
        message: 1, // 1 => joined, 2 => left
      },
      username: user.username,
    };

    // saving new message to state
    const allMessages = [...messages];
    allMessages.push(messageData);
    setMessages([...allMessages]);
  });

  socket.on("disconnectUser", (data) => {
    const messageData = {
      type: {
        code: 0,
        message: 0,
      },
      username: data.username,
    };

    const allMessages = [...messages];
    allMessages.push(messageData);
    setMessages([...allMessages]);

    const allUsers = { ...users };
    delete allUsers[data.id];

    setUsers({ ...allUsers });
  });

  // console.log({ messages, users });

  return (
    <div>
      <h1>Users</h1>
      {Object.values(users).map((user) => (
        <p>{user.username}</p>
      ))}
      <br /> <br />
      <h1>Messages</h1>
      {messages.map((message) => (
        <p>
          {message.type.code === 0 &&
            (message.type.message === 1
              ? `${message.username} has joined the chat!`
              : `${message.username} has left from the chat!`)}
        </p>
      ))}
    </div>
  );
}

export default App;
