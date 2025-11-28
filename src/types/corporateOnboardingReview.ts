/**
 * 법인 온보딩 검토 데이터 타입
 */

export interface OrganizationDetail {
  id: string;
  organizationName: string;
  businessNumber: string;
  corporateRegistryNumber: string;
  establishmentDate: string;
  corporateType: string;
  industryCode: string;
  industryType: string;
  isVASP: boolean;
  isFinancialInstitution: boolean;
  isNonProfit: boolean;
  isPublicEntity: boolean;
  zipCode: string;
  address: string;
  addressDetail: string;
  countryCode: string;
  phone: string;
  homepageUrl: string;
  isRealOwnerExempt: boolean;
  realOwnerExemptCode: string;
  businessLicensePath: string;
  corporateRegistryPath: string;
  articlesOfIncorporationPath: string;
  shareholderListPath: string;
  createdAt: string;
  updatedAt: string;
}

export interface RepresentativeDetail {
  id: number;
  organizationId: string;
  name: string;
  nameEn: string;
  birthDate: string;
  gender: string;
  nationality: string;
  idType: string;
  idNumber: string;
  phone: string;
  address: string;
  zipCode: string;
  isFiuTarget: boolean;
  hasOwnership: boolean;
  idCardPath: string;
  sealCertPath: string;
  createdAt: string;
  updatedAt: string;
}

export interface OwnerDetail {
  id: number;
  organizationId: string;
  ownerType: string;
  serialNumber: number;
  name: string;
  nameEn: string;
  idType: string;
  idNumber: string;
  birthDate: string;
  nationality: string;
  gender: string;
  sharePercentage: number;
  shareCount: number;
  verificationMethod: string;
  verificationMethodDetail: string;
  realOwnerType: string;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessInfoDetail {
  id: number;
  organizationId: string;
  mainBusiness: string;
  mainProducts: string;
  majorCustomers: string;
  majorSuppliers: string;
  employeeCount: number;
  businessLocationCount: number;
  companySize: string;
  fiscalYear: number;
  monthlyRevenue: number;
  totalAssets: number;
  totalCapital: number;
  totalLiabilities: number;
  netIncome: number;
  marketShare: number;
  mainBankName: string;
  mainBankAccountCountry: string;
  mainBankAccount: string;
  mainBankAccountHolder: string;
  financialStatementsPath: string;
  createdAt: string;
  updatedAt: string;
}

export interface FilesUrls {
  businessLicense?: string;
  corporateRegistry?: string;
  articlesOfIncorporation?: string;
  shareholderList?: string;
  representativeIdCard?: string;
  representativeSealCert?: string;
  financialStatements?: string;
}

export interface CorporateOnboardingReview {
  organization: OrganizationDetail;
  representative: RepresentativeDetail | null;
  owners: OwnerDetail[];
  businessInfo: BusinessInfoDetail | null;
  files: FilesUrls;
}
