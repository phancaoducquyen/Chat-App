import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

const ChatPage = () => {
  const { user, logout } = useAuth();
  const { socket } = useSocket();

  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    if (!socket) return;

    const updateOnline = ({ userId }) => {
      setFriends((prev) => prev.map((f) => f._id === userId ? { ...f, isOnline: true } : f));
      setConversations((prev) =>
        prev.map((c) => ({
          ...c,
          members: c.members.map((m) => m._id === userId ? { ...m, isOnline: true } : m)
        }))
      );
    };

    const updateOffline = ({ userId, lastSeen }) => {
      setFriends((prev) => prev.map((f) => f._id === userId ? { ...f, isOnline: false, lastSeen } : f));
      setConversations((prev) =>
        prev.map((c) => ({
          ...c,
          members: c.members.map((m) => m._id === userId ? { ...m, isOnline: false, lastSeen } : m)
        }))
      );
    };

    socket.on("user_online", updateOnline);
    socket.on("user_offline", updateOffline);

    return () => {
      socket.off("user_online", updateOnline);
      socket.off("user_offline", updateOffline);
    };
  }, [socket]);

  return (
    <div className="chat-page">
      <div className="topbar">
        <b>Hệ thống nhắn tin :v</b>
        <button onClick={logout}>Đăng xuất</button>
      </div>

      <div className="chat-shell">
        <Sidebar
          currentUser={user}
          selectedConversation={selectedConversation}
          setSelectedConversation={setSelectedConversation}
          conversations={conversations}
          setConversations={setConversations}
          friends={friends}
          setFriends={setFriends}
        />

        <ChatWindow
          currentUser={user}
          socket={socket}
          selectedConversation={selectedConversation}
          setSelectedConversation={setSelectedConversation}
          conversations={conversations}
          setConversations={setConversations}
          friends={friends}
        />
      </div>
    </div>
  );
};

export default ChatPage;
