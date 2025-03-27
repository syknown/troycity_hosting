const fs = require("fs");
const path = require("path");

function saveBase64Image(base64Image) {
  const imageData = base64Image.replace(/^data:image\/jpeg;base64,/, "");
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "");
  const directoryPath = path.join(__dirname, "../public/img/uploads");


  // Create the directory if it doesn't exist
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }

  const filePath = path.join(directoryPath, `${timestamp}.jpeg`);
  const imageBuffer = Buffer.from(imageData, "base64");

  fs.writeFileSync(filePath, imageBuffer);

  //uploadFileToS3(s3Location, imageBuffer, s3LocationPath);

  console.log("Image saved successfully:", filePath);

  return `${timestamp}.jpeg`;
}

module.exports = {
  saveBase64Image,
};