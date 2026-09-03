import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";

function CustomSelection({ label = "Business", url = "/business" }) {
  const [businesses, setBusinesses] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();

  const selected = searchParams.get("business") || "";

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const { data } = await api.get(url);

        const list = data.businesses || [];
        setBusinesses(list);

        // Set default only if business is not yet in the URL
        if (!searchParams.has("business")) {
          const defaultBusinessId =
            data.defaultBusinessId ?? list[0]?.business_id;

          if (defaultBusinessId) {
            const params = new URLSearchParams(searchParams);
            params.set("business", String(defaultBusinessId));

            setSearchParams(params, {
              replace: true,
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch businesses:", err);
      }
    };

    fetchBusinesses();
  }, [url]);

  const handleChange = (e) => {
    const params = new URLSearchParams(searchParams);
    params.set("business", e.target.value);

    setSearchParams(params);
  };

  return (
    <div className="d-flex align-items-center gap-2">
      <label htmlFor="business-select">{label}</label>

      <select
        id="business-select"
        className="form-select"
        value={selected}
        onChange={handleChange}
        disabled={businesses.length === 0}
      >
        {businesses.map((business) => (
          <option
            key={business.business_id}
            value={business.business_id}
          >
            {business.business_name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default CustomSelection;