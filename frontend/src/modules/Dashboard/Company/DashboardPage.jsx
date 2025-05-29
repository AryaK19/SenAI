import { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Badge, 
  Typography, 
  Spin, 
  Button, 
  Empty, 
  Tabs, 
  Input, 
  Select,
  Alert,
  Divider,
  Table,
  Tag,
  Space,
  Modal,
  Tooltip,
  Progress,
  List,
  Avatar,
  message
} from 'antd';
import { 
  ExclamationCircleOutlined, 
  LoadingOutlined, 
  UploadOutlined, 
  FileSearchOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  MailOutlined,
  EnvironmentOutlined,
  StarOutlined,
  StarFilled,
  RobotOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { fetchCompanyProfile } from '../../../services/companyService';
import { 
  fetchDashboardStats, 
  fetchAppliedCandidates, 
  rankCandidatesByAI 
} from '../../../services/companyService';
import CandidateCard from '../../../components/CandidateCard/CandidateCard';
import AIShortlistModal from '../../../components/AIShortlistModal/AIShortlistModal';
import './DashboardPage.css';

const { Text, Title, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Search } = Input;
const { Option } = Select;

const DashboardPage = () => {
  const navigate = useNavigate();
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingCandidates, setLoadingCandidates] = useState(true);
  const [stats, setStats] = useState({
    totalResumes: 0,
    shortlisted: 0,
    pending: 0
  });
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  // New states for candidate details modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  // New states for AI shortlisting
  const [shortlistingResults, setShortlistingResults] = useState(null);
  const [shortlistingModalVisible, setShortlistingModalVisible] = useState(false);
  const [shortlistingLoading, setShortlistingLoading] = useState(false);

  useEffect(() => {
    const getProfileData = async () => {
      try {
        setLoading(true);
        const data = await fetchCompanyProfile();
        setIsProfileComplete(data.profile_completed || false);
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    const getDashboardStats = async () => {
      try {
        const data = await fetchDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      }
    };

    getProfileData();
    getDashboardStats();
  }, []);

  useEffect(() => {
    const getCandidates = async () => {
      try {
        setLoadingCandidates(true);
        const data = await fetchAppliedCandidates();
        setCandidates(data);
        setFilteredCandidates(data);
      } catch (error) {
        console.error("Failed to fetch candidates:", error);
      } finally {
        setLoadingCandidates(false);
      }
    };

    getCandidates();
  }, []);

  // Filter candidates based on search term and active tab
  useEffect(() => {
    let filtered = [...candidates];
    
    // Apply tab filter
    if (activeTab === "shortlisted") {
      filtered = filtered.filter(candidate => candidate.shortlisted);
    } else if (activeTab === "pending") {
      filtered = filtered.filter(candidate => !candidate.shortlisted);
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(candidate => {
        const search = searchTerm.toLowerCase();
        return (
          candidate.fullname?.toLowerCase().includes(search) ||
          candidate.email?.toLowerCase().includes(search) ||
          candidate.location?.toLowerCase().includes(search) ||
          candidate.skills?.some(skill => skill.skill_name.toLowerCase().includes(search))
        );
      });
    }
    
    setFilteredCandidates(filtered);
  }, [candidates, activeTab, searchTerm]);

  // Handle candidate status change
  const handleCandidateStatusChange = (candidateId, shortlisted) => {
    // Update local state
    
    const updatedCandidates = candidates.map(candidate => {
      if (candidate.id === candidateId) {
        return { ...candidate, shortlisted };
      }
      return candidate;
    });
    
    setCandidates(updatedCandidates);
    
    // Update stats
    const shortlistedCount = updatedCandidates.filter(c => c.shortlisted).length;
    setStats({
      totalResumes: updatedCandidates.length,
      shortlisted: shortlistedCount,
      pending: updatedCandidates.length - shortlistedCount
    });
    
    // Update selected candidate if it's the one being modified
    if (selectedCandidate && selectedCandidate.id === candidateId) {
      setSelectedCandidate({ ...selectedCandidate, shortlisted });
    }
  };

  // Handle tab change
  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleCompleteProfile = () => {
    navigate('/profile');
  };

  // Show candidate details modal
  const showCandidateDetails = (candidate) => {
    setSelectedCandidate(candidate);
    setModalVisible(true);
  };

  // Handle AI shortlisting
  const handleAIShortlisting = async () => {
    try {
      setShortlistingLoading(true);
      const results = await rankCandidatesByAI();
      setShortlistingResults(results);
      setShortlistingModalVisible(true);
    } catch (error) {
      console.error("Failed to rank candidates:", error);
      message.error("Failed to rank candidates. Please try again.");
    } finally {
      setShortlistingLoading(false);
    }
  };

  // Format date string
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Define table columns
  const columns = [
    {
      title: 'Name',
      dataIndex: 'fullname',
      key: 'fullname',
      render: (text, record) => (
        <Space>
          {record.shortlisted && <StarFilled style={{ color: '#faad14' }} />}
          <Text strong>{text}</Text>
        </Space>
      ),
      sorter: (a, b) => a.fullname.localeCompare(b.fullname),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: email => (
        <Tooltip title={email}>
          <span><MailOutlined style={{ marginRight: 8 }} />{email.length > 20 ? `${email.substring(0, 20)}...` : email}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      render: location => location ? (
        <span><EnvironmentOutlined style={{ marginRight: 8 }} />{location}</span>
      ) : 'N/A',
    },
    {
      title: 'Applied On',
      dataIndex: 'applied_date',
      key: 'applied_date',
      render: date => formatDate(date),
      sorter: (a, b) => new Date(a.applied_date) - new Date(b.applied_date),
    },
    {
      title: 'Status',
      key: 'status',
      render: record => (
        <Tag color={record.shortlisted ? 'green' : 'blue'}>
          {record.shortlisted ? 'Shortlisted' : 'Under review'}
        </Tag>
      ),
      filters: [
        { text: 'Shortlisted', value: true },
        { text: 'Under review', value: false },
      ],
      onFilter: (value, record) => record.shortlisted === value,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="primary" 
            size="small"
            icon={<EyeOutlined />}
            onClick={() => showCandidateDetails(record)}
          >
            View Details
          </Button>
        </Space>
      ),
    },
  ];

  // Function to format score as percentage
  const formatScore = (score) => {
    return `${Math.round(score * 100)}%`;
  };

  if (loading) {
    return (
      <div className="dashboard-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      {!isProfileComplete && (
        <Alert
          message="Complete Your Profile"
          description="Please complete your job profile to start shortlisting candidates"
          type="warning"
          showIcon
          action={
            <Button size="small" type="primary" onClick={handleCompleteProfile}>
              Complete Profile
            </Button>
          }
          style={{ marginBottom: '24px' }}
        />
      )}
      
      <Row gutter={16} className="dashboard-stats">
        <Col xs={24} md={8}>
          <Card 
            hoverable 
            style={{ 
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            className="stat-card"
          >
            <Statistic 
              title="Total Resumes" 
              value={stats.totalResumes} 
              prefix={<FileSearchOutlined style={{ color: '#1890ff' }} />} 
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card 
            hoverable 
            style={{ 
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            className="stat-card"
          >
            <Statistic 
              title="Shortlisted" 
              value={stats.shortlisted} 
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card 
            hoverable 
            style={{ 
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            className="stat-card"
          >
            <Statistic 
              title="Pending Review" 
              value={stats.pending} 
              prefix={<ClockCircleOutlined style={{ color: '#fa8c16' }} />}
            />
          </Card>
        </Col>
      </Row>
      
      <Card className="candidates-container" title={<Title level={4}>Applied Candidates</Title>}>
        <div className="candidates-header">
          <Search
            placeholder="Search candidates by name, skills, or location"
            allowClear
            enterButton={<SearchOutlined />}
            onSearch={handleSearch}
            className="candidate-search"
          />
          
          <Space>
            <Button 
              icon={<RobotOutlined />} 
              onClick={handleAIShortlisting}
              type="default"
              loading={shortlistingLoading}
            >
              AI Shortlist
            </Button>
            <Button 
              icon={<UploadOutlined />} 
              onClick={() => navigate('/resume-upload')}
              type="primary"
            >
              Upload Resumes
            </Button>
          </Space>
        </div>
        
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane 
            tab={`All Candidates (${stats.totalResumes})`}
            key="all"
          />
          <TabPane 
            tab={`Shortlisted (${stats.shortlisted})`}
            key="shortlisted"
          />
          <TabPane 
            tab={`Pending (${stats.pending})`}
            key="pending"
          />
        </Tabs>
        
        {loadingCandidates ? (
          <div className="candidates-loading">
            <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
            <Text>Loading candidates...</Text>
          </div>
        ) : filteredCandidates.length === 0 ? (
          <Empty 
            description={
              <span>
                {searchTerm
                  ? "No candidates match your search"
                  : activeTab === "shortlisted"
                  ? "No candidates have been shortlisted yet"
                  : activeTab === "pending"
                  ? "No pending candidates to review"
                  : "No candidates have applied yet"}
              </span>
            }
          />
        ) : (
          <Table 
            columns={columns} 
            dataSource={filteredCandidates.map(c => ({...c, key: c.id}))}
            rowClassName={record => record.shortlisted ? 'shortlisted-row' : ''}
            pagination={{ pageSize: 10 }}
            size="middle"
          />
        )}
      </Card>
      
      {/* Candidate Details Modal */}
      <Modal
        title="Candidate Details"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={800}
        footer={null}
        destroyOnClose={true}
      >
        {selectedCandidate && (
          <CandidateCard 
            candidate={selectedCandidate} 
            onStatusChange={handleCandidateStatusChange}
          />
        )}
      </Modal>
      
      {/* AI Shortlisting Results Modal */}
      <AIShortlistModal
        visible={shortlistingModalVisible}
        onClose={() => setShortlistingModalVisible(false)}
        shortlistingResults={shortlistingResults}
        loading={shortlistingLoading}
        onShortlist={(candidate) => {
          handleCandidateStatusChange(candidate.candidate_id, true);
          setShortlistingModalVisible(false);
          message.success(`${candidate.fullname} has been shortlisted!`);
        }}
      />
    </div>
  );
};

export default DashboardPage;