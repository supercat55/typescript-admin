import React, { PureComponent, Fragment } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { connect } from 'dva';
import router from 'umi/router';
import { Row, Col, Button } from 'antd';
import PageWrapper from '@/components/PageWrapper';
import PageLoading from '@/components/PageLoading';
import StandardTable from '@/components/StandardTable';
import FooterToolbar from '@/components/FooterToolbar';
import { StateType } from './model';
import { GetGlobalToken } from '@/utils/cache';
import { spliceDownloadUrl } from '@/utils/utils';
import { EXPORT_CALL_BILL_DETAIL_DATA } from '@/utils/url';

interface IProps extends StateType {
  dispatch: Dispatch<AnyAction>;
  match?: any;
  pageLoading: boolean;
  allFeeTypeList: any[];
  allBillList: any[];
  allBillTotal: number;
}

interface IState {
  id: string;
  pageNum: number;
  pageSize: number;
}

@connect(({ loading, paymentCall }) => ({
  billCallDetail: paymentCall.billCallDetail,
  pageLoading: loading.effects['paymentCall/getBillCallDetail'],
}))
class PaymentCallDetailPage extends PureComponent<IProps, IState> {
  state: IState = {
    id: this.props.match.params && this.props.match.params.id,
    pageNum: 1,
    pageSize: 10,
  }

  private columns = [
    { title: '商户编号', dataIndex: 'merchantId', key: 'merchantId' },
    { title: '商户名称', dataIndex: 'merchantName', key: 'merchantName' },
    { title: '小区名称', dataIndex: 'communityName', key: 'communityName' },
    { title: '缴费地址', dataIndex: 'address', key: 'address' },
    { title: '账单名称', dataIndex: 'billName', key: 'billName' },
    { title: '账单金额', dataIndex: 'billAmount', key: 'billAmount' },
    { title: '已缴金额', dataIndex: 'paidAmount', key: 'paidAmount' },
    { title: '待缴金额', dataIndex: 'unpaidAmount', key: 'unpaidAmount' },
    { title: '催缴次数', dataIndex: 'callTimes', key: 'callTimes' },
    { title: '账单编号', dataIndex: 'billNum', key: 'billNum' },
    { title: '房主姓名', dataIndex: 'ownerName', key: 'ownerName' },
    { title: '房主电话', dataIndex: 'ownerPhone', key: 'ownerPhone' },
    { title: '账单生成时间', dataIndex: 'createTime', key: 'createTime' },
    { title: '账单状态', dataIndex: 'statusDesc', key: 'statusDesc', width: 120, fixed: 'right' },
  ]

  componentDidMount() {
    this.handleSearchDetail();
  }


  handleSearchDetail = () => {
    const { dispatch } = this.props;
    const { id, pageNum, pageSize } = this.state;

    const params = {
      callId: id,
      pageNum,
      pageSize,
    };

    dispatch({
      type: 'paymentCall/getBillCallDetail',
      payload: params
    })
  }

  handleExport = () => {
    const { id } = this.state;
    const url = EXPORT_CALL_BILL_DETAIL_DATA;

    const params = {
      token: GetGlobalToken(),
      callId: id
    };

    const exportUrl = spliceDownloadUrl(url, params);
    window.open(exportUrl);
  }
  
  handleTabelChange = pagination => {
    this.setState({
      pageNum: pagination.current
    }, this.handleSearchDetail)
  }

  handleCancel = () => {
    router.goBack();
  }

  render() {
    const { pageNum, pageSize } = this.state;
    const { billCallDetail, pageLoading } = this.props;
    
    const { list = [], total = 0, merchantName = '', callTime = '', userName = '', callCount = 0 } = billCallDetail;
    
    const pagination = {
      total,
      current: pageNum,
      pageSize,
    };

    return (
      <PageWrapper 
        title='详情'
        showBack
        customBreadcrumbmap={[
          { name: '缴费管理', url: '' },
          { name: '催缴管理', url: '/payment/call' },
          { name: '详情' },
        ]}
      >
        {
          billCallDetail && !pageLoading ?
          <Fragment>
            <Row type="flex" justify="space-between" style={{ height: 30 }}>
              <Col>商户名称：{merchantName}</Col>
              <Col>催缴时间：{callTime}</Col>
              <Col>催缴人：{userName}</Col>
              <Col>催缴条数：{callCount}</Col>
            </Row>
            <StandardTable
              rowKey={'id'}
              columns={this.columns}
              dataSource={list}
              pagination={pagination}
              onChange={this.handleTabelChange}
              scroll={{ x: 2000 }}
            />
          </Fragment> :
          <PageLoading/>
        }
        <FooterToolbar>
          <Button type="primary" onClick={this.handleExport}>导出</Button>
          <Button onClick={this.handleCancel}>返回</Button>
        </FooterToolbar>
      </PageWrapper>
    )
  }
};


export default PaymentCallDetailPage
