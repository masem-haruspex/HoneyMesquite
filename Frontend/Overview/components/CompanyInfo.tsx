// Overview/components/CompanyInfo.tsx
import './CompanyInfo.scss';

interface CompanyInfoProps {
  company: any;
}

export default function CompanyInfo({ company }: CompanyInfoProps) {
  return (
    <div className="company-info-container">
      <div className="company-header">
        <h1 className="company-name">{company.name}</h1>
        <div className="company-subheader">
          <span className="ticker">{company.ticker}</span>
          <span className="industry">{company.industry}</span>
        </div>
      </div>

      <div className="company-grid">
        <div className="info-section">
          <h3>Corporate Overview</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Founded</label>
              <span>{company.founded}</span>
            </div>
            <div className="info-item">
              <label>Headquarters</label>
              <span>{company.headquarters}</span>
            </div>
            <div className="info-item">
              <label>CEO</label>
              <span>{company.ceo}</span>
            </div>
            <div className="info-item">
              <label>Employees</label>
              <span>{company.employees.toLocaleString()}</span>
            </div>
            <div className="info-item">
              <label>Fiscal Year End</label>
              <span>{company.fiscalYearEnd}</span>
            </div>
          </div>
        </div>

        <div className="info-section">
          <h3>Financial Summary</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Market Cap</label>
              <span>${(company.marketCap / 1e9).toFixed(1)}B</span>
            </div>
            <div className="info-item">
              <label>Annual Revenue</label>
              <span>${(company.revenue / 1e9).toFixed(1)}B</span>
            </div>
            <div className="info-item">
              <label>Net Income</label>
              <span className="income">${(company.netIncome / 1e6).toFixed(0)}M</span>
            </div>
            <div className="info-item">
              <label>Credit Rating</label>
              <span className="accent">{company.creditRating}</span>
            </div>
            <div className="info-item">
              <label>Next Earnings</label>
              <span>{company.nextEarnings}</span>
            </div>
          </div>
        </div>

        <div className="info-section">
          <h3>Performance Metrics</h3>
          <div className="metric-bars">
            <div className="metric-bar">
              <label>Sustainability Score</label>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{ width: `${company.sustainabilityScore}%` }}
                ></div>
              </div>
              <span>{company.sustainabilityScore}/100</span>
            </div>
            <div className="metric-bar">
              <label>Innovation Index</label>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{ width: `${company.innovationIndex}%`, background: '#00B4FF' }}
                ></div>
              </div>
              <span>{company.innovationIndex}/100</span>
            </div>
            <div className="metric-bar">
              <label>Customer Satisfaction</label>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{ width: `${company.customerSatisfaction}%`, background: '#00FFAA' }}
                ></div>
              </div>
              <span>{company.customerSatisfaction}/100</span>
            </div>
          </div>
        </div>

        <div className="info-section">
          <h3>Contact & Social</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Website</label>
              <a href={company.website} target="_blank" rel="noreferrer">
                {company.website}
              </a>
            </div>
            <div className="info-item">
              <label>Email</label>
              <a href={`mailto:${company.email}`}>{company.email}</a>
            </div>
            <div className="info-item">
              <label>Phone</label>
              <span>{company.phone}</span>
            </div>
            <div className="info-item">
              <label>Twitter</label>
              <span>{(company.socialMediaFollowers.twitter / 1e6).toFixed(1)}M followers</span>
            </div>
            <div className="info-item">
              <label>LinkedIn</label>
              <span>{(company.socialMediaFollowers.linkedin / 1e6).toFixed(1)}M followers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
