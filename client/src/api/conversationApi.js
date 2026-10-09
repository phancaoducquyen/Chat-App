import axiosClient from "./axiosClient";

export const conversationApi = {
  list: () => axiosClient.get("/conversations"),
  createPrivate: (memberId) => axiosClient.post("/conversations/private", { memberId }),
  createGroup: (groupName, memberIds) => axiosClient.post("/conversations/group", { groupName, memberIds }),
  addMember: (id, memberId) => axiosClient.put(`/conversations/${id}/add-member`, { memberId }),
  removeMember: (id, memberId) => axiosClient.put(`/conversations/${id}/remove-member`, { memberId }),
  leave: (id) => axiosClient.delete(`/conversations/${id}/leave`),
  remove: (id) => axiosClient.delete(`/conversations/${id}`)
};
