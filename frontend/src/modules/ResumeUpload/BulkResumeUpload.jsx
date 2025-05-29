import { useState, useEffect } from 'react';
import { 
  Card, 
  Upload, 
  Button, 
  Typography, 
  message, 
  Alert, 
  Modal, 
  List, 
  Tag, 
  Statistic,
  Row,
  Col,
  Spin,
  Badge
} from 'antd';
import { 
  UploadOutlined, 
  FileZipOutlined, 
  ExclamationCircleOutlined, 
  LoadingOutlined 
} from '@ant-design/icons';
import { fetchCompanyProfile, bulkUploadResumes } from '../../services/companyService';
import './BulkResumeUpload.css';

const { Text, Title } = Typography;
const { Dragger } = Upload;

const BulkResumeUpload = () => {
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  useEffect(() => {
    const getProfileData = async () => {
      try {
        setLoading(true);
        const data = await fetchCompanyProfile();
        setIsProfileComplete(data.profile_completed || false);
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
        // Keep isProfileComplete as false if there's an error
      } finally {
        setLoading(false);
      }
    };

    getProfileData();
  }, []);

  const handleUploadChange = ({ file }) => {
    // Update to better handle the file object
    if (file) {
      // Store the raw file object (not just the reference)
      setUploadFile(file.originFileObj || file);
      
      // Debug information to confirm the file is captured correctly
      console.log('File captured:', file.name, 'Size:', file.size);
    }
  };

  const handleBulkUpload = async () => {
    if (!uploadFile) {
      message.error('Please select a ZIP file to upload');
      return;
    }

    if (!uploadFile.name.endsWith('.zip')) {
      message.error('Only ZIP files are supported for bulk upload');
      return;
    }

    try {
      setUploading(true);
      
      // Log file details before upload
      console.log('Uploading file:', uploadFile.name, 'Size:', uploadFile.size, 'Type:', uploadFile.type);
      
      // Add a small delay to ensure UI updates before the potentially heavy upload operation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const result = await bulkUploadResumes(uploadFile);
      
      if (!result) {
        throw new Error('No response received from server');
      }
      
      setUploadResult(result);
      setShowModal(true);
      message.success('Bulk upload processed successfully');
    } catch (error) {
      console.error('Upload error details:', error);
      message.error(`Upload failed: ${error.message || 'Unknown error. Check console for details.'}`);
    } finally {
      setUploading(false);
      // Don't clear the uploadFile here to allow user to retry with the same file if needed
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setUploadResult(null);
  };

  if (loading) {
    return (
      <div className="bulk-upload-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
      </div>
    );
  }

  return (
    <div className="bulk-upload-container">
      <h1>Bulk Resume Upload</h1>
      
      <Card className="upload-card">
        <Alert
          message="Upload multiple resumes at once"
          description="Upload a ZIP file containing multiple resumes (PDF, DOC, DOCX, TXT). Candidates will be automatically created and linked to your company."
          type="info"
          showIcon
          style={{ marginBottom: '20px' }}
        />
        
        <div className="custom-upload-container">
          <Dragger
            name="resumes"
            multiple={false}
            beforeUpload={(file) => {
              // Validate file type and size here
              if (!file.name.endsWith('.zip')) {
                message.error('Only ZIP files are supported');
                return false;
              }
              
              // Allow the Upload component to handle the file, but prevent auto-upload
              return false;
            }}
            onChange={handleUploadChange}
            disabled={!isProfileComplete || uploading}
            accept=".zip"
            className="improved-upload-dragger"
            listType="picture"
            showUploadList={false}
          >
            <div className="upload-dragger-content">
              <p className="ant-upload-drag-icon">
                <FileZipOutlined style={{ fontSize: '52px', color: '#1890ff' }} />
              </p>
              <p className="ant-upload-text">
                Click or drag a ZIP file to this area to upload
              </p>
              <p className="ant-upload-hint">
                Only ZIP files containing multiple resumes are supported
              </p>
              
              {uploadFile && (
                <div className="selected-file">
                  <Badge count={1} color="#1890ff" offset={[0, 10]}>
                    <Text strong>{uploadFile.name} ({Math.round(uploadFile.size/1024)} KB)</Text>
                  </Badge>
                </div>
              )}
            </div>
          </Dragger>
        </div>
        
        <div className="upload-actions">
          <Button
            type="primary"
            onClick={handleBulkUpload}
            disabled={!uploadFile || !isProfileComplete || uploading}
            loading={uploading}
            icon={<UploadOutlined />}
            size="large"
          >
            {uploading ? 'Uploading...' : 'Start Upload'}
          </Button>
          
          {uploadFile && !uploading && (
            <Button 
              onClick={() => setUploadFile(null)}
              style={{ marginLeft: 10 }}
            >
              Clear
            </Button>
          )}
        </div>
        
        {!isProfileComplete && (
          <div className="upload-warning">
            <Text type="warning">
              <ExclamationCircleOutlined style={{ marginRight: 6 }} />
              Complete your company profile to enable bulk resume upload
            </Text>
          </div>
        )}
      </Card>
      
      <Modal
        title="Bulk Upload Results"
        open={showModal}
        onCancel={closeModal}
        footer={[
          <Button key="close" onClick={closeModal}>
            Close
          </Button>
        ]}
        width={700}
      >
        {uploadResult && (
          <div className="upload-results">
            <div className="result-summary">
              <Title level={4}>Summary</Title>
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic 
                    title="Total Processed" 
                    value={uploadResult.total_files} 
                    suffix={`file${uploadResult.total_files !== 1 ? 's' : ''}`}
                  />
                </Col>
                <Col span={8}>
                  <Statistic 
                    title="New Candidates" 
                    value={uploadResult.candidates_created.length}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic 
                    title="New Applications" 
                    value={uploadResult.candidates_applied.length}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
              </Row>
              
              {uploadResult.errors.length > 0 && (
                <Alert
                  message={`${uploadResult.errors.length} error${uploadResult.errors.length !== 1 ? 's' : ''} occurred during processing`}
                  type="warning"
                  showIcon
                  style={{ margin: '16px 0' }}
                />
              )}
            </div>
            
            {uploadResult.candidates_created.length > 0 && (
              <div className="result-section">
                <Title level={5}>Newly Created Candidates</Title>
                <List
                  size="small"
                  bordered
                  dataSource={uploadResult.candidates_created}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        title={item.name}
                        description={item.email}
                      />
                      <Tag color="green">New</Tag>
                    </List.Item>
                  )}
                  style={{ marginBottom: 16 }}
                />
              </div>
            )}
            
            {uploadResult.candidates_applied.length > 0 && (
              <div className="result-section">
                <Title level={5}>Candidates Applied to Job</Title>
                <List
                  size="small"
                  bordered
                  dataSource={uploadResult.candidates_applied}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        title={item.name}
                        description={item.email}
                      />
                      <Tag color="blue">Applied</Tag>
                    </List.Item>
                  )}
                  style={{ marginBottom: 16 }}
                />
              </div>
            )}
            
            {uploadResult.errors.length > 0 && (
              <div className="result-section">
                <Title level={5}>Errors</Title>
                <List
                  size="small"
                  bordered
                  dataSource={uploadResult.errors}
                  renderItem={error => (
                    <List.Item>
                      <List.Item.Meta
                        title={error.filename}
                        description={error.error}
                      />
                      <Tag color="red">Error</Tag>
                    </List.Item>
                  )}
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BulkResumeUpload;
