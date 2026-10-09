import { useEffect, useState } from "react";
import { conversationApi } from "../api/conversationApi";
import { friendApi } from "../api/friendApi";
import { userApi } from "../api/userApi";

const Sidebar = ({
  currentUser,
  selectedConversation,
  setSelectedConversation,
  conversations,
  setConversations,
  friends,
  setFriends
}) => {
  const [keyword, setKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [requests, setRequests] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);

  const loadConversations = async () => {
    const data = await conversationApi.list();
    setConversations(data);
  };

  const loadFriends = async () => {
    const data = await userApi.friends();
    setFriends(data);
  };

  const loadRequests = async () => {
    const data = await friendApi.getRequests();
    setRequests(data);
  };

  useEffect(() => {
    loadConversations();
    loadFriends();
    loadRequests();
  }, []);

  const handleSearch = async () => {
    if (!keyword.trim()) return;
    const data = await userApi.search(keyword);
    setSearchResults(data);
  };

  const sendRequest = async (userId) => {
    await friendApi.sendRequest(userId);
    alert("Đã gửi lời mời kết bạn");
  };

  const acceptRequest = async (requestId) => {
    await friendApi.accept(requestId);
    await loadRequests();
    await loadFriends();
  };

  const rejectRequest = async (requestId) => {
    await friendApi.reject(requestId);
    await loadRequests();
  };

  const openPrivateChat = async (friendId) => {
    const conversation = await conversationApi.createPrivate(friendId);
    await loadConversations();
    setSelectedConversation(conversation);
  };

  const createGroup = async () => {
    if (!groupName.trim() || selectedMembers.length === 0) {
      alert("Nhập tên nhóm và chọn thành viên");
      return;
    }

    const conversation = await conversationApi.createGroup(groupName, selectedMembers);
    setGroupName("");
    setSelectedMembers([]);
    await loadConversations();
    setSelectedConversation(conversation);
  };

  const getConversationName = (conversation) => {
    if (conversation.type === "group") return conversation.groupName;

    const other = conversation.members.find((m) => m._id !== currentUser._id);
    return other?.name || "Cuộc trò chuyện";
  };

  const getConversationStatus = (conversation) => {
    if (conversation.type === "group") return `${conversation.members.length} thành viên`;

    const other = conversation.members.find((m) => m._id !== currentUser._id);
    return other?.isOnline ? "Online" : "Offline";
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div>
          <h2>Chat Web</h2>
          <p>{currentUser.name}</p>
        </div>
      </div>

      <section className="panel">
        <h3>Tìm người dùng</h3>
        <div className="row">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Nhập tên hoặc email"
          />
          <button onClick={handleSearch}>Tìm</button>
        </div>

        <div className="mini-list">
          {searchResults.map((user) => (
            <div className="mini-item" key={user._id}>
              <div>
                <b>{user.name}</b>
                <small>{user.email}</small>
              </div>
              <button onClick={() => sendRequest(user._id)}>Kết bạn</button>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h3>Lời mời kết bạn</h3>
        <div className="mini-list">
          {requests.length === 0 && <small>Không có lời mời</small>}
          {requests.map((request) => (
            <div className="mini-item" key={request._id}>
              <div>
                <b>{request.sender.name}</b>
                <small>{request.sender.email}</small>
              </div>
              <div className="button-group">
                <button onClick={() => acceptRequest(request._id)}>Nhận</button>
                <button className="danger" onClick={() => rejectRequest(request._id)}>Từ chối</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h3>Bạn bè</h3>
        <div className="mini-list">
          {friends.map((friend) => (
            <div className="mini-item clickable" key={friend._id} onClick={() => openPrivateChat(friend._id)}>
              <div>
                <b>{friend.name}</b>
                <small>{friend.isOnline ? "Online" : "Offline"}</small>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h3>Tạo nhóm</h3>
        <input
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Tên nhóm"
        />
        <div className="checkbox-list">
          {friends.map((friend) => (
            <label key={friend._id}>
              <input
                type="checkbox"
                checked={selectedMembers.includes(friend._id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedMembers((prev) => [...prev, friend._id]);
                  } else {
                    setSelectedMembers((prev) => prev.filter((id) => id !== friend._id));
                  }
                }}
              />
              {friend.name}
            </label>
          ))}
        </div>
        <button onClick={createGroup}>Tạo nhóm</button>
      </section>

      <section className="panel grow">
        <h3>Cuộc trò chuyện</h3>
        <div className="conversation-list">
          {conversations.map((conversation) => (
            <div
              key={conversation._id}
              className={`conversation-item ${selectedConversation?._id === conversation._id ? "active" : ""}`}
              onClick={() => setSelectedConversation(conversation)}
            >
              <b>{getConversationName(conversation)}</b>
              <small>{getConversationStatus(conversation)}</small>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
};

export default Sidebar;
