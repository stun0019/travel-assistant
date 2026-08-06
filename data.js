"use strict";

(function initializeTravelData(global) {
  const STORAGE_KEY =
    "seoul-travel-assistant-v01";

  function createId() {
    if (global.crypto?.randomUUID) {
      return global.crypto.randomUUID();
    }

    return (
      `${Date.now()}-` +
      Math.random()
        .toString(16)
        .slice(2)
    );
  }

  function createDefaultState() {
    return {
      departureDate: "2026-11-27",

      tripDays: 5,

      totalBudget: 30000,

      exchangeRate: 43,

      todos: [
        {
          id: createId(),
          text: "確認護照有效期限",
          completed: false
        },
        {
          id: createId(),
          text: "訂購機票",
          completed: false
        },
        {
          id: createId(),
          text: "預訂住宿",
          completed: false
        },
        {
          id: createId(),
          text: "購買韓國 eSIM",
          completed: false
        },
        {
          id: createId(),
          text: "準備 T-money 交通卡",
          completed: false
        }
      ],

      itinerary: [
        {
          id: createId(),
          day: 1,
          time: "09:30",
          title: "抵達仁川國際機場"
        },
        {
          id: createId(),
          day: 1,
          time: "12:00",
          title: "搭乘 AREX 前往首爾市區"
        },
        {
          id: createId(),
          day: 1,
          time: "15:00",
          title: "飯店入住與附近散步"
        }
      ],

      expenses: [],

      places: [
        {
          id: createId(),
          name: "景福宮",
          category: "景點",
          note:
            "可安排韓服體驗，建議上午前往。"
        },
        {
          id: createId(),
          name: "聖水洞",
          category: "咖啡",
          note:
            "咖啡廳、快閃店與選物店集中。"
        },
        {
          id: createId(),
          name: "弘大",
          category: "購物",
          note:
            "適合安排晚餐、逛街與夜間活動。"
        }
      ]
    };
  }

  global.SeoulTravelData = Object.freeze({
    STORAGE_KEY,
    createId,
    createDefaultState
  });
})(window);
