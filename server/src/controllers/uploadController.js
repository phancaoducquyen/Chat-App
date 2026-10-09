export const uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Không có file được upload" });
  }

  const isImage = req.file.mimetype.startsWith("image/");
  const folder = isImage ? "images" : "files";

  res.status(201).json({
    fileUrl: `/uploads/${folder}/${req.file.filename}`,
    fileName: req.file.originalname,
    fileType: req.file.mimetype
  });
};
