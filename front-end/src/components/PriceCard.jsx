import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { FaSchool, FaChartLine, FaUniversity, FaTags } from 'react-icons/fa';
import "../styles/PriceCard.css";

const PriceCard = forwardRef((props, ref) => {
    const [stages, setStages] = useState([
        { id: 1, name: "المرحلة الابتدائية", details: "السنة 5 - الأكمل 11-15", icon: FaSchool, active: false, price: "" },
        { id: 2, name: "المرحلة المتوسطة", details: "العام 6 - الأكمل 14-18", icon: FaChartLine, active: false, price: "" },
        { id: 3, name: "المرحلة الثانوية", details: "السنة 9 - الأكمل 12-14", icon: FaUniversity, active: false, price: "" },
    ]);

    const toggleActive = (id) => {
        setStages((prev) =>
            prev.map((stage) =>
                stage.id === id ? { ...stage, active: !stage.active } : stage
            )
        );
    };

    const handlePriceChange = (id, newPrice) => {
        setStages((prev) =>
            prev.map((stage) =>
                stage.id === id ? { ...stage, price: newPrice } : stage
            )
        );
    };

    // دالة التحقق من صحة المراحل والأسعار
    const validateStages = () => {
        const activeStages = stages.filter(stage => stage.active === true);
        if (activeStages.length === 0) return false;
        
        return activeStages.every(stage => {
            const price = stage.price;
            return price !== '' && price !== null && !isNaN(parseFloat(price)) && parseFloat(price) >= 0;
        });
    };

    useImperativeHandle(ref, () => ({
        validateStages
    }));

    return (
        <div className="price-card-container">
            <div className="price-card-header">
                <FaTags className="header-icon" />
                <h3>المراحل والأسعار</h3>
            </div>
            <div className="stages-list">
                {stages.map((stage) => (
                    <div key={stage.id} className="stage-item">
                        <div className="stage-icon"><stage.icon /></div>
                        <div className="stage-info">
                            <h4>{stage.name}</h4>
                            <p>{stage.details}</p>
                        </div>
                        <label className="toggle-switch">
                            <input type="checkbox" checked={stage.active} onChange={() => toggleActive(stage.id)} />
                            <span className="toggle-slider"></span>
                        </label>
                        <div className="price-input-wrapper">
                            <input
                                type="number"
                                className={`price-input ${!stage.active ? "disabled-input" : ""}`}
                                value={stage.price}
                                onChange={(e) => handlePriceChange(stage.id, e.target.value)}
                                placeholder="السعر"
                                min="0"
                                step="1000"
                                disabled={!stage.active}
                            />
                            <span className="currency">ل.س</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});

export default PriceCard;
