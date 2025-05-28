import { Card, Row, Col, Statistic } from 'antd';

const CandidateDashboardPage = () => {
  return (
    <div className="dashboard-container">
      <h1>Candidate Dashboard</h1>
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic title="Applications Sent" value={12} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Interviews Scheduled" value={3} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Profile Views" value={45} />
          </Card>
        </Col>
      </Row>
      {/* More candidate dashboard content will be added later */}
    </div>
  );
};

export default CandidateDashboardPage;
