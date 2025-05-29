import { Upload, Button, Typography, message, Spin, Alert } from 'antd';
import { UploadOutlined, CloudUploadOutlined, FileTextOutlined, LoadingOutlined, WarningOutlined } from '@ant-design/icons';
import { uploadResume } from '../../services/profileService'; 

const { Title, Text } = Typography;

const ResumeUpload = ({ 
  onUpload, 
  fileList, 
  uploading,
  onRemove // New prop to check if profile is complete
}) => {

  const beforeUpload = () => {
    
    // Set uploading to true immediately when file is selected
    onUpload(false);
    return true;
  };

  const handleUpload = async (options) => {
    const { file, onSuccess, onError } = options;
    
    // Double check profile completion before upload

    
    try {
      const result = await uploadResume(file);
      onSuccess(result);
      onUpload && onUpload(file, result);
      message.success('Resume uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      onError(error);
      message.error('Failed to upload resume');
    }
  };

  return (
    <div style={{ 
      padding: '20px',
      background: '#ffffff',
      borderRadius: '12px',
      border: '2px dashed #d9d9d9',
      textAlign: 'center',
      height: '90%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '280px',
      position: 'relative',
    }}>
      {/* Blur overlay while uploading */}
      {uploading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: '12px',
        }}>
          <Spin 
            indicator={<LoadingOutlined style={{ fontSize: 36, color: '#1890ff' }} spin />} 
          />
          <Text style={{ marginTop: 12, color: '#1890ff', fontWeight: 'bold' }}>
            Processing resume...
          </Text>
        </div>
      )}
      
      <CloudUploadOutlined style={{ 
        fontSize: '40px', 
        color:  '#1890ff' , 
        marginBottom: '12px' 
      }} />
      
      <Title level={5} style={{ 
        marginBottom: '6px', 
        color: '#1890ff' ,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <FileTextOutlined style={{ marginRight: '6px' }} />
        Resume Upload
      </Title>
      
      <Text type="secondary" style={{ 
        marginBottom: '20px', 
        fontSize: '13px',
        textAlign: 'center',
        maxWidth: '240px'
      }}>
        Upload your resume to automatically extract and fill your profile information
      </Text>
      

      
      <Upload
        customRequest={handleUpload}
        beforeUpload={beforeUpload}
        fileList={fileList}
        maxCount={1}
        disabled={uploading}
        onRemove={onRemove}
        accept=".pdf,.doc,.docx,.txt"
        showUploadList={{
          showPreviewIcon: false,
          showRemoveIcon: true,
          showDownloadIcon: true,
        }}
      >
        <Button 
          type="primary"
          size="middle"
          icon={uploading ? null : <UploadOutlined />} 
          loading={uploading}
          style={{ 
            borderRadius: '6px',
            height: '40px',
            fontSize: '14px',
            minWidth: '160px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity:  1 
          }}
        >Upload
         
        </Button>
      </Upload>
      
      {fileList.length > 0 && !uploading && (
        <div style={{ 
          marginTop: '12px', 
          padding: '8px 12px', 
          background: '#f6ffed', 
          border: '1px solid #b7eb8f',
          borderRadius: '4px',
          maxWidth: '200px'
        }}>
          <Text style={{ color: '#52c41a', fontSize: '12px' }}>
            ✓ Resume uploaded successfully
          </Text>
        </div>
      )}
      
      <Text type="secondary" style={{ 
        marginTop: '12px', 
        fontSize: '11px',
        textAlign: 'center'
      }}>
        Supported: PDF, DOC, DOCX, TXT (Max 10MB)
      </Text>
    </div>
  );
};

export default ResumeUpload;
