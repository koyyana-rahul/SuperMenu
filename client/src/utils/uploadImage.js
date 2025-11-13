import Axios from "./Axios";
import SummaryApi from "../common/summaryApi";

/**
 * Uploads an image file to the server.
 * @param {File} imageFile The image file to upload.
 * @returns {Promise<string>} The URL of the uploaded image.
 */
const uploadImage = async (imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await Axios.post(SummaryApi.uploadImage.url, formData);

  return response.data.imageUrl;
};

export default uploadImage;