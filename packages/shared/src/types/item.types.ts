import { ItemType, Rarity, BindType } from '../enums';

export interface ItemTemplate {
  id: string;
  name: string;
  type: ItemType;
  rarity: Rarity;
  description: string;
  icon: string;
  maxStack: number;
  sellable: boolean;
  sellPrice: number;
  bindType: BindType;
  usable: boolean;
  useEffect?: ItemUseEffect;
  extraData?: Record<string, any>;
}

export interface ItemUseEffect {
  type: 'gain_currency' | 'gain_exp' | 'gain_card' | 'heal' | 'buff';
  value: number;
  currencyType?: string;
}

export interface Item {
  id: string;
  templateId: string;
  playerId: string;
  count: number;
  bindType: BindType;
  createdAt: Date;
  updatedAt: Date;
}

export interface Inventory {
  playerId: string;
  items: Item[];
  capacity: number;
}

export interface DropItem {
  itemId: string;
  count: number;
  probability: number;
  bindType: BindType;
}
