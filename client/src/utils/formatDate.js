export const formatTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit"
  });
};

export const formatDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleString("vi-VN");
};
