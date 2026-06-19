import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import PublicLeadDetails from "./PublicLeadDetails";
import PrivateLeadDetails from "./PrivateLeadDetails";
import api from "../../api/api.js";

export default function LeadDetailsContainer() {
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const { data } = await api.get(`/leads/${id}`);
        setLead(data);
      } catch (err) {
        setError(err.response?.data?.detail || "لم يتم العثور على الطلب");
      } finally {
        setLoading(false);
      }
    };

    fetchLead();
  }, [id]);

  if (loading) return <div style={{ textAlign: "center", padding: "4rem" }}>جاري التحميل...</div>;
  if (error || !lead) return <div style={{ textAlign: "center", padding: "4rem", color: "red" }}>{error || "لا توجد بيانات"}</div>;

  return lead.is_public ? (
    <PublicLeadDetails lead={lead} />
  ) : (
    <PrivateLeadDetails lead={lead} />
  );
}