// ==============================================================================
// UPDATE LEAD DTO (Partial Updates)
// ==============================================================================
// Data transfer object for partial lead updates, inheriting validation 
// rules from the primary creation schema.
// ==============================================================================

import { PartialType } from '@nestjs/mapped-types';
import { CreateLeadDto } from './create-lead.dto';

// 1. [VALIDATION] Enable partial validation using the CreateLeadDto properties
// Allows clients to update only specific fields of a lead record
export class UpdateLeadDto extends PartialType(CreateLeadDto) {}
