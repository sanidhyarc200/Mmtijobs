import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PostJob() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    jobTitle: "Software Engineer",
    customJobTitle: "",
    jobType: "Full-time",
    qualification: "B.Tech",
    customQualification: "",
    location: "",
    salaryMin: "",
    salaryMax: "",
    hiringProcess: [],
    passFrom: "",
    passTo: "",
    expFrom: "",
    expTo: "",
    cgpa: "",
    gender: "Any",
    description: "",
  });

  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      let updated = [...form.hiringProcess];
      if (checked) updated.push(value);
      else updated = updated.filter((v) => v !== value);
      setForm({ ...form, hiringProcess: updated });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.location.trim()) newErrors.location = "Location is required";
    if (!form.salaryMin || form.salaryMin <= 0) newErrors.salaryMin = "Enter valid minimum salary";
    if (!form.salaryMax || form.salaryMax <= 0 || parseFloat(form.salaryMax) < parseFloat(form.salaryMin))
      newErrors.salaryMax = "Max salary should be greater than or equal to min salary";
    if (!form.passFrom) newErrors.passFrom = "Passing year from required";
    if (!form.passTo || parseInt(form.passTo) < parseInt(form.passFrom)) newErrors.passTo = "Enter a valid passing year range";
    if (!form.expFrom) newErrors.expFrom = "Experience from required";
    if (!form.expTo || parseFloat(form.expTo) < parseFloat(form.expFrom)) newErrors.expTo = "Enter a valid experience range";
    if (!form.description.trim()) newErrors.description = "Description required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const title = form.jobTitle === "other" ? form.customJobTitle.trim() : form.jobTitle;
    const qualification = form.qualification === "other" ? form.customQualification.trim() : form.qualification;

    const job = {
      id: Date.now(),
      title,
      jobType: form.jobType,
      qualification,
      location: form.location.trim(),
      salary: `${form.salaryMin} - ${form.salaryMax} LPA`,
      hiringProcess: form.hiringProcess,
      passingYearRange: `${form.passFrom} - ${form.passTo}`,
      experienceRange: `${form.expFrom} - ${form.expTo}`,
      cgpa: form.cgpa,
      gender: form.gender,
      description: form.description.trim(),
    };

    const existing = JSON.parse(localStorage.getItem("jobs")) || [];
    localStorage.setItem("jobs", JSON.stringify([...existing, job]));

    setShowSuccess(true);
    setTimeout(() => {
      navigate("/");
    }, 2000);
  };

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleSubmit}>
        <h2 style={styles.heading}>Post a New Job</h2>
        <div style={styles.grid}>

          {/* Job Title */}
          <div style={styles.group}>
            <label>Job Title</label>
            <select name="jobTitle" value={form.jobTitle} onChange={handleChange} style={styles.input}>
              <option>Software Engineer</option>
              <option>Data Analyst</option>
              <option>Product Manager</option>
              <option>UI/UX Designer</option>
              <option value="other">Other</option>
            </select>
          </div>

          {form.jobTitle === "other" && (
            <div style={styles.group}>
              <label>Custom Job Title</label>
              <input
                name="customJobTitle"
                value={form.customJobTitle}
                onChange={handleChange}
                placeholder="Enter custom title"
                style={styles.input}
              />
            </div>
          )}

          {/* Job Type */}
          <div style={styles.group}>
            <label>Job Type</label>
            <select name="jobType" value={form.jobType} onChange={handleChange} style={styles.input}>
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
              <option>Internship</option>
              <option>Freelance</option>
            </select>
          </div>

          {/* Qualification */}
          <div style={styles.group}>
            <label>Qualification</label>
            <select name="qualification" value={form.qualification} onChange={handleChange} style={styles.input}>
              <option>B.Tech</option>
              <option>MCA</option>
              <option>B.Sc</option>
              <option>M.Tech</option>
              <option value="other">Other</option>
            </select>
          </div>

          {form.qualification === "other" && (
            <div style={styles.group}>
              <label>Custom Qualification</label>
              <input
                name="customQualification"
                value={form.customQualification}
                onChange={handleChange}
                placeholder="Your degree"
                style={styles.input}
              />
            </div>
          )}

          {/* Location */}
          <div style={styles.group}>
            <label>Job Location</label>
            <input name="location" value={form.location} onChange={handleChange} style={styles.input} />
            {errors.location && <p style={styles.error}>{errors.location}</p>}
          </div>

          {/* Salary */}
          <div style={styles.group}>
            <label>Min Salary (LPA)</label>
            <input name="salaryMin" type="number" value={form.salaryMin} onChange={handleChange} style={styles.input} />
            {errors.salaryMin && <p style={styles.error}>{errors.salaryMin}</p>}
          </div>

          <div style={styles.group}>
            <label>Max Salary (LPA)</label>
            <input name="salaryMax" type="number" value={form.salaryMax} onChange={handleChange} style={styles.input} />
            {errors.salaryMax && <p style={styles.error}>{errors.salaryMax}</p>}
          </div>

          {/* Hiring Process */}
          <div style={{ gridColumn: "1/-1" }}>
            <label>Hiring Process</label>
            <div style={styles.checkboxGroup}>
              {["Face-to-Face", "Group Discussion", "Telephonic", "Virtual", "Written Test", "Walk-in"].map((process) => (
                <label key={process} style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    value={process}
                    checked={form.hiringProcess.includes(process)}
                    onChange={handleChange}
                  />
                  {process}
                </label>
              ))}
            </div>
          </div>

          {/* Passing Year */}
          <div style={styles.group}>
            <label>Passing Year From</label>
            <input name="passFrom" type="number" value={form.passFrom} onChange={handleChange} style={styles.input} />
            {errors.passFrom && <p style={styles.error}>{errors.passFrom}</p>}
          </div>
          <div style={styles.group}>
            <label>Passing Year To</label>
            <input name="passTo" type="number" value={form.passTo} onChange={handleChange} style={styles.input} />
            {errors.passTo && <p style={styles.error}>{errors.passTo}</p>}
          </div>

          {/* Experience */}
          <div style={styles.group}>
            <label>Experience From (years)</label>
            <input name="expFrom" type="number" value={form.expFrom} onChange={handleChange} style={styles.input} />
            {errors.expFrom && <p style={styles.error}>{errors.expFrom}</p>}
          </div>
          <div style={styles.group}>
            <label>Experience To (years)</label>
            <input name="expTo" type="number" value={form.expTo} onChange={handleChange} style={styles.input} />
            {errors.expTo && <p style={styles.error}>{errors.expTo}</p>}
          </div>

          {/* CGPA */}
          <div style={styles.group}>
            <label>Required CGPA / %</label>
            <input name="cgpa" value={form.cgpa} onChange={handleChange} style={styles.input} />
          </div>

          {/* Gender */}
          <div style={styles.group}>
            <label>Gender Preference</label>
            <select name="gender" value={form.gender} onChange={handleChange} style={styles.input}>
              <option>Any</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>

          {/* Description */}
          <div style={{ gridColumn: "1/-1" }}>
            <label>Job Description</label>
            <textarea
              name="description"
              rows={5}
              value={form.description}
              onChange={handleChange}
              style={{ ...styles.input, resize: "vertical" }}
            />
            {errors.description && <p style={styles.error}>{errors.description}</p>}
          </div>
        </div>

        <button type="submit" style={styles.btn}>Post Job</button>
        {showSuccess && <div style={styles.success}>✅ Job posted successfully!</div>}
      </form>
    </div>
  );
}

