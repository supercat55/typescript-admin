import * as React from 'react';
import { Card, Tooltip, Icon, Button } from 'antd';
import styles from './index.scss'

interface IProps {
  info: any;
  actionGarden: (id: string, type: string) => void
}

const GardenCardComponent: React.FC<IProps> = props => {
  const { info, actionGarden } = props;

  return (
    <Card 
      style={{ width: 220 }} 
      bodyStyle={{ padding: 0 }}
      hoverable={true}
      actions={[
        <Icon type="edit" key={0} onClick={() => actionGarden(info.id, 'edit')}/>,
        <Icon type="setting" key={1} onClick={() => actionGarden(info.id, 'recover')}/>, 
      ]}
    >
      <div className={styles.content}>
        <Tooltip title={info.name}>
          <span className={styles.name}>{info.name}</span>
        </Tooltip>
        <Tooltip title={info.address}>
          <span className={styles.address}>{info.address}</span>
        </Tooltip>
        <Button disabled={info.status !== 1} onClick={() => actionGarden(info.id, 'detail')}>进入园区</Button>
      </div>
    </Card>
  )
}

export default GardenCardComponent;
