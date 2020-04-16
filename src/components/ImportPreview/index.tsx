import React, { Component, Fragment } from 'react';
import { Upload, Divider, Icon, message } from 'antd';
import { Column, Table } from 'react-virtualized'
import 'react-virtualized/styles.css';
import REGEX from '@/utils/regex';

const Dragger = Upload.Dragger;

export interface ImportPreviewProps {
  syncImportData: (list: any, name: string) => void;
}

const action = '/api/v1/coreservice/common/upload/uploadExcelReadOnly'
class ImportPreview extends Component<ImportPreviewProps, any> {
  state = {
    fileName: '',
    uploadLoading: false,
    dataSource: [],
    columns: [],
    tableWidth: 0,
  }

  componentDidMount() {
    window.addEventListener('resize', this.resizeWidth)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeWidth)
  }

  resizeWidth = () => {
    this.setState({
      tableWidth: document.querySelector('.import-preview-table-container').clientWidth
    })
  }

  handleBeforeUpload = file => {
    if (!REGEX.FILE_TYPES.test(file.name)) {
      message.warning('上传的文件格式不正确');
      return false
    }

    return true
  }

  handleUploadChange = info => {
    if (info.file.status === 'uploading') {
      this.setState({ uploadLoading: true });
      return;
    }
    if (info.file.status === 'done') {
      this.setState({ uploadLoading: false });

      if (info.file.response.code === 200) {
        this.handlePreviewTable(info.file.response.data, info.file.name);        
      } else {
        message.error(info.file.response.message);
      }
    }
    if (status === 'error') {
      message.error('文件上传出错', 1);

      this.setState({ uploadLoading: false });
    }
  }

  handlePreviewTable = (list, fileName) => {
    const { syncImportData } = this.props;

    syncImportData(list, fileName);

    let columns = [], dataSource = [];

    for (let i in list) {
      let item = list[i];

      if (Number(i) === 0) {
        for (let a in item.list) {
          columns.push({
            title: item.list[a],
            dataIndex: `VALUE${a + 1}`,
            key: `VALUE${a + 1}`,
          })
        }
      } else {
        let row = {
          key: i
        };

        for (let b in item.list) {
          row[`VALUE${b + 1}`] = item.list[b];
        }

        dataSource.push(row);
      }
    }
    
    this.setState({
      columns,
      dataSource
    }, this.resizeWidth)
  }

  render() {
    const { uploadLoading, columns, dataSource, tableWidth } = this.state;
    const previewContainerWidth = dataSource.length ? Object.keys(dataSource[0]).length * 100 : 0;

    return (
      <Fragment>
        <Dragger
          name="file"
          action={action}
          accept='.xlsx, .xls'
          showUploadList={false}
          beforeUpload={this.handleBeforeUpload}
          onChange={this.handleUploadChange}
        >
          <p className="ant-upload-drag-icon">
            <Icon type={uploadLoading ? 'loading' : 'inbox'} />
          </p>
          <p className="ant-upload-text">点击或将文件拖拽到这里上传</p>
          <p className="ant-upload-hint">支持扩展名：.xlsx, .xls</p>
        </Dragger>

        <Divider/>
        {
          dataSource.length ?
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <div className='import-preview-table-container' style={{ width: `${previewContainerWidth}px`, margin: '0 auto' }}>
              <Table
                width={tableWidth}
                height={500}
                headerHeight={60}
                rowHeight={40}
                rowCount={dataSource.length}
                rowGetter={({ index }) => dataSource[index]}
              >
                {
                  columns.map(column => (
                    <Column label={column.title} dataKey={column.dataIndex} key={column.key} width={250}/>
                  ))
                }
              </Table>
          </div>
          </div>
          : null
        }
      </Fragment>
    )
  }
};

export default ImportPreview;
