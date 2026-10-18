
export type CampaignEmail = {
    subject: string;
    messageBodyHtml: string;
  };
  
  export type CampaignRequest = {
    recipients: string[];
    email: CampaignEmail;
  };
  
  export type Campaign = {
    id: string;
    userId: string;
    recipients: string[];
    email: CampaignEmail;
    status: "pending";
  };
  
  export interface CampaignRepository {
    createCampaign(userId: string, request: CampaignRequest): Promise<Campaign>;
  }
  
  export class CreateCampaign {
    constructor(private readonly campaigns: CampaignRepository) {}
  
    async execute(userId: string, request: CampaignRequest): Promise<Campaign> {
      if (request.recipients.length === 0)
        throw new Error("At least one recipient is required.");
  
      return await this.campaigns.createCampaign(userId, request);
    }
  }