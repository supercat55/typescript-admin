import React, { PureComponent, Dispatch } from 'react';
import { Card } from 'antd';
import { connect } from 'dva';
import router from 'umi/router';
import GardenCard from '@/components/GardenCard';
import { GetGlobalToken, GetPropertyInfo } from '@/utils/cache';
import styles from './Index.scss'
import { string } from 'prop-types';

export interface GardenListProps {
  dispatch: Dispatch<any>;
  gardenList: any[]
}

interface GardenLisyParams {
  token: string;
  garden_name?: string;
}

interface UpdateTokenParams {
  token: string;
  role_id: string;
  property_id: string;
  garden_id: string;
}

@connect(({ garden  }) => ({
  gardenList: garden.gardenList
}))
class GardenListPage extends PureComponent<GardenListProps, any> {
  componentDidMount() {
    const { dispatch } = this.props;

    const params: GardenLisyParams = {
      token: GetGlobalToken()
    }
    dispatch({
      type: 'garden/getGardenList',
      payload: params
    })
  }

  public handleItemAction = (id, type) => {
    const { dispatch } = this.props;

    const params: UpdateTokenParams = {
      token: GetGlobalToken(),
      role_id: GetPropertyInfo().roleId,
      property_id: GetPropertyInfo().id,
      garden_id: id
    }

    if (type === 'detail') {
      dispatch({
        type: 'login/updateToken',
        payload: params,
        pathname: '/'
      })
    }
  }

  public renderTitle = () => {
    return (
      <div className={styles.title}>
        <span className={styles.titleDesc}>
          物业公司
          </span>
        <span className={styles.subTitleDesc}>
          共
          <i className={styles.gardenCount}>{2}</i>
          个园区
        </span>
      </div>
    )
  }

  render() {
    const { gardenList } = this.props;

    return (
      <div className={styles.main}>
        <Card
          title={this.renderTitle()}
        >
        <div className={styles.content}>
          <ul className={styles.list}>
            {
              gardenList.length && gardenList.map(item => (
                <li key={item.id}>
                  <GardenCard info={item} actionGarden={this.handleItemAction}/>
                </li>
              ))
            }
          </ul>
        </div>
        </Card>
      </div>
    )
  }
};

export default GardenListPage;
