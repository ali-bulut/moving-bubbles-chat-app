import { useEffect, useRef, useState } from "react";
import socketIO from "socket.io-client";

const socket = socketIO(process.env.REACT_APP_SOCKET_URL);

function App() {
  const [users, setUsers] = useState({});
  const [messages, setMessages] = useState([]);
  const [chatMessage, setChatMessage] = useState("");
  const [tempMessage, setTempMessage] = useState({});

  const fileRef = useRef();

  useEffect(() => {
    const username = window.prompt("Please enter your name", "");
    socket.emit("newUser", { username });
  }, []);

  useEffect(() => {
    fileRef.current.addEventListener(
      "change",
      function (e) {
        let data = e.target.files[0];
        const reader = new FileReader();
        reader.onload = function (event) {
          let img = {};
          img.file = event.target.result;
          img.fileName = data.name;

          const messageData = {
            image: img,
          };
          if (
            messages.filter((message) => message.image.fileName === data.name)
              .length <= 0
          ) {
            socket.emit("newImage", messageData);
          }
        };
        reader.readAsDataURL(data);
      },
      false
    );
  }, [fileRef, messages]);

  socket.on("activeUsers", (data) => {
    setUsers({ ...data });
  });

  socket.on("newImage", (imageData) => {
    if (
      messages.filter(
        (message) => message.image.fileName === imageData.image.fileName
      ).length <= 0
    ) {
      const allMessages = [...messages];
      allMessages.push(imageData);
      setMessages([...allMessages]);
    }
  });

  socket.on("newUser", (user) => {
    // saving new user to state
    const allUsers = { ...users };
    allUsers[user.id] = { ...user };
    setUsers({ ...allUsers });

    // creating a message state
    const messageData = {
      message: `${user.username} has joined the chat!`,
      username: null,
      styles: {
        fontStyle: "italic",
        color: "darkblue",
        fontWeight: 700,
      },
    };

    // saving new message to state
    const allMessages = [...messages];
    allMessages.push(messageData);
    setMessages([...allMessages]);
  });

  socket.on("disconnectUser", (data) => {
    const messageData = {
      message: `${data.username} has left from the chat!`,
      username: null,
      styles: {
        fontStyle: "italic",
        color: "darkblue",
        fontWeight: 700,
      },
    };

    const allMessages = [...messages];
    allMessages.push(messageData);
    setMessages([...allMessages]);

    const allUsers = { ...users };
    delete allUsers[data.id];

    setUsers({ ...allUsers });
  });

  socket.on("userMoved", ({ x, y, id }) => {
    const allUsers = { ...users };

    Object.values(allUsers).forEach((user) => {
      if (user.id === id) {
        user.position.x = x;
        user.position.y = y;
      }
    });

    setUsers({ ...allUsers });
  });

  socket.on("newMessage", (data) => {
    let allMessages = [...messages];
    allMessages.push(data);
    setMessages([...allMessages]);

    setTempMessage(data);

    setTimeout(() => {
      setTempMessage({});
    }, 3000);
  });

  const sendMessage = () => {
    if (chatMessage) {
      socket.emit("newMessage", { message: chatMessage });
      setChatMessage("");
    }

    let objDiv = document.getElementById("message-pane");
    objDiv.scroll({ top: objDiv.scrollHeight, behavior: "smooth" });
  };

  useEffect(() => {
    document.getElementById("pane").onclick = function clickEvent(e) {
      var rect = e.target.getBoundingClientRect();
      var x = e.clientX - rect.left; // x position within the element.
      var y = e.clientY - rect.top; // y position within the element.

      socket.emit("move", { x, y });
    };
  }, []);

  return (
    <div>
      <h1 style={{ textAlign: "center", marginTop: 10, marginBottom: 10 }}>
        Users
      </h1>

      <div
        id="pane"
        style={{
          width: "75%",
          height: "400px",
          border: "1px solid lightgray",
          margin: "auto",
          position: "relative",
        }}
      >
        {Object.values(users).map((user) => (
          <div
            style={{
              borderRadius: "999px",
              backgroundColor: user.color,
              fontWeight: "700",
              fontSize: "18px",
              color: "white",
              width: "100px",
              height: "100px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "absolute",
              top: user.position.y,
              left: user.position.x,
              transitionProperty: "all",
              transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
              transitionDuration: "300ms",
            }}
          >
            {tempMessage.id === user.id && (
              <p
                style={{
                  margin: 0,
                  position: "absolute",
                  top: "-24px",
                  color: "black",
                  border: "1px solid dimgrey",
                  paddingRight: "5px",
                  paddingLeft: "5px",
                  textAlign: "center",
                }}
              >
                {tempMessage.message}
              </p>
            )}
            {user.username}
          </div>
        ))}
      </div>

      <div
        style={{
          position: "relative",
          top: "20px",
          width: "100%",
        }}
      >
        <h1 style={{ textAlign: "center", marginTop: 10, marginBottom: 10 }}>
          Messages
        </h1>
        <div
          id="message-pane"
          style={{
            margin: "auto",
            width: "90%",
            marginBottom: "35px",
            height: "150px",
            overflowY: "scroll",
            border: "1px solid lightsteelblue",
            borderRadius: "7px",
            padding: "10px",
          }}
        >
          {messages.map((messageData) => (
            <p
              style={{
                borderBottom: "0.5px solid gray",
                paddingBottom: "10px",
                ...{ ...messageData.styles },
              }}
            >
              <span style={{ fontWeight: 700 }}>
                {messageData.username || "[SYSTEM]"}:
              </span>{" "}
              {messageData.message || (
                <img
                  style={{ width: 100, display: "block" }}
                  alt={messageData.image.fileName}
                  src={messageData.image.file}
                />
              )}
            </p>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            width: "100%",
            height: "50px",
          }}
        >
          <div style={{ width: "75%", position: "relative" }}>
            <input
              type="text"
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "7px",
                border: "1px solid #F64F38",
                paddingLeft: "10px",
                paddingRight: "10px",
                position: "absolute",
              }}
              placeholder="Type here..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyUp={(e) => e.key === "Enter" && sendMessage()}
            />
            <label
              style={{
                borderRadius: "7px",
                border: "1px solid #F64F38",
                paddingLeft: "10px",
                paddingRight: "10px",
                position: "absolute",
                height: "100%",
                width: "50px",
                right: "-22px",
                top: "1.1px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              Upload
              <input
                type="file"
                ref={fileRef}
                accept="image/*"
                style={{
                  display: "none",
                }}
              />
            </label>
          </div>

          <button
            type="button"
            onClick={sendMessage}
            style={{
              width: "15%",
              borderRadius: "7px",
              backgroundColor: "#F64F38",
              color: "white",
              fontWeight: 700,
              border: "1px solid black",
              cursor: "pointer",
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
