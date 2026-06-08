import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ItemType, Rarity } from '@game/shared';
import Empty from '../components/Empty';

const mockItems = [
  { id: 'item_1', templateId: 'tpl_1', name: '初级经验药水', type: ItemType.CONSUMABLE, rarity: Rarity.N, icon: '🧪', count: 25, description: '使用后获得1000点经验值', effect: '获得1000经验', source: '副本掉落、活动奖励', usable: true },
  { id: 'item_2', templateId: 'tpl_2', name: '中级经验药水', type: ItemType.CONSUMABLE, rarity: Rarity.R, icon: '🧪', count: 12, description: '使用后获得5000点经验值', effect: '获得5000经验', source: '精英副本、活动奖励', usable: true },
  { id: 'item_3', templateId: 'tpl_3', name: '高级经验药水', type: ItemType.CONSUMABLE, rarity: Rarity.SR, icon: '🧪', count: 5, description: '使用后获得20000点经验值', effect: '获得20000经验', source: 'BOSS掉落、活动奖励', usable: true },
  { id: 'item_4', templateId: 'tpl_4', name: '突破石', type: ItemType.MATERIAL, rarity: Rarity.R, icon: '💎', count: 18, description: '卡牌突破所需的稀有材料', effect: '突破材料', source: '精英副本、商店购买', usable: false },
  { id: 'item_5', templateId: 'tpl_5', name: '高级突破石', type: ItemType.MATERIAL, rarity: Rarity.SR, icon: '💎', count: 3, description: '高级卡牌突破所需的珍贵材料', effect: '高级突破材料', source: 'BOSS副本、活动奖励', usable: false },
  { id: 'item_6', templateId: 'tpl_6', name: '强化石', type: ItemType.MATERIAL, rarity: Rarity.N, icon: '🪨', count: 56, description: '装备强化所需的基础材料', effect: '强化材料', source: '普通副本、商店购买', usable: false },
  { id: 'item_7', templateId: 'tpl_7', name: '生命药水', type: ItemType.CONSUMABLE, rarity: Rarity.N, icon: '❤️', count: 30, description: '战斗中回复500点生命值', effect: '回复500生命', source: '商店购买、活动奖励', usable: true },
  { id: 'item_8', templateId: 'tpl_8', name: '攻击药剂', type: ItemType.CONSUMABLE, rarity: Rarity.R, icon: '⚔️', count: 8, description: '战斗中攻击力提升10%，持续3回合', effect: '攻击+10% (3回合)', source: '活动奖励、商店购买', usable: true },
  { id: 'item_9', templateId: 'tpl_9', name: '铜钥匙', type: ItemType.MATERIAL, rarity: Rarity.N, icon: '🔑', count: 15, description: '可以开启铜宝箱', effect: '开启铜宝箱', source: '普通副本掉落', usable: false },
  { id: 'item_10', templateId: 'tpl_10', name: '银钥匙', type: ItemType.MATERIAL, rarity: Rarity.R, icon: '🔑', count: 6, description: '可以开启银宝箱', effect: '开启银宝箱', source: '精英副本掉落', usable: false },
  { id: 'item_11', templateId: 'tpl_11', name: '金钥匙', type: ItemType.MATERIAL, rarity: Rarity.SR, icon: '🔑', count: 2, description: '可以开启金宝箱', effect: '开启金宝箱', source: 'BOSS副本掉落', usable: false },
  { id: 'item_12', templateId: 'tpl_12', name: '新手长剑', type: ItemType.EQUIPMENT, rarity: Rarity.N, icon: '🗡️', count: 1, description: '新手使用的长剑，攻击力+50', effect: '攻击+50', source: '新手任务', usable: false },
  { id: 'item_13', templateId: 'tpl_13', name: '精钢护甲', type: ItemType.EQUIPMENT, rarity: Rarity.R, icon: '🛡️', count: 1, description: '精炼钢材打造的护甲，防御力+100', effect: '防御+100', source: '副本掉落', usable: false },
  { id: 'item_14', templateId: 'tpl_14', name: '疾风之靴', type: ItemType.EQUIPMENT, rarity: Rarity.SR, icon: '👟', count: 1, description: '蕴含风元素的靴子，速度+80', effect: '速度+80', source: '精英副本掉落', usable: false },
  { id: 'item_15', templateId: 'tpl_15', name: '金币袋', type: ItemType.CONSUMABLE, rarity: Rarity.N, icon: '💰', count: 10, description: '打开后获得1000金币', effect: '获得1000金币', source: '活动奖励', usable: true },
];

const tabOptions = [
  { value: 'all', label: '全部', icon: '📦' },
  { value: ItemType.MATERIAL, label: '材料', icon: '🧱' },
  { value: ItemType.CONSUMABLE, label: '消耗品', icon: '🧪' },
  { value: ItemType.EQUIPMENT, label: '装备', icon: '⚔️' },
];

const rarityColors: Record<Rarity, string> = {
  [Rarity.N]: 'from-gray-500 to-gray-400',
  [Rarity.R]: 'from-blue-600 to-blue-400',
  [Rarity.SR]: 'from-purple-600 to-purple-400',
  [Rarity.SSR]: 'from-amber-500 to-yellow-400',
  [Rarity.UR]: 'from-red-600 via-orange-500 to-yellow-400',
};

