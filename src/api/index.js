import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
});

export const uploadArchive = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/upload-dbf-archive', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const splitLottery = (data) => {
  // data: { session_id, lottery_name, draw_number, assignments: [{agent_name, count}] }
  return api.post('/split', data, {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const downloadZip = (sessionId) =>
  api.get(`/download-zip/${sessionId}`, { responseType: 'blob' });