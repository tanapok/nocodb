import {
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DataApiLimiterGuard } from '~/guards/data-api-limiter.guard';
import { GlobalGuard } from '~/guards/global/global.guard';
import { Acl } from '~/middlewares/extract-ids/extract-ids.middleware';
import { TenantContext } from '~/decorators/tenant-context.decorator';
import type { NcContext, NcRequest } from '~/interface/config';
import { DataEnhancedV1Service } from '~/services/enhanced-v1/data-enhanced-v1.service';
import { PREFIX_ENHANCED_V1_DATA } from '~/constants/controllers';
import type { BatchLinkRequest, BatchLinkResponse } from '~/services/enhanced-v1/data-enhanced-v1.types';

@Controller()
@UseGuards(DataApiLimiterGuard, GlobalGuard)
export class DataEnhancedV1Controller {
  constructor(
    protected readonly dataEnhancedV1Service: DataEnhancedV1Service,
  ) {}

  @Post(`${PREFIX_ENHANCED_V1_DATA}/:tableId/links/:linkFieldId/records`)
  @HttpCode(200)
  @Acl('nestedDataLink')
  async batchLinkRecords(
    @TenantContext() context: NcContext,
    @Req() req: NcRequest,
    @Param('tableId') tableId: string,
    @Param('linkFieldId') linkFieldId: string,
    @Body() body: BatchLinkRequest,
  ): Promise<BatchLinkResponse> {
    context.cache = true;
    return await this.dataEnhancedV1Service.batchLinkRecords(context, {
      modelId: tableId,
      columnId: linkFieldId,
      linkData: body,
      cookie: req,
    });
  }
}
