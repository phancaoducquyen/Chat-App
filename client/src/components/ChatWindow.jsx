import { useEffect, useRef, useState } from "react";
import { messageApi } from "../api/messageApi";
import { uploadApi } from "../api/uploadApi";
import { conversationApi } from "../api/conversationApi";
import { formatTime } from "../utils/formatDate";
import { getFileUrl, isImageFile } from "../utils/fileUtils";

const ChatWindow = ({
  currentUser,
  socket,
  selectedConversation,
  setSelectedConversation,
  conversations,
  setConversations,
  friends
}) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typingUsers, setTypingUsers] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [addMemberId, setAddMemberId] = useState("");
  const typingTimer = useRef(null);
  const bottomRef = useRef(null);

  const loadMessages = async () => {
    if (!selectedConversation?._id) return;
    const data = await messageApi.list(selectedConversation._id);
    setMessages(data);
  };

  useEffect(() => {
    loadMessages();

    if (socket && selectedConversation?._id) {
      socket.emit("join_conversation", {
        conversationId: selectedConversation._id
      });
    }
  }, [selectedConversation?._id, socket]);

  useEffect(() => {
    if (!socket) return;

    const onReceiveMessage = (message) => {
      if (message.conversation === selectedConversation?._id) {
        setMessages((prev) => [...prev, message]);
        socket.emit("message_seen", {
          messageId: message._id,
          conversationId: message.conversation
        });
      }
    };

    const onSeen = (message) => {
      setMessages((prev) => prev.map((item) => item._id === message._id ? message : item));
    };

    const onTyping = ({ conversationId, user }) => {
      if (conversationId !== selectedConversation?._id) return;
      if (user._id === currentUser._id) return;
      setTypingUsers((prev) => {
        if (prev.some((u) => u._id === user._id)) return prev;
        return [...prev, user];
      });
    };

    const onStopTyping = ({ conversationId, userId }) => {
      if (conversationId !== selectedConversation?._id) return;
      setTypingUsers((prev) => prev.filter((u) => u._id !== userId));
    };

    socket.on("receive_message", onReceiveMessage);
    socket.on("message_seen", onSeen);
    socket.on("typing", onTyping);
    socket.on("stop_typing", onStopTyping);

    return () => {
      socket.off("receive_message", onReceiveMessage);
      socket.off("message_seen", onSeen);
      socket.off("typing", onTyping);
      socket.off("stop_typing", onStopTyping);
    };
  }, [socket, selectedConversation?._id, currentUser._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  const getTitle = () => {
    if (!selectedConversation) return "Chọn một cuộc trò chuyện";
    if (selectedConversation.type === "group") return selectedConversation.groupName;

    const other = selectedConversation.members.find((m) => m._id !== currentUser._id);
    return other?.name || "Cuộc trò chuyện";
  };

  const sendMessage = async () => {
    if (!socket || !selectedConversation) return;
    if (!text.trim() && !selectedFile) return;

    let uploaded = null;

    if (selectedFile) {
      uploaded = await uploadApi.upload(selectedFile);
    }

    socket.emit(
      "send_message",
      {
        conversationId: selectedConversation._id,
        text,
        fileUrl: uploaded?.fileUrl || "",
        fileName: uploaded?.fileName || "",
        fileType: uploaded?.fileType || ""
      },
      (response) => {
        if (!response.ok) {
          alert(response.message);
        }
      }
    );

    setText("");
    setSelectedFile(null);
    socket.emit("stop_typing", { conversationId: selectedConversation._id });
  };

  const handleTyping = (value) => {
    setText(value);

    if (!socket || !selectedConversation) return;

    socket.emit("typing", {
      conversationId: selectedConversation._id
    });

    clearTimeout(typingTimer.current);

    typingTimer.current = setTimeout(() => {
      socket.emit("stop_typing", {
        conversationId: selectedConversation._id
      });
    }, 1000);
  };

  const isSeenByOthers = (message) => {
    if (message.sender?._id !== currentUser._id) return false;
    return message.seenBy?.some((u) => u._id !== currentUser._id);
  };

  const addMember = async () => {
    if (!addMemberId) return;
    const updated = await conversationApi.addMember(selectedConversation._id, addMemberId);
    setSelectedConversation(updated);
    setConversations((prev) => prev.map((c) => c._id === updated._id ? updated : c));
    setAddMemberId("");
  };

  const removeMember = async (memberId) => {
    const updated = await conversationApi.removeMember(selectedConversation._id, memberId);
    setSelectedConversation(updated);
    setConversations((prev) => prev.map((c) => c._id === updated._id ? updated : c));
  };

  const leaveGroup = async () => {
    await conversationApi.leave(selectedConversation._id);
    setConversations((prev) => prev.filter((c) => c._id !== selectedConversation._id));
    setSelectedConversation(null);
  };

  const deleteGroup = async () => {
    await conversationApi.remove(selectedConversation._id);
    setConversations((prev) => prev.filter((c) => c._id !== selectedConversation._id));
    setSelectedConversation(null);
  };

  if (!selectedConversation) {
    return (
      <main className="chat-window empty">
        <h2>Chọn bạn bè hoặc nhóm để bắt đầu chat</h2>
      </main>
    );
  }

  const isGroupOwner = selectedConversation.type === "group" && selectedConversation.createdBy?._id === currentUser._id;
  const availableFriendsToAdd = friends.filter(
    (friend) => !selectedConversation.members.some((m) => m._id === friend._id)
  );

  return (
    <main className="chat-window">
      <header className="chat-header">
        <div>
          <h2>{getTitle()}</h2>
          <p>
            {selectedConversation.type === "group"
              ? `${selectedConversation.members.length} thành viên`
              : "Chat 1-1"}
          </p>
        </div>

        {selectedConversation.type === "group" && (
          <div className="group-actions">
            {isGroupOwner && (
              <>
                <select value={addMemberId} onChange={(e) => setAddMemberId(e.target.value)}>
                  <option value="">Thêm thành viên</option>
                  {availableFriendsToAdd.map((friend) => (
                    <option key={friend._id} value={friend._id}>{friend.name}</option>
                  ))}
                </select>
                <button onClick={addMember}>Thêm</button>
                <button className="danger" onClick={deleteGroup}>Giải tán</button>
              </>
            )}
            {!isGroupOwner && <button className="danger" onClick={leaveGroup}>Rời nhóm</button>}
          </div>
        )}
      </header>

      {selectedConversation.type === "group" && (
        <div className="member-bar">
          {selectedConversation.members.map((member) => (
            <span key={member._id}>
              {member.name}
              {isGroupOwner && member._id !== currentUser._id && (
                <button onClick={() => removeMember(member._id)}>x</button>
              )}
            </span>
          ))}
        </div>
      )}

      <section className="messages">
        {messages.map((message) => {
          const mine = message.sender?._id === currentUser._id;

          return (
            <div key={message._id} className={`message-row ${mine ? "mine" : ""}`}>
              <div className="message-bubble">
                {!mine && <b className="sender-name">{message.sender?.name}</b>}

                {message.text && <p>{message.text}</p>}

                {message.fileUrl && (
                  <div className="file-box">
                    {isImageFile(message.fileType) ? (
                      <img src={getFileUrl(message.fileUrl)} alt={message.fileName} />
                    ) : (
                      <a href={getFileUrl(message.fileUrl)} target="_blank" rel="noreferrer">
                        Tải file: {message.fileName}
                      </a>
                    )}
                  </div>
                )}

                <div className="message-meta">
                  <small>{formatTime(message.createdAt)}</small>
                  {mine && <small>{isSeenByOthers(message) ? "✓✓ Đã xem" : "✓ Đã gửi"}</small>}
                </div>
              </div>
            </div>
          );
        })}

        {typingUsers.length > 0 && (
          <div className="typing">
            {typingUsers.map((u) => u.name).join(", ")} đang nhập...
          </div>
        )}

        <div ref={bottomRef} />
      </section>

      {selectedFile && (
        <div className="preview">
          <span>File đã chọn: {selectedFile.name}</span>
          {selectedFile.type.startsWith("image/") && (
            <img src={URL.createObjectURL(selectedFile)} alt="preview" />
          )}
          <button onClick={() => setSelectedFile(null)}>Bỏ chọn</button>
        </div>
      )}

      <footer className="message-input">
        <input
          value={text}
          onChange={(e) => handleTyping(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
          placeholder="Nhập tin nhắn..."
        />

        <label className="file-button">
          File
          <input
            type="file"
            hidden
            onChange={(e) => setSelectedFile(e.target.files[0])}
          />
        </label>

        <button onClick={sendMessage}>Gửi</button>
      </footer>
    </main>
  );
};

export default ChatWindow;
