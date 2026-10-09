import axiosClient from "./axiosClient";

export const userApi = {
  search: (keyword) => axiosClient.get(`/users/search?keyword=${encodeURIComponent(keyword)}`),
  friends: () => axiosClient.get("/users/friends")
};
