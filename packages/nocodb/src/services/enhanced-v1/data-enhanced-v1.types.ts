/**
 * Interface for a single batch link record item
 */
export interface BatchLinkRecordItem {
  /**
   * The ID of the record in the main table
   */
  recordId: number | string;

  /**
   * Array of record IDs to link to the main record
   */
  ids: (number | string)[];
}

/**
 * Type alias for batch link request
 * Can be either a single item or an array of items
 */
export type BatchLinkRequest =
  | BatchLinkRecordItem
  | BatchLinkRecordItem[];

/**
 * Response interface for batch link operation
 */
export interface BatchLinkResponse {
  success: boolean;
}

/**
 * Parameters for batch link records service method
 */
export interface BatchLinkRecordsParams {
  modelId: string;
  columnId: string;
  linkData: BatchLinkRequest;
  cookie: unknown;
}