const styles = {
  container: { padding: "40px 5%", maxWidth: 1000, margin: "auto" },
  form: {
    backgroundColor: "white",
    padding: 40,
    borderRadius: 14,
    boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
  },
  heading: {
    color: "#0056b3",
    fontSize: "1.8rem",
    marginBottom: 30,
    fontWeight: 700,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: 24,
  },
  group: { display: "flex", flexDirection: "column" },
  input: {
    padding: "12px",
    border: "1px solid #d1d5db",
    borderRadius: 10,
    fontSize: "1rem",
    marginTop: 6,
  },
  checkboxGroup: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10,
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "#f3f4f6",
    padding: "8px 14px",
    borderRadius: 8,
    fontSize: "0.95em",
    fontWeight: 500,
    cursor: "pointer",
  },
  btn: {
    backgroundColor: "#0056b3",
    color: "white",
    padding: "14px 28px",
    border: "none",
    borderRadius: 10,
    fontWeight: 600,
    fontSize: "1em",
    cursor: "pointer",
    marginTop: 30,
  },
  error: { color: "red", fontSize: "0.9em", marginTop: 4 },
  success: {
    marginTop: 20,
    textAlign: "center",
    fontSize: "1.1em",
    fontWeight: 600,
    color: "green",
  },
};
