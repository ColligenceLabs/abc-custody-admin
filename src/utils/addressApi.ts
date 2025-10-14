import { WhitelistedAddress } from "@/types/address";

// json-server API 기본 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/**
 * 주소 목록 조회
 * @param userId - 사용자 ID (users 테이블의 id 참조, 선택적)
 * @param type - 주소 타입 필터 (선택적)
 * @returns WhitelistedAddress 배열
 */
export async function getAddresses(
  userId?: string,
  type?: "personal" | "vasp"
): Promise<WhitelistedAddress[]> {
  try {
    const params = new URLSearchParams();
    if (userId) params.append("userId", userId);
    if (type) params.append("type", type);

    const queryString = params.toString();
    const url = `${API_BASE_URL}/addresses${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`주소 목록 조회 실패: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("주소 목록 조회 에러:", error);
    throw error;
  }
}

/**
 * 특정 타입의 주소 목록 조회
 * @param type - 주소 타입 ("personal" | "vasp")
 * @param userId - 사용자 ID (선택적)
 * @returns WhitelistedAddress 배열
 */
export async function getAddressByType(
  type: "personal" | "vasp",
  userId?: string
): Promise<WhitelistedAddress[]> {
  return getAddresses(userId, type);
}

/**
 * 특정 주소 ID로 조회
 * @param id - 주소 ID
 * @returns WhitelistedAddress 또는 null
 */
export async function getAddressById(
  id: string
): Promise<WhitelistedAddress | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/addresses/${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`주소 조회 실패: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error(`주소 조회 에러 (ID: ${id}):`, error);
    throw error;
  }
}

/**
 * 새 주소 추가
 * @param address - 추가할 주소 데이터 (userId 포함 필수)
 * @returns 생성된 WhitelistedAddress
 */
export async function createAddress(
  address: Omit<WhitelistedAddress, "id" | "addedAt" | "txCount"> & {
    userId: string;
  }
): Promise<WhitelistedAddress> {
  try {
    const newAddress = {
      ...address,
      id: `addr_${address.type}_${Date.now()}`,
      addedAt: new Date().toISOString(),
      txCount: 0,
    };

    const response = await fetch(`${API_BASE_URL}/addresses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newAddress),
    });

    if (!response.ok) {
      throw new Error(`주소 추가 실패: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("주소 추가 에러:", error);
    throw error;
  }
}

/**
 * 주소 정보 수정
 * @param id - 수정할 주소 ID
 * @param updates - 수정할 필드들
 * @returns 수정된 WhitelistedAddress
 */
export async function updateAddress(
  id: string,
  updates: Partial<WhitelistedAddress>
): Promise<WhitelistedAddress> {
  try {
    const response = await fetch(`${API_BASE_URL}/addresses/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`주소 수정 실패: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error(`주소 수정 에러 (ID: ${id}):`, error);
    throw error;
  }
}

/**
 * 주소 삭제
 * @param id - 삭제할 주소 ID
 * @returns 성공 여부
 */
export async function deleteAddress(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/addresses/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`주소 삭제 실패: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error(`주소 삭제 에러 (ID: ${id}):`, error);
    throw error;
  }
}

/**
 * 일일 사용량 업데이트
 * @param id - 주소 ID
 * @param depositAmount - 추가 입금액 (선택적)
 * @param withdrawalAmount - 추가 출금액 (선택적)
 * @returns 업데이트된 WhitelistedAddress
 */
export async function updateDailyUsage(
  id: string,
  depositAmount?: number,
  withdrawalAmount?: number
): Promise<WhitelistedAddress> {
  try {
    // 현재 주소 정보 조회
    const address = await getAddressById(id);
    if (!address) {
      throw new Error(`주소를 찾을 수 없습니다 (ID: ${id})`);
    }

    const today = new Date().toISOString().split("T")[0];
    const currentUsage = address.dailyUsage;

    // 날짜가 바뀌었으면 리셋
    const shouldReset = !currentUsage || currentUsage.date !== today;

    const newUsage = {
      date: today,
      depositAmount: shouldReset
        ? depositAmount || 0
        : (currentUsage?.depositAmount || 0) + (depositAmount || 0),
      withdrawalAmount: shouldReset
        ? withdrawalAmount || 0
        : (currentUsage?.withdrawalAmount || 0) + (withdrawalAmount || 0),
      lastResetAt: shouldReset ? new Date().toISOString() : currentUsage!.lastResetAt,
    };

    return updateAddress(id, { dailyUsage: newUsage });
  } catch (error) {
    console.error(`일일 사용량 업데이트 에러 (ID: ${id}):`, error);
    throw error;
  }
}
