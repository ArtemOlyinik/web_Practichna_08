export const STORE_CONFIG = 'STORE_CONFIG';

export interface StoreConfig {
  storeName: string;
  defaultCurrency: string;
  taxPercent: number;
}

export const storeConfig: StoreConfig = {
  storeName: 'AutoParts Store',
  defaultCurrency: 'UAH',
  taxPercent: 5,
};
