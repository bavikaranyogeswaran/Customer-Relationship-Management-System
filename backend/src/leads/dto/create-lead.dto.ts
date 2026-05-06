import { IsString, IsNotEmpty, IsEmail, IsOptional, IsNumber, Min, IsEnum, IsUUID } from 'class-validator';

export enum LeadStatus { New='New', Contacted='Contacted', Qualified='Qualified', ProposalSent='Proposal Sent', Won='Won', Lost='Lost' }
export enum LeadSource { Website='Website', Referral='Referral', LinkedIn='LinkedIn', ColdEmail='Cold Email', Event='Event' }

export class CreateLeadDto {
  @IsString() @IsNotEmpty() name: string;
  @IsOptional() @IsString() company?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsEnum(LeadSource) source?: LeadSource;
  @IsOptional() @IsEnum(LeadStatus) status?: LeadStatus;
  @IsOptional() @IsNumber() @Min(0) deal_value?: number;
  @IsOptional() @IsUUID() assigned_to?: string;
}
