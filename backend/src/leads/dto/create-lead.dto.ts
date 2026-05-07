// ==============================================================================
// CREATE LEAD DTO (Data Validation)
// ==============================================================================
// Data transfer object defining the strict structure and validation 
// constraints for new lead ingestion.
// ==============================================================================

import { IsString, IsNotEmpty, IsEmail, IsOptional, IsNumber, Min, IsEnum, Matches, ValidateIf } from 'class-validator';
import { Transform, Type } from 'class-transformer';

// 1. Define enumerations for consistent status and source tracking
export enum LeadStatus { New='New', Contacted='Contacted', Qualified='Qualified', ProposalSent='Proposal Sent', Won='Won', Lost='Lost' }
export enum LeadSource { Website='Website', Referral='Referral', LinkedIn='LinkedIn', ColdEmail='Cold Email', Event='Event' }

export class CreateLeadDto {
  // 2. [VALIDATION] Enforce required contact information
  @IsString() @IsNotEmpty() name: string;
  @IsOptional() @IsString() company?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() 
  @IsString() 
  @Matches(/^(?:\+94|94|0)\d{9}$/, { message: 'phone must be a valid Sri Lankan phone number (e.g. 0771234567 or +94771234567)' })
  phone?: string;
  
  // 3. [VALIDATION] Ensure source and status match predefined system enums
  @IsOptional() @IsEnum(LeadSource) source?: LeadSource;
  @IsOptional() @IsEnum(LeadStatus) status?: LeadStatus;
  
  // 4. [FINANCIAL] Validate deal value as a non-negative number
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) deal_value?: number;
  
  // 5. [SECURITY] Validate assigned staff member ID format
  // Use ValidateIf to explicitly skip validation for empty strings, nulls, or undefined values.
  // This ensures IsUUID only runs when a non-empty value is actually provided.
  @IsOptional()
  @ValidateIf((o) => o.assigned_to !== '' && o.assigned_to !== null && o.assigned_to !== undefined)
  // Using a lenient regex to allow any validly formatted UUID string regardless of version/variant.
  @Matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/, { 
    message: 'assigned_to must be a valid UUID string' 
  })
  @Transform(({ value }) => (value === '' || value === null ? undefined : value))
  assigned_to?: string;
}
