import api from './api';

// Upload image using axios
export const uploadImage = async (file) => {
  const formData = new FormData();

  // React Native file upload - file object has uri, name, type properties
  if (file.uri) {
    // Ensure filename has extension
    let filename = file.name || 'image.jpg';
    if (!filename.includes('.')) {
      const ext = file.type && file.type.includes('png') ? '.png' :
                  (file.type && file.type.includes('gif') ? '.gif' : '.jpg');
      filename = filename + ext;
    }

    // For React Native, append the file object directly
    formData.append('file', {
      uri: file.uri,
      name: filename,
      type: file.type || 'image/jpeg',
    });
  } else {
    // For web or other platforms
    formData.append('file', file);
  }

  const response = await api.post('/users/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
