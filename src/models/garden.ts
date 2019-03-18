import { queryGardenList } from '@/services/garden';

export default {
  namespace: 'garden',

  state: {
    gardenList: [],
  },

  effects: {
    *getGardenList({ payload }, { call, put }) {
      let response = yield call(queryGardenList, payload);

      if (response && Number(response.code) === 200) {
        yield put({
          type: 'save',
          payload: response.data
        })
      }
    }
  },

  reducers: {
    save(state: any, action: any) {
      return {
        ...state,
        gardenList: convertGardenList(JSON.parse(action.payload).gardens)
      };
    },
  },
};

function convertGardenList(list: any): any[] {
  let result = [];

  for(let i in list) {
    let item = list[i];

    result.push({
      id: item.id,
      name: item.garden_name,
      address: item.province + item.area + item.street,
      status: parseInt(item.is_valid),
    })
  }

  return result
}
