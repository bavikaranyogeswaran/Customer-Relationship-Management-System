// ==============================================================================
// CREATE LEAD DTO (Data Validation)
// ==============================================================================
// Data transfer object defining the strict structure and validation 
// constraints for new lead ingestion.
// ==============================================================================

import { IsString, IsNotEmpty, IsEmail, IsOptional, IsNumber, Min, IsEnum, IsUUID } from 'class-validator';

// 1. Define enumerations for consistent status and source tracking
export enum LeadStatus { New='New', Contacted='Contacted', Qualified='Qualified', ProposalSent='Proposal Sent', Won='Won', Lost='Lost' }
export enum LeadSource { Website='Website', Referral='Referral', LinkedIn='LinkedIn', ColdEmail='Cold Email', Event='Event' }

export class CreateLeadDto {
  // 2. [VALIDATION] Enforce required contact information
  @IsString() @IsNotEmpty() name: string;
  @IsOptional() @IsString() company?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() phone?: string;
  
  // 3. [VALIDATION] Ensure source and status match predefined system enums
  @IsOptional() @IsEnum(LeadSource) source?: LeadSource;
  @IsOptional() @IsEnum(LeadStatus) status?: LeadStatus;
  
  // 4. [FINANCIAL] Validate deal value as a non-negative number
  @IsOptional() @IsNumber() @Min(0) deal_value?: number;
  
  // 5. [SECURITY] Validate assigned staff member ID format
  @IsOptional() @IsUUID() assigned_to?: string;
}
