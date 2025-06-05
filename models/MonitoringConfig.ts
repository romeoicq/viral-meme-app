export interface IMonitoringConfig {
  _id?: string;
  name: string;
  platforms: string[];
  keywords: string[];
  categories: string[];
  urgencyThreshold: number;
  opportunityThreshold: number;
  alertFrequency: 'realtime' | 'hourly' | 'daily';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MonitoringConfig = {
  findOne: async (query: any) => {
    return null; // Will be implemented with mock data
  },
  find: async (query: any) => {
    return []; // Will be implemented with mock data
  }
};

export default MonitoringConfig;
