import React, { PureComponent } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { connect } from 'dva';
import router from 'umi/router';
import { Spin, Button } from 'antd';
import PageWrapper from '@/components/PageWrapper';
import StandardTable from '@/components/StandardTable';
import FooterToolbar from '@/components/FooterToolbar';
import { StateType } from './model';
import { GetGlobalToken } from '@/utils/cache';
import { spliceDownloadUrl } from '@/utils/utils';
import { EXPORT_CODE_REPORT_DETAIL } from '@/utils/url';

interface IProps extends StateType {
  dispatch: Dispatch<AnyAction>;
  match?: any;
  pageLoading: boolean;
}

interface IState {
  id: string;
}

@connect(({ loading, report }) => ({
  communityCodeCollectionDetail: report.communityCodeCollectionDetail,
  pageLoading: loading.effects['report/getCommunityCodeCollectionDetail'],
}))
class CommunityCodeCollectionDetail extends PureComponent<IProps, IState> {
  state: IState = {
    id: this.props.match.params && this.props.match.params.id,
  }

  private columns = [
    { title: '支付订单号', dataIndex: 'orderNo', key: 'orderNo' },
    { title: '订单金额', dataIndex: 'amount', key: 'amount' },
    { title: '优惠金额', dataIndex: 'disAmount', key: 'disAmount' },
    { title: '支付金额', dataIndex: 'receiptAmount', key: 'receiptAmount' },
    { title: '订单创建时间', dataIndex: 'orderDatetime', key: 'orderDatetime' },
    { title: '订单支付时间', dataIndex: 'paymentTime', key: 'paymentTime' },
    { title: '支付手机号', dataIndex: 'payPhone', key: 'payPhone' },
  ]

  componentDidMount() {
    this.handleSearchDetail();
  }

  handleSearchDetail = async() => {
    const { dispatch } = this.props;
    const { id } = this.state;

    dispatch({
      type: 'report/getCommunityCodeCollectionDetail',
      payload: {
        qRCodeId: id
      }
    })
  }

  handleExport = () => {
    const { id } = this.state;
    const url = EXPORT_CODE_REPORT_DETAIL;

    const params = {
      token: GetGlobalToken(),
      qRCodeId: id
    };

    const exportUrl = spliceDownloadUrl(url, params);
    window.open(exportUrl);
  }

  handleCancel = () => {
    router.goBack();
  }

  render() {
    const { pageLoading, communityCodeCollectionDetail } = this.props;

    return (
      <PageWrapper 
        title='查看明细'
        showBack
        customBreadcrumbmap={[
          { name: '报表管理', url: '' },
          { name: '社区码收款报表', url: '/report/community-code-collection' },
          { name: '查看明细' },
        ]}
      >
        <Spin spinning={pageLoading !== undefined ? pageLoading : false}>
          <Button 
            type='primary'
            style={{ marginBottom: '30px' }} 
            onClick={this.handleExport}
          >
            导出
          </Button>

          <StandardTable
            rowKey={'id'}
            columns={this.columns}
            dataSource={communityCodeCollectionDetail}
            pagination={false}
          />
          <FooterToolbar>
            <Button onClick={this.handleCancel}>返回</Button>
          </FooterToolbar>
        </Spin>
      </PageWrapper>
    )
  }
};


export default CommunityCodeCollectionDetail
