import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',   // adjust as needed
  headers: { 'Content-Type': 'multipart/form-data' } // default for uploads
});

export const uploadArchive = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/upload-dbf-archive', formData);
};

export const splitLottery = (data) => {
  // data: { session_id, lottery_name, draw_number, agent_count, portion_size }
  return api.post('/split', data, {
    headers: { 'Content-Type': 'application/json' }
  });
};

// Placeholder for future: agent list, zip download
export const getAgents = () => api.get('/agents');
export const downloadZip = (sessionId) => api.get(`/download-zip/${sessionId}`, {
  responseType: 'blob'
});