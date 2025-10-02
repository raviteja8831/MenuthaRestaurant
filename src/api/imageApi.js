import api from './api';

// Upload image using axios
export const uploadImage = async (file) => {
  const formData = new FormData();
  // Helper to ensure filename has extension
  function ensureExtension(name, type) {
    if (name && name.includes('.')) return name;
    if (type && type.includes('jpeg')) return (name || 'image') + '.jpg';
    if (type && type.includes('png')) return (name || 'image') + '.png';
    if (type && type.includes('gif')) return (name || 'image') + '.gif';
    return (name || 'image') + '.jpg'; // default
  }
  // For web, convert to Blob if needed
  if (typeof window !== 'undefined' && window.File && file.uri && file.uri.startsWith('data:')) {
    // Convert base64 to Blob
    const res = await fetch(file.uri);
    const blob = await res.blob();
    const validName = ensureExtension(file.name, file.type);
    formData.append('file', new File([blob], validName, { type: file.type }));
  } else {
    // If file is a File/Blob object, check name property
    let validFile = file;
    if (file && file.name && !file.name.includes('.')) {
      // Clone file with extension if missing
      const ext = file.type && file.type.includes('png') ? '.png' : (file.type && file.type.includes('gif') ? '.gif' : '.jpg');
      validFile = new File([file], (file.name || 'image') + ext, { type: file.type });
    }
    formData.append('file', validFile);
  }
  const response = await api.post('/users/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};