const rarityBgColors: Record<Rarity, string> = {
  [Rarity.N]: 'bg-gray-500/20',
  [Rarity.R]: 'bg-blue-500/20',
  [Rarity.SR]: 'bg-purple-500/20',
  [Rarity.SSR]: 'bg-amber-500/20',
  [Rarity.UR]: 'bg-red-500/20',
};

function InventoryPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [useCount, setUseCount] = useState(1);
  const [showUseAnimation, setShowUseAnimation] = useState(false);

  const filteredItems = activeTab === 'all'
    ? mockItems
    : mockItems.filter(item => item.type === activeTab);

  const handleUseItem = () => {
    if (!selectedItem || !selectedItem.usable) return;
    setShowUseAnimation(true);
    setTimeout(() => {
      setShowUseAnimation(false);
      setSelectedItem(null);
      setUseCount(1);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-700">
        <div className="p-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white hover:bg-slate-700 transition-colors"
          >
            ←
          </button>
          <h1 className="text-lg font-bold text-white flex-1 text-center pr-10">
            背包
          </h1>
        </div>

        <div className="flex border-b border-slate-700">
          {tabOptions.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex-1 py-3 text-sm font-medium transition-all relative ${
                activeTab === tab.value
                  ? 'text-indigo-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
              {activeTab === tab.value && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-indigo-400 rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {filteredItems.length === 0 ? (
          <Empty
            icon="📦"
            title="暂无物品"
            description="这个分类下还没有物品"
          />
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onClick={() => setSelectedItem(item)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="sticky bottom-20 bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent p-4 pt-8">
        <div className="game-card p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">背包容量</span>
            <span className="text-white">
              {mockItems.length} / 100
            </span>
          </div>
          <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
              style={{ width: `${(mockItems.length / 100) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="game-card p-6 w-full max-w-sm animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-16 h-16 rounded-xl ${rarityBgColors[selectedItem.rarity]} flex items-center justify-center text-4xl border-2 border-opacity-30`}
                style={{
                  borderColor: selectedItem.rarity === Rarity.UR ? '#ef4444' :
                    selectedItem.rarity === Rarity.SSR ? '#f59e0b' :
                    selectedItem.rarity === Rarity.SR ? '#a855f7' :
                    selectedItem.rarity === Rarity.R ? '#3b82f6' : '#9ca3af'
                }}
              >
                {selectedItem.icon}
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-bold bg-gradient-to-r ${rarityColors[selectedItem.rarity]} bg-clip-text text-transparent`}>
                  {selectedItem.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${rarityBgColors[selectedItem.rarity]} text-white`}>
                    {selectedItem.rarity}
                  </span>
                  <span className="text-slate-400 text-sm">
                    数量: {selectedItem.count}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-900/50 rounded-xl p-3">
                <h4 className="text-slate-400 text-xs mb-1">物品描述</h4>
                <p className="text-white text-sm">{selectedItem.description}</p>
              </div>

              <div className="bg-slate-900/50 rounded-xl p-3">
                <h4 className="text-slate-400 text-xs mb-1">物品效果</h4>
                <p className="text-green-400 text-sm">{selectedItem.effect}</p>
              </div>

              <div className="bg-slate-900/50 rounded-xl p-3">
                <h4 className="text-slate-400 text-xs mb-1">获取途径</h4>
                <p className="text-slate-300 text-sm">{selectedItem.source}</p>
              </div>
            </div>

            {selectedItem.usable && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-400 text-sm">使用数量</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setUseCount(Math.max(1, useCount - 1))}
                      className="w-7 h-7 rounded-full bg-slate-700 text-white flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="text-white font-medium w-8 text-center">{useCount}</span>
                    <button
                      onClick={() => setUseCount(Math.min(selectedItem.count, useCount + 1))}
                      className="w-7 h-7 rounded-full bg-slate-700 text-white flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleUseItem}
                  disabled={showUseAnimation}
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white font-medium shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all active:scale-98 disabled:opacity-50"
                >
                  {showUseAnimation ? '使用中...' : '使用'}
                </button>
              </div>
            )}

            <button
              onClick={() => setSelectedItem(null)}
              className="w-full mt-3 py-2 game-btn-secondary"
            >
              关闭
            </button>
          </div>
        </div>
      )}

      {showUseAnimation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="text-center animate-ping">
            <div className="text-6xl mb-2">{selectedItem?.icon}</div>
            <div className="text-green-400 font-bold text-xl">使用成功！</div>
          </div>
        </div>
      )}
    </div>
  );
}

function ItemCard({ item, onClick }: { item: any; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="relative aspect-square rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col items-center justify-center cursor-pointer transition-all hover:border-indigo-500/50 hover:scale-105 active:scale-95"
    >
      <div className="text-3xl mb-1">{item.icon}</div>
      <div className="text-white text-xs font-medium truncate w-full px-1 text-center">
        {item.name}
      </div>
      <div className="absolute top-1 right-1 min-w-[20px] h-5 bg-black/60 rounded-full px-1 flex items-center justify-center">
        <span className="text-white text-xs font-medium">{item.count}</span>
      </div>
      <div className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-xl bg-gradient-to-r ${rarityColors[item.rarity]}`}></div>
    </div>
  );
}

export default InventoryPage;
