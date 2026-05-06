// ==============================================================================
// UPDATE LEAD DTO (Partial Updates)
// ==============================================================================
// Data transfer object for partial lead updates, inheriting validation 
// rules from the primary creation schema.
// ==============================================================================

import { PartialType } from '@nestjs/mapped-types';
import { CreateLeadDto } from './create-lead.dto';

import { IsOptional, IsNumber } from 'class-validator';

// 1. [VALIDATION] Enable partial validation using the CreateLeadDto properties
export class UpdateLeadDto extends PartialType(CreateLeadDto) {
  @IsOptional()
  @IsNumber()
  version?: number;
}
