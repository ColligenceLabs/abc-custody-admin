interface PaginationNavProps {
  paginatedData: {
    items: any[],
    totalItems: number,
    totalPages: number,
    currentPage: number,
    itemsPerPage: number
  };
  tabKey: "personal" | "vasp";
  onPageChange: (tabKey: "personal" | "vasp", page: number) => void;
}

export default function PaginationNav({ paginatedData, tabKey, onPageChange }: PaginationNavProps) {
  if (paginatedData.totalPages <= 1) return null;

  return (
    <div className="px-6 py-4 border-t border-gray-200">
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <div className="text-sm text-gray-700 mb-4 sm:mb-0">
          총 {paginatedData.totalItems}개 중{" "}
          {Math.min(
            (paginatedData.currentPage - 1) * paginatedData.itemsPerPage + 1,
            paginatedData.totalItems
          )}
          -
          {Math.min(
            paginatedData.currentPage * paginatedData.itemsPerPage,
            paginatedData.totalItems
          )}
          개 표시
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() =>
              onPageChange(tabKey, Math.max(1, paginatedData.currentPage - 1))
            }
            disabled={paginatedData.currentPage === 1}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            이전
          </button>

          {[...Array(paginatedData.totalPages)].map((_, index) => {
            const pageNumber = index + 1;
            const isCurrentPage = pageNumber === paginatedData.currentPage;

            return (
              <button
                key={pageNumber}
                onClick={() => onPageChange(tabKey, pageNumber)}
                className={`px-3 py-1 text-sm border rounded-md ${
                  isCurrentPage
                    ? "bg-primary-600 text-white border-primary-600"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                {pageNumber}
              </button>
            );
          })}

          <button
            onClick={() =>
              onPageChange(tabKey, Math.min(paginatedData.totalPages, paginatedData.currentPage + 1))
            }
            disabled={paginatedData.currentPage === paginatedData.totalPages}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
}