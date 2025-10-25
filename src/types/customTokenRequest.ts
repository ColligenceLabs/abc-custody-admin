export interface CustomTokenRequest {
  id: string;
  userId: string;
  symbol: string;
  name: string;
  contractAddress: string;
  network: string;
  logoUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  adminComment?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}
