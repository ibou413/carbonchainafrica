import axios from 'axios';

// Replace with your Pinata API Key and Secret from environment variables
const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY;
const PINATA_API_URL = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';

interface IpfsUploadResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
  isDuplicate: boolean;
}

const uploadJsonToIpfs = async (json: object): Promise<string> => {
  if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
    throw new Error('Pinata API keys are not configured in environment variables.');
  }

  try {
    const response = await axios.post<IpfsUploadResponse>(
      PINATA_API_URL,
      {
        pinataContent: json,
        pinataMetadata: {
          name: `CarbonProjectMetadata-${Date.now()}`,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_API_KEY,
        },
      }
    );
    return response.data.IpfsHash;
  } catch (error) {
    console.error('Error uploading JSON to IPFS:', error);
    throw new Error('Failed to upload project metadata to IPFS.');
  }
};

const PINATA_API_URL_FILE = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

const uploadFileToIpfs = async (file: File): Promise<string> => {
  if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
    throw new Error('Pinata API keys are not configured in environment variables.');
  }

  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post<IpfsUploadResponse>(
      PINATA_API_URL_FILE,
      formData,
      {
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_API_KEY,
        },
      }
    );
    return response.data.IpfsHash;
  } catch (error) {
    console.error('Error uploading file to IPFS:', error);
    throw new Error('Failed to upload file to IPFS.');
  }
};

const ipfsService = {
  uploadJsonToIpfs,
  uploadFileToIpfs,
};

export default ipfsService;
