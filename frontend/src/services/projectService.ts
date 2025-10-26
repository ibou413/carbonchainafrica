import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const getProjects = async (token: string) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(`${API_BASE_URL}/projects/my-projects/`, config);
  return response.data;
};

const getActiveListings = async (token?: string) => {
  const config = token ? {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  } : {};
  const response = await axios.get(`${API_BASE_URL}/listings/`, config);
  return response.data;
};

const getVerifierDashboardProjects = async (token: string) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(`${API_BASE_URL}/projects/verifier-dashboard/`, config);
  return response.data;
};

const addProject = async (projectData: any, token: string) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.post(`${API_BASE_URL}/projects/`, projectData, config);
  return response.data;
};

const getCarbonCredits = async (token: string) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(`${API_BASE_URL}/nfts/my-nfts/`, config);
  return response.data;
};

const listCredit = async (listingData: { credit: number; price: number }, token: string) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.post(`${API_BASE_URL}/listings/`, listingData, config);
  return response.data;
};

const claimProceeds = async (listingId: number, token: string) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.post(`${API_BASE_URL}/listings/${listingId}/claim/`, {}, config);
  return response.data;
};

const getMyListings = async (token: string) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(`${API_BASE_URL}/listings/my-listings/`, config);
  return response.data;
};

const projectService = {
  getProjects,
  getActiveListings,
  getVerifierDashboardProjects,
  addProject,
  getCarbonCredits,
  listCredit,
  claimProceeds,
  getMyListings,
};

export default projectService;