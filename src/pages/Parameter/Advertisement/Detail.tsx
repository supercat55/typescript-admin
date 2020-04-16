import React, { PureComponent } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { connect } from 'dva';
import router from 'umi/router';
import { Form, Row, Col, Input, Select, Spin, Button } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { StateType } from './model';
import PageWrapper from '@/components/PageWrapper';
import { submitFormLayout } from '@/utils/config';
import { BANNER_LINK_TYPES } from '@/utils/const';
import styles from './index.scss';

const FormItem = Form.Item;
const Option = Select.Option;

interface IProps extends StateType, FormComponentProps {
  dispatch: Dispatch<AnyAction>;
  match?: any;
  pageLoading: boolean;
}

interface IState {
  id: string;
}

@connect(({ loading }) => ({
  pageLoading: loading.models['advertisement'],
}))
class AdvertisementTemplateDetail extends PureComponent<IProps, IState> {
  state = {
    id: this.props.match.params && this.props.match.params.id,
  }

  componentDidMount() {
    this.init()
  }

  init = async() => {
    const { id } = this.state;
    const { dispatch } = this.props;

    const result = await dispatch({
      type: 'advertisement/getAdvertisementDetail',
      payload: { id }
    })

    this.handleFullBaseInfo(result)
  }

  handleFullBaseInfo = result => {
    const { form } = this.props;
    const { list } = result;
    const newBannerList = list.map(item => ({...item}))
    
    const newDetail = {
      bannerList: newBannerList,
    }
    const detail = Object.assign(newDetail, result)

    Object.keys(form.getFieldsValue()).forEach(key => {
      let obj = {};
      obj[key] = detail[key];
      form.setFieldsValue(obj);
    });
  }

  handleCancel = () => {
    router.goBack();
  }

  render() {
    const { pageLoading, form: { getFieldDecorator, getFieldValue } } = this.props;

    getFieldDecorator('bannerList', { initialValue: [] })
    getFieldDecorator('abStyle', { initialValue: 1 })
    const bannerList = getFieldValue('bannerList');
    const abStyle = getFieldValue('abStyle')
    console.log("TCL: AdvertisementTemplateDetail -> render -> abStyle", abStyle)

    return (
      <PageWrapper 
        title={'广告位模版详情'}
        showBack
        customBreadcrumbmap={[
          { name: '参数管理', url: '' },
          { name: '广告位模版管理', url: '/parameter/advertisement' },
          { name: '广告位模版详情' },
        ]}
      >
        <Spin spinning={pageLoading !== undefined ? pageLoading : false}>
          <div className={styles.container}>
            <Form>
              <FormItem label={'模版名称'}>
                {getFieldDecorator('templateName')(
                  <Input disabled/>
                )}
              </FormItem>
              <div className={`${abStyle === 1 ? styles.one : abStyle === 2 ? styles.two : styles.three}`}>
                {
                  bannerList.map((item, index) => (
                    <FormItem label={`图片${index + 1}`} key={item.id}>
                      {getFieldDecorator(`list[${index}].url`)(
                        <div className={`ad-upload-item-${index + 1}`}>
                          <img src={item.url} className={`ad-upload-image-${index + 1}`}/>
                        </div>
                      )}
                    </FormItem>
                  ))
                }
              </div>
              {
                bannerList.map((item, index) => (
                  <Row type="flex" justify="space-between" key={item.id}>
                    <Col span={2}>
                      <FormItem>
                        {getFieldDecorator(`list[${index}].linkType`, {
                          initialValue: item.linkType
                        })(
                          <Select style={{ width: '100px' }} disabled>
                            {BANNER_LINK_TYPES.map(item => (
                              <Option value={item.value} key={item.value}>{item.label}</Option>
                            ))}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={21}>
                      <FormItem>
                        {getFieldDecorator(`list[${index}].linkUrl`, {
                          initialValue: item.linkUrl ? item.linkUrl : '',
                        })(
                          <Input addonBefore={<span>{`链接${index + 1}`}</span>} disabled/>
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                ))
              }
              <FormItem {...submitFormLayout}>
                <Button type="primary" onClick={this.handleCancel}>
                  返回
                </Button>
              </FormItem>
            </Form>
          </div>
        </Spin>
      </PageWrapper>
    )
  }
};

export default Form.create()(AdvertisementTemplateDetail);
