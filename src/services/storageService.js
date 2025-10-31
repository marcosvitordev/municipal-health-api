const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
require("dotenv").config();

const s3 = new S3Client({
  region: process.env.SPACES_REGION || "us-east-1",
  endpoint: process.env.SPACES_ENDPOINT,
  credentials: {
    accessKeyId: process.env.SPACES_KEY,
    secretAccessKey: process.env.SPACES_SECRET,
  },
  forcePathStyle: false,
});

async function uploadBuffer(key, buffer, contentType) {
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.SPACES_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: "private",
    })
  );
  return key;
}
async function presignGet(key, expires = 300) {
  const cmd = new GetObjectCommand({
    Bucket: process.env.SPACES_BUCKET,
    Key: key,
  });
  return await getSignedUrl(s3, cmd, { expiresIn: expires });
}

module.exports = { uploadBuffer, presignGet };
