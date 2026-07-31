import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HRDashboard() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user || user.role !== "hr") {
      navigate("/");
      return;
    }


    const dynamic =
      JSON.parse(localStorage.getItem("registeredCompanies")) || [];

    setCompanies(dynamic);
  }, [navigate]);

  const filtered = useMemo(() => {
    return companies.filter((c) => {
      return (
        (c.companyName || "").toLowerCase().includes(filters.name.toLowerCase()) &&
        (c.email || "").toLowerCase().includes(filters.email.toLowerCase()) &&
        (c.contact || "").toLowerCase().includes(filters.phone.toLowerCase())
      );
    });
  }, [companies, filters]);

  return (
    <div className="hr-layout">
      <h1 className="page-title">HR Dashboard</h1>
      <p className="page-sub">Manage & view all registered recruiters</p>

      {/* STATS */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Total Clients</div>
          <div className="stat-value">{companies.length}</div>
        </div>
      </div>

      {/* PANEL */}
      <div className="panel">
        <div className="panel-header">
          <h3>Recruiters / Clients</h3>
        </div>

        {/* FILTERS */}
        <div className="filter-bar">
          <input
            placeholder="Company name"
            value={filters.name}
            onChange={(e) =>
              setFilters({ ...filters, name: e.target.value })
            }
          />
          <input
            placeholder="Email"
            value={filters.email}
            onChange={(e) =>
              setFilters({ ...filters, email: e.target.value })
            }
          />
          <input
            placeholder="Phone"
            value={filters.phone}
            onChange={(e) =>
              setFilters({ ...filters, phone: e.target.value })
            }
          />
        </div>

        {/* TABLE */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Email</th>
                <th>Contact</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length ? (
                filtered.map((c, i) => (
                  <tr key={i}>
                    <td>{c.companyName || "-"}</td>
                    <td>{c.email || "-"}</td>
                    <td>{c.contact || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="empty">
                    No recruiters found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .hr-layout {
          padding: 24px;
          max-width: 1400px;
          margin: auto;
        }
        .page-title {
          font-size: 30px;
          font-weight: 900;
          color: #0a66c2;
        }
        .page-sub {
          color: #6b7280;
          margin-bottom: 18px;
        }
        .stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit,minmax(220px,1fr));
          gap: 16px;
          margin-bottom: 20px;
        }
        .stat-card {
          background: linear-gradient(135deg,#0a66c2,#0047a8);
          color: white;
          padding: 20px;
          border-radius: 16px;
          box-shadow: 0 12px 30px rgba(0,0,0,.2);
        }
        .stat-label {
          font-size: 14px;
          opacity: .85;
        }
        .stat-value {
          font-size: 34px;
          font-weight: 900;
        }
        .panel {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 8px 26px rgba(0,0,0,.08);
          overflow: hidden;
        }
        .panel-header {
          padding: 16px 20px;
          border-bottom: 1px solid #eef2f7;
        }
        .filter-bar {
          display: grid;
          grid-template-columns: repeat(auto-fit,minmax(200px,1fr));
          gap: 12px;
          padding: 16px;
          background: #f8fafc;
        }
        .filter-bar input {
          height: 44px;
          padding: 0 14px;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          font-size: 14px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 14px;
          border-bottom: 1px solid #eef2f7;
          text-align: left;
        }
        th {
          background: #f8fafc;
          font-weight: 800;
        }
        tr:hover td {
          background: #f1f7ff;
        }
        .empty {
          text-align: center;
          padding: 24px;
          color: #6b7280;
        }
      `}</style>
    </div>
  );
}
