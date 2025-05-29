import { Modal, Button, Alert, Typography, Divider, List, Avatar, Tag, Badge, Progress, Space, Spin, message } from 'antd';
import { 
  ThunderboltOutlined, 
  CheckCircleOutlined, 
  UserOutlined, 
  EnvironmentOutlined,
  LoadingOutlined,
  CheckOutlined
} from '@ant-design/icons';
import { useState } from 'react';

const { Text, Paragraph } = Typography;

const AIShortlistModal = ({ 
  visible, 
  onClose, 
  shortlistingResults, 
  loading, 
  onShortlist 
}) => {
  // Track shortlisted candidates
  const [shortlistedCandidates, setShortlistedCandidates] = useState([]);

  // Function to format score as percentage
  const formatScore = (score) => {
    return `${Math.round(score * 100)}%`;
  };

  // Handle shortlist button click
  const handleShortlist = (candidate) => {
    // Add candidate to shortlisted array
    setShortlistedCandidates([...shortlistedCandidates, candidate.candidate_id]);
    
    // Call the parent component's shortlist handler
    if (onShortlist) {
      onShortlist(candidate);
    } else {
      message.success(`${candidate.fullname} has been shortlisted!`);
    }
  };

  // Check if a candidate is already shortlisted
  const isShortlisted = (candidateId) => {
    return shortlistedCandidates.includes(candidateId);
  };

  return (
    <Modal
      title={
        <Space>
          <ThunderboltOutlined style={{ color: '#1890ff' }} />
          <span>AI Shortlisting Results</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>
      ]}
    >
      {shortlistingResults ? (
        <>
          <Alert
            message="AI-Powered Candidate Ranking"
            description="Candidates are ranked based on their skills, experience, and education match with job requirements."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          
          <Paragraph>
            <Text strong>Total Candidates Analyzed:</Text> {shortlistingResults.total_candidates}
            <Text strong style={{ marginLeft: 16 }}>Shortlisted:</Text> {shortlistedCandidates.length}
          </Paragraph>
          
          <Divider orientation="left">Ranked Candidates</Divider>
          
          <List
            itemLayout="horizontal"
            dataSource={shortlistingResults.candidates}
            renderItem={(candidate, index) => {
              const candidateShortlisted = isShortlisted(candidate.candidate_id);
              
              return (
                <List.Item
                  actions={[
                    candidateShortlisted ? (
                      <Button 
                        type="default" 
                        size="small"
                        icon={<CheckOutlined />}
                        disabled
                        style={{ backgroundColor: '#f6ffed', borderColor: '#b7eb8f', color: '#52c41a' }}
                      >
                        Shortlisted
                      </Button>
                    ) : (
                      <Button 
                        type="primary" 
                        size="small"
                        icon={<CheckCircleOutlined />}
                        onClick={() => handleShortlist(candidate)}
                      >
                        Shortlist
                      </Button>
                    )
                  ]}
                  className={candidateShortlisted ? 'shortlisted-candidate-row' : ''}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge count={index + 1} style={{ backgroundColor: index < 3 ? '#52c41a' : '#1890ff' }}>
                        <Avatar size={40} icon={<UserOutlined />} />
                      </Badge>
                    }
                    title={
                      <Space>
                        <Text strong>{candidate.fullname}</Text>
                        <Tag color="blue">{candidate.email}</Tag>
                        {candidateShortlisted && <Tag color="green">Shortlisted</Tag>}
                      </Space>
                    }
                    description={
                      <>
                        <div style={{ marginBottom: 8 }}>
                          <Text type="secondary">
                            {candidate.location && <><EnvironmentOutlined /> {candidate.location} · </>}
                            {candidate.years_experience && <>{candidate.years_experience} years experience</>}
                          </Text>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                          <Text strong style={{ marginRight: 8 }}>Match Score:</Text>
                          <Progress 
                            percent={Math.round(candidate.aggregate_score * 100)} 
                            size="small" 
                            status="active" 
                            showInfo={false}
                            style={{ width: 300 }}
                          />
                          <Text strong style={{ marginLeft: 8 }}>
                            {formatScore(candidate.aggregate_score)}
                          </Text>
                        </div>
                        <div>
                          <Text type="secondary">Skills Match: {formatScore(candidate.skill_score || 0)}</Text>
                          <Text type="secondary" style={{ marginLeft: 16 }}>Experience Match: {formatScore(candidate.experience_score || 0)}</Text>
                        </div>
                        {candidate.skill_match_details?.matched_skills?.length > 0 && (
                          <div style={{ marginTop: 8 }}>
                            <Text type="secondary">Matched Skills: </Text>
                            {candidate.skill_match_details.matched_skills.map((skill, i) => (
                              <Tag key={i} color="green">{skill.matched}</Tag>
                            ))}
                          </div>
                        )}
                        {candidate.skill_match_details?.missing_skills?.length > 0 && (
                          <div style={{ marginTop: 4 }}>
                            <Text type="secondary">Missing Skills: </Text>
                            {candidate.skill_match_details.missing_skills.map((skill, i) => (
                              <Tag key={i} color="orange">{skill}</Tag>
                            ))}
                          </div>
                        )}
                      </>
                    }
                  />
                </List.Item>
              );
            }}
          />
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
          <Text style={{ display: 'block', marginTop: 16 }}>Loading shortlisting results...</Text>
        </div>
      )}
    </Modal>
  );
};

export default AIShortlistModal;
