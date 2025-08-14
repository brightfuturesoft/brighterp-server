const sharp = require("sharp");
const { ObjectId } = require("mongodb");
const { image_collection } = require("../../collection/collections/image_collection");
const { response_sender } = require("../../modules/hooks/respose_sender");

const upload_image = async (req, res, next) => {
      try {
            const imageBuffer = req.file.buffer;
            const shopId = req.query.shopId;
            const mimeType = req.file.mimetype; //
            const image_title = req.body?.title;

            // Initialize sharp with the image buffer
            let sharpInstance = sharp(imageBuffer).resize({ width: 800 }); // Resize to 800px width, maintaining aspect ratio

            // Compress the image based on the MIME type
            let compressedImageBuffer;
            if (mimeType === "image/jpeg" || mimeType === "image/jpg") {
                  compressedImageBuffer = await sharpInstance
                        .jpeg({ quality: 90 })
                        .toBuffer();
            } else if (mimeType === "image/png") {
                  compressedImageBuffer = await sharpInstance
                        .png({ compressionLevel: 8 })
                        .toBuffer();
            } else {
                  return res.status(400).json({ error: "Unsupported image format" });
            }

            // Create data object
            let data = {
                  image: compressedImageBuffer,
                  createdAt: new Date(),
            };

            if (shopId) {
                  data.shopId = shopId;
            }

            if (image_title) {
                  data.title = image_title;
            }
            const result = await image_collection.insertOne(data);
            const imageUrl = `${process.env.SERVER_URL}/image/${result.insertedId}`;
            const fileExtension = mimeType.split("/")[1];
            const file_url = `${imageUrl}.${fileExtension}`

            response_sender({
                  res,
                  status_code: 200,
                  error: false,
                  message: "Image uploaded successfully",
                  data: {
                        image_url: file_url
                  },
            })
      } catch (err) {
            next(err);
      }
};


const get_image_by_id = async (req, res, next) => {
      try {
            let imageId = req.params.id;
            imageId = imageId.replace(/\.[^/.]+$/, "");

            const imageDoc = await image_collection.findOne({
                  _id: new ObjectId(imageId),
            });

            if (!imageDoc) {
                  res.status(404).json({ error: "Image not found" });
            } else {
                  res.contentType("image/jpeg");
                  const imageBuffer = Buffer.from(imageDoc.image.buffer, "base64");
                  res.status(200).send(imageBuffer);
            }
      } catch (err) {
            next(err);
      }
};

module.exports = {
      upload_image,
      get_image_by_id,
};
