/**
 * 관리자 대출 관리 서비스 모듈
 * 모든 대출, 청산, 상품 관련 서비스 함수를 export
 */

// 대출 서비스
export {
  getLoans,
  getLoanById,
  getLoanDashboardStats,
  getLoansByCustomer,
  getLoansByRiskLevel,
  getLoanStatsByAsset,
} from "./loanService";

// 청산 서비스
export {
  getLiquidationCalls,
  getLiquidationCallById,
  startLiquidation,
  getLiquidationExecutions,
  getLiquidationExecutionById,
  getLiquidationExecutionByCallId,
  getExchangeStatus,
  getExchangeStatusByName,
  getLiquidationStats,
} from "./liquidationService";

// 상품 서비스
export {
  getLoanProducts,
  getLoanProductById,
  getLoanProductsByAsset,
  createLoanProduct,
  updateLoanProduct,
  toggleLoanProductStatus,
  deleteLoanProduct,
  getLoanProductStats,
  getLoanProductStatById,
} from "./productService";

// 알림 서비스
export {
  getAlertConfigs,
  getAlertConfig,
  updateAlertConfig,
  getAlertHistory,
  markAlertAsRead,
  getRiskCustomers,
  testAlert,
  getAlertStats,
} from "./alertService";
