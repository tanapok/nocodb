import type { LinkToAnotherRecordColumn } from '~/models';
import { Column, Model, Source } from '~/models';
import { Injectable, Logger } from '@nestjs/common';
import type { NcContext } from '~/interface/config';
import { NcError } from '~/helpers/catchError';
import { DataTableService } from '~/services/data-table.service';
import NcConnectionMgrv2 from '~/utils/common/NcConnectionMgrv2';
import { LTARColsUpdater } from '~/db/BaseModelSqlv2/ltar-cols-updater';
import type { BatchLinkRecordsParams, BatchLinkResponse } from './data-enhanced-v1.types';

@Injectable()
export class DataEnhancedV1Service {
  constructor(protected readonly dataTableService: DataTableService) {}

  logger = new Logger(DataEnhancedV1Service.name);

  /**
   * Batch link multiple records to their related records
   */
  async batchLinkRecords(
    context: NcContext,
    param: BatchLinkRecordsParams,
  ): Promise<BatchLinkResponse> {
    const { modelId, columnId, linkData, cookie } = param;

    const normalizedLinkData = Array.isArray(linkData) ? linkData : [linkData];

    if (normalizedLinkData.length === 0) {
      NcError.get(context).badRequest('Link data cannot be empty');
    }

    const allRefRowIds = normalizedLinkData.flatMap((item) => item.ids);
    this.dataTableService.validateIds(context, allRefRowIds);

    const { model, view } = await this.dataTableService.getModelAndView(
      context,
      { modelId },
    );

    if (!model) {
      NcError.get(context).tableNotFound(modelId);
    }

    const source = await Source.get(context, model.source_id);

    const baseModel = await Model.getBaseModelSQL(context, {
      id: model.id,
      viewId: view?.id,
      dbDriver: await NcConnectionMgrv2.get(source),
    });

    const column = await this.dataTableService.getColumn(context, {
      modelId,
      columnId,
    });

    await baseModel.model.getColumns(baseModel.context);

    if (!(column.colOptions as LinkToAnotherRecordColumn)) {
      NcError.get(context).fieldNotFound(columnId);
    }

    const linkDataPayload = {
      data: normalizedLinkData.map((item) => ({
        rowId: String(item.recordId),
        links: item.ids.map((id) => String(id)),
      })),
    };

    await LTARColsUpdater({
      baseModel,
      logger: this.logger,
    }).updateLTARCol({
      linkDataPayload,
      col: column,
      cookie,
      trx: baseModel.dbDriver,
    });

    return { success: true };
  }
}
