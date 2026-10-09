import axiosClient from "./axiosClient";

export const friendApi = {
  sendRequest: (receiverId) => axiosClient.post(`/friends/request/${receiverId}`),
  getRequests: () => axiosClient.get("/friends/requests"),
  accept: (requestId) => axiosClient.post(`/friends/accept/${requestId}`),
  reject: (requestId) => axiosClient.post(`/friends/reject/${requestId}`)
};
