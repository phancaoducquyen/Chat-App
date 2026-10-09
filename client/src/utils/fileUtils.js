export const getFileUrl = (fileUrl) => {
  if (!fileUrl) return "";
  const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
  return `${serverUrl}${fileUrl}`;
};

export const isImageFile = (fileType) => {
  return fileType?.startsWith("image/");
};
