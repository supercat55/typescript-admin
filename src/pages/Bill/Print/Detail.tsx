import React, { PureComponent } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { connect } from 'dva';
import { Button } from 'antd';
import router from 'umi/router';
import PageWrapper from '@/components/PageWrapper';
import StandardTable from '@/components/StandardTable';
import FooterToolbar from '@/components/FooterToolbar';

interface IProps {
  dispatch: Dispatch<AnyAction>;
  match?: any;
  tableLoading: boolean;
  allBillList: any[]
}

interface IState {
  id: string;
}

@connect(({ loading, global }) => ({
  allBillList: global.allBillList,
  tableLoading: loading.effects['global/getAllBillList'],
}))
class BillPrintDetail extends PureComponent<IProps, IState> {
  state: IState = {
    id: this.props.match.params && this.props.match.params.id,
  }

  private ref: any
  
  private columns = [
    { title: '账单名称', dataIndex: 'billName', key: 'billName' },
    { title: '状态', dataIndex: 'statusDesc', key: 'statusDesc' },
    { title: '支付方式', dataIndex: 'payTypeName', key: 'payTypeName'},
    { title: '费用类型', dataIndex: 'feeTypeName', key: 'feeTypeName'},
    { title: '账单金额', dataIndex: 'billAmount', key: 'billAmount' },
    { title: '已缴金额', dataIndex: 'paidAmount', key: 'paidAmount' },
    { title: '待缴金额', dataIndex: 'unpaidAmount', key: 'unpaidAmount' },
    { title: '生成时间', dataIndex: 'createTime', key: 'createTime' },
    { title: '销账时间', dataIndex: 'writeOffTime', key: 'writeOffTime' },
    { title: '说明', dataIndex: 'showDescribtion', key: 'showDescribtion' },
  ]

  componentDidMount() {
    this.handleSearchList();
  }

  handleSearchList = () => {
    const { id } = this.state;
    const { dispatch } = this.props;

    const params = {
      pageNum: 1,
      pageSize: 999,
      houseId: id,
      displayType: 1
    };

    dispatch({
      type: 'global/getAllBillList',
      payload: params
    })
  }

  handleBack = () => {
    router.goBack();
  }

  render() {
    const { allBillList, tableLoading } = this.props;

    return (
      <PageWrapper 
        title='查看'
        showBack
        customBreadcrumbmap={[
          { name: '账单管理', url: '' },
          { name: '单据打印', url: '/bill/print' },
          { name: '查看' },
        ]}
      >
        <StandardTable
          rowKey={'id'}
          bordered
          columns={this.columns}
          dataSource={allBillList}
          loading={tableLoading}
          pagination={false}
        />
        <FooterToolbar>
          <Button onClick={this.handleBack} type='primary'>返回</Button>
        </FooterToolbar>
      </PageWrapper>
    )
  }
};


export default BillPrintDetail
