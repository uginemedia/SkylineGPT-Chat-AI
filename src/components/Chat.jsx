import React, { useEffect, useState, useRef } from "react";
import logo from "../assets/logo.png";
import user from "../assets/user.png";
import arrowDownImg from "../assets/arrow-down.png";

const Chat = () => {
  // Chat messages (some initial sample messages)
  const [messages, setMessages] = useState([]);
  //Text Input Value
  const [inputValue, setInputValue] = useState("");
  //Set Is Loading State
  const [loading, setIsLoading] = useState(false);

  const handleAIResponse = async (userMessage) => {
    setIsLoading(true);
    try {
      //Replace Key with your own API Key
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${
          import.meta.env.VITE_API_KEY
        }`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${userMessage}`,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();

      // Hypothetical AI-generated text from the Gemini API
      const aiMessage =
        data.candidates[0].content.parts[0].text ??
        "Sorry, I couldn't process that.";

      let index = 0;
      let tempText = "";
      const interval = setInterval(() => {
        tempText += aiMessage.charAt(index);
        setMessages((prev) => {
          const newMessages = [...prev];
          if (newMessages[newMessages.length - 1]?.type === "bot") {
            newMessages[newMessages.length - 1].text = tempText;
          } else {
            newMessages.push({
              id: prev.length + 1,
              type: "bot",
              user: "SkylineGPT",
              text: tempText,
            });
          }
          return newMessages;
        });
        index++;
        if (index >= aiMessage.length) clearInterval(interval);
      }, 10);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          type: "bot",
          user: "SkylineGPT",
          text: "Oops! Something went wrong.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  //Send message and get AI response;
  const handleSend = async () => {
    if (inputValue.trim() === "") return;

    const newMessage = {
      id: messages.length + 1,
      type: "user",
      user: "Me",
      text: inputValue,
    };

    //Add user message to chat;
    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");

    //Call AI response function
    await handleAIResponse(inputValue);
  };

  //Make a reference to the chat Message
  const chatMessages = useRef(null);

  // Scrolls the chat container to the bottom smoothly.
  // This is useful for keeping the latest messages in view
  // when a new message is added.
  const handleChatScroll = () => {
    chatMessages.current.scrollTo({
      top: chatMessages.current.scrollHeight,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    // Adds a scroll event listener to the chatMessages container.
    // When the user scrolls, it displays the "arrowDown" element,
    // which could be used as a scroll-to-bottom indicator.
    if (chatMessages.current) {
      chatMessages.current.addEventListener("scroll", (e) => {
        document.getElementById("arrowDown").style.display = "flex";
      });
    }
  }, []);

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="logo">
          <img src={logo} alt="logo" /> <span>SkylineGPT</span>
        </h2>
        <div className="channels">
          <p className="channel active">General</p>
          <p className="channel">Tech Talk</p>
          <p className="channel">Design</p>
        </div>
        <div className="user-profile">
          <img src={user} alt="User Avatar" className="avatar" />
          <span className="username">You</span>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="chat-main">
        <header className="chat-header">
          <h2>General</h2>
          <p className="topic">Chat about anything and everything!</p>
        </header>

        <section className="chat-messages" ref={chatMessages}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`message-bubble ${
                msg.user === "Me" ? "my-message" : "other-message"
              }`}
            >
              <p className="message-user">{msg.user}</p>
              <p className="message-text">{msg.text}</p>
            </div>
          ))}
          {loading && (
            <div className="message-bubble other-message">
              <p className="message-user">SkylineGPT</p>
              <p className="message-text">Generating Response...</p>
            </div>
          )}

          <button id="arrowDown" onClick={handleChatScroll}>
            <img src={arrowDownImg} alt="" />
          </button>
        </section>

        <footer className="chat-input">
          <input
            type="text"
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button disabled={!inputValue.trim()} onClick={handleSend}>
            Send
          </button>
        </footer>
        <p className="footer-message">
          SkylineGPT can make mistakes. Check important info.
        </p>
      </main>
    </div>
  );
};

export default Chat;
