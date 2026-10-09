import axiosClient from "./axiosClient";

export const messageApi = {
  list: (conversationId) => axiosClient.get(`/messages/${conversationId}`),
  seen: (messageId) => axiosClient.put(`/messages/${messageId}/seen`)
};
