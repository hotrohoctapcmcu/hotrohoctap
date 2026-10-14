/**
 * UniStudy CMC - Sync Service
 * Interface dịch vụ đồng bộ theo API_FUNCTION_MAP.md & API_CONTRACT.md.
 * Khi chưa có backend: trả trạng thái unavailable theo hợp đồng chung.
 */
import { ENDPOINTS } from "../../shared/config/endpoints.js";
import { apiRequest } from "../../shared/services/api-client.js";
import { SYNC_SOURCES } from "../../shared/config/sync-sources.js";

/**
 * Lấy danh sách nguồn đồng bộ
 */
export async function getSyncSources() {
  const res = await apiRequest(ENDPOINTS.sync.getSources);
  if (res.unavailable) {
    // Trả danh sách nguồn từ config client cục bộ
    return {
      success: true,
      sources: SYNC_SOURCES,
      isLiveApi: false
    };
  }
  return res;
}

/**
 * Bắt đầu job đồng bộ lên server (sau khi có backend)
 */
export async function startSync(selectedSourceIds) {
  return await apiRequest(ENDPOINTS.sync.startSync, {
    body: { sources: selectedSourceIds }
  });
}

/**
 * Lấy trạng thái tiến trình đồng bộ
 */
export async function getSyncStatus(jobId) {
  return await apiRequest(ENDPOINTS.sync.getStatus, {
    params: { jobId }
  });
}
