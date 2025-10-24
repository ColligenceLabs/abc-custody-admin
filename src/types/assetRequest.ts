export type AssetRequestStatus = 'pending' | 'reviewing' | 'approved' | 'rejected';
export type FeedbackType = 'info' | 'warning' | 'error' | 'success';
export type NetworkType = 'ethereum' | 'polygon' | 'bsc';

export interface Feedback {
  reviewedBy?: string;
  reviewedAt?: string;
  message: string;
  type?: FeedbackType;
  internalNote?: string;
}

export interface AssetAddRequest {
  id: string;
  userId: string;
  symbol: string;
  name: string;
  contractAddress: string;
  network: NetworkType;
  image?: string;
  priceApiUrl?: string;
  decimals?: number;
  requestedBy: string;
  requestedAt: string;
  status: AssetRequestStatus;
  feedback?: Feedback;
  approvalNote?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}
